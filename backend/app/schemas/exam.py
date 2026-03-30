from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class ExamSessionCreate(BaseModel):
    assignment_id: uuid.UUID
    face_verified: bool = False


class ExamSessionResponse(BaseModel):
    id: uuid.UUID
    assignment_id: uuid.UUID
    student_id: uuid.UUID
    started_at: datetime
    face_verified: bool
    is_active: bool

    class Config:
        from_attributes = True
        json_encoders = {uuid.UUID: str}


class AnswerSubmit(BaseModel):
    question_id: uuid.UUID
    selected_options: List[int]  # indices of selected answers
    time_spent_seconds: Optional[int] = None
