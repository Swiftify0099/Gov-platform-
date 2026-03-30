from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class SubmissionCreate(BaseModel):
    assignment_id: UUID
    face_verified: bool = False


class SubmissionResponse(BaseModel):
    id: UUID
    assignment_id: UUID
    student_id: UUID
    status: str
    started_at: datetime
    face_verified: bool

    class Config:
        from_attributes = True


class AnswerSubmit(BaseModel):
    question_id: UUID
    selected_options: List[int]
    time_spent_seconds: int = 0


class SubmitExamRequest(BaseModel):
    submit_reason: Optional[str] = "submitted"


class ResultResponse(BaseModel):
    submission_id: str
    total_score: float
    total_marks: float
    percentage: float
    correct_count: int
    wrong_count: int
    skipped_count: int
    time_taken_seconds: int
    passed: bool
