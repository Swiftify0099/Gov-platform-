from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from datetime import datetime, timezone
from typing import List
from app.database import get_db
from app.redis_client import get_redis
from app.models.assignment import Assignment, AssignmentQuestion
from app.models.submission import Submission, SubmissionAnswer
from app.models.question import Question
from app.schemas.submission import (
    SubmissionCreate, SubmissionResponse, AnswerSubmit,
    SubmitExamRequest, ResultResponse
)
from app.dependencies import get_current_student, get_current_user
from app.services.score_service import calculate_score, calculate_percentage
from app.models.user import User
import logging
import random

router = APIRouter(prefix="/api/submissions", tags=["submissions"])
logger = logging.getLogger(__name__)


@router.post("", response_model=SubmissionResponse)
async def start_exam(
    payload: SubmissionCreate,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    # Check profile photo
    if not current_user.profile_photo_path:
        raise HTTPException(
            status_code=400,
            detail="Profile photo required before starting exam"
        )

    # Get assignment
    result = await db.execute(
        select(Assignment).where(
            Assignment.id == payload.assignment_id,
            Assignment.is_active == True
        )
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check time window
    now = datetime.now(timezone.utc)
    if now < assignment.start_time:
        raise HTTPException(status_code=400, detail="Exam has not started yet")
    if now > assignment.end_time:
        raise HTTPException(status_code=400, detail="Exam time has ended")

    # Check existing submission
    existing = await db.execute(
        select(Submission).where(
            Submission.assignment_id == payload.assignment_id,
            Submission.student_id == current_user.id
        )
    )
    existing_sub = existing.scalar_one_or_none()
    if existing_sub:
        if existing_sub.status in ("submitted", "auto_submitted", "timed_out"):
            raise HTTPException(status_code=400, detail="Already submitted this exam")
        return existing_sub

    # Create submission
    submission = Submission(
        assignment_id=payload.assignment_id,
        student_id=current_user.id,
        face_verified=payload.face_verified,
        status="in_progress",
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return submission


@router.put("/{submission_id}/answer")
async def save_answer(
    submission_id: str,
    payload: AnswerSubmit,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Submission).where(
            Submission.id == submission_id,
            Submission.student_id == current_user.id,
            Submission.status == "in_progress"
        )
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Active submission not found")

    # Upsert answer
    existing = await db.execute(
        select(SubmissionAnswer).where(
            SubmissionAnswer.submission_id == submission_id,
            SubmissionAnswer.question_id == payload.question_id
        )
    )
    answer = existing.scalar_one_or_none()

    if answer:
        answer.selected_options = payload.selected_options
        answer.time_spent_seconds = payload.time_spent_seconds
        answer.answered_at = datetime.now(timezone.utc)
    else:
        answer = SubmissionAnswer(
            submission_id=submission_id,
            question_id=payload.question_id,
            selected_options=payload.selected_options,
            time_spent_seconds=payload.time_spent_seconds,
            answered_at=datetime.now(timezone.utc),
        )
        db.add(answer)

    await db.commit()
    return {"message": "Answer saved"}


@router.post("/{submission_id}/submit", response_model=ResultResponse)
async def submit_exam(
    submission_id: str,
    payload: SubmitExamRequest,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Submission).where(
            Submission.id == submission_id,
            Submission.student_id == current_user.id
        )
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if submission.status in ("submitted", "auto_submitted", "timed_out"):
        raise HTTPException(status_code=400, detail="Already submitted")

    # Get assignment
    assignment = await db.get(Assignment, submission.assignment_id)

    # Get all answers with questions
    answers_result = await db.execute(
        select(SubmissionAnswer, Question).join(
            Question, SubmissionAnswer.question_id == Question.id
        ).where(SubmissionAnswer.submission_id == submission_id)
    )
    answer_rows = answers_result.all()

    # Build answer data for scoring
    answer_data = []
    for sa, q in answer_rows:
        answer_data.append({
            "question_id": str(q.id),
            "selected_options": sa.selected_options or [],
            "correct_answers": q.correct_answers,
            "marks": float(q.marks),
            "negative_marks": float(q.negative_marks),
        })

    # Get all questions to find skipped ones
    all_qs = await db.execute(
        select(AssignmentQuestion).where(
            AssignmentQuestion.assignment_id == submission.assignment_id
        )
    )
    all_question_ids = {str(aq.question_id) for aq in all_qs.scalars()}
    answered_ids = {a["question_id"] for a in answer_data}
    skipped_ids = all_question_ids - answered_ids

    score_result = calculate_score(
        answer_data,
        negative_marking=assignment.negative_marking_enabled
    )

    # Update submission answers with scores
    for ans_dict in score_result["answers"]:
        await db.execute(
            update(SubmissionAnswer).where(
                SubmissionAnswer.submission_id == submission_id,
                SubmissionAnswer.question_id == ans_dict["question_id"]
            ).values(
                is_correct=ans_dict["is_correct"],
                marks_awarded=ans_dict["marks_awarded"]
            )
        )

    # Update submission
    now = datetime.now(timezone.utc)
    time_taken = int((now - submission.started_at).total_seconds())

    submission.status = payload.submit_reason or "submitted"
    submission.submitted_at = now
    submission.time_taken_seconds = time_taken
    submission.total_score = score_result["total_score"]
    submission.correct_count = score_result["correct_count"]
    submission.wrong_count = score_result["wrong_count"]
    submission.skipped_count = len(skipped_ids)

    await db.commit()
    await db.refresh(submission)

    percentage = calculate_percentage(
        float(submission.total_score),
        float(assignment.total_marks)
    )

    return ResultResponse(
        submission_id=str(submission.id),
        total_score=float(submission.total_score),
        total_marks=float(assignment.total_marks),
        percentage=percentage,
        correct_count=submission.correct_count,
        wrong_count=submission.wrong_count,
        skipped_count=submission.skipped_count,
        time_taken_seconds=submission.time_taken_seconds,
        passed=float(submission.total_score) >= float(assignment.passing_marks),
    )
