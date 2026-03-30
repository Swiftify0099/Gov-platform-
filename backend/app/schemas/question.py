from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class QuestionCreate(BaseModel):
    text: str
    language: str = "en"
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answers: List[int]
    marks: float = 1.0
    negative_marks: float = 0.0
    difficulty: str = "Medium"
    topic: Optional[str] = None
    explanation: Optional[str] = None
    exam_stream: Optional[str] = None


class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_answers: Optional[List[int]] = None
    marks: Optional[float] = None
    negative_marks: Optional[float] = None
    difficulty: Optional[str] = None
    topic: Optional[str] = None
    explanation: Optional[str] = None


class QuestionResponse(BaseModel):
    id: UUID
    text: str
    language: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answers: List[int]
    marks: float
    negative_marks: float
    difficulty: str
    topic: Optional[str]
    explanation: Optional[str]
    exam_stream: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BulkUploadResult(BaseModel):
    created: int
    errors: List[str]
    total: int
