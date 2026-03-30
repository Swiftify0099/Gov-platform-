from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
import json
import csv
import io
from app.database import get_db
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionResponse, QuestionUpdate, BulkUploadResult
from app.dependencies import get_current_admin
from app.services.storage_service import save_question_file
from app.models.user import User
import logging

router = APIRouter(prefix="/api/questions", tags=["questions"])
logger = logging.getLogger(__name__)


@router.get("", response_model=List[QuestionResponse])
async def list_questions(
    skip: int = 0,
    limit: int = 50,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    exam_stream: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Question).where(Question.is_active == True)
    if current_user.role != "super_admin":
        query = query.where(Question.institute_id == current_user.institute_id)
    if topic:
        query = query.where(Question.topic == topic)
    if difficulty:
        query = query.where(Question.difficulty == difficulty)
    if exam_stream:
        query = query.where(Question.exam_stream == exam_stream)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=QuestionResponse, status_code=201)
async def create_question(
    payload: QuestionCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    question = Question(
        **payload.model_dump(),
        created_by=current_user.id,
        institute_id=current_user.institute_id,
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


@router.post("/bulk/json", response_model=BulkUploadResult)
async def bulk_upload_json(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    try:
        data = json.loads(content)
        questions_data = data.get("questions", [])
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")

    created = 0
    errors = []

    for idx, q in enumerate(questions_data):
        try:
            question = Question(
                text=q["text"],
                language=q.get("language", "en"),
                option_a=q["options"][0],
                option_b=q["options"][1],
                option_c=q["options"][2],
                option_d=q["options"][3],
                correct_answers=q["correct_answers"],
                marks=q.get("marks", 1.0),
                negative_marks=q.get("negative_marks", 0.0),
                difficulty=q.get("difficulty", "Medium"),
                topic=q.get("topic"),
                explanation=q.get("explanation"),
                exam_stream=q.get("exam_stream"),
                created_by=current_user.id,
                institute_id=current_user.institute_id,
            )
            db.add(question)
            created += 1
        except (KeyError, IndexError) as e:
            errors.append(f"Row {idx + 1}: {str(e)}")

    await db.commit()
    return BulkUploadResult(
        created=created,
        errors=errors,
        total=len(questions_data)
    )


@router.post("/bulk/csv", response_model=BulkUploadResult)
async def bulk_upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    created = 0
    errors = []

    for idx, row in enumerate(reader):
        try:
            correct_answers = [int(x.strip()) for x in row["correct_answers"].split(",")]
            question = Question(
                text=row["text"],
                language=row.get("language", "en"),
                option_a=row["option_a"],
                option_b=row["option_b"],
                option_c=row["option_c"],
                option_d=row["option_d"],
                correct_answers=correct_answers,
                marks=float(row.get("marks", 1.0)),
                negative_marks=float(row.get("negative_marks", 0.0)),
                difficulty=row.get("difficulty", "Medium"),
                topic=row.get("topic"),
                explanation=row.get("explanation"),
                created_by=current_user.id,
                institute_id=current_user.institute_id,
            )
            db.add(question)
            created += 1
        except Exception as e:
            errors.append(f"Row {idx + 2}: {str(e)}")

    await db.commit()
    return BulkUploadResult(created=created, errors=errors, total=created + len(errors))
