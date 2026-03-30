from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime, date, time
import uuid


class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    exam_stream: str
    scheduled_date: date
    start_time: time
    end_time: time
    duration_minutes: int
    total_marks: float
    passing_marks: float
    negative_marking_enabled: bool = False
    batch_id: Optional[uuid.UUID] = None

    class Config:
        json_encoders = {uuid.UUID: str}


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    total_marks: Optional[float] = None
    passing_marks: Optional[float] = None
    negative_marking_enabled: Optional[bool] = None
    is_active: Optional[bool] = None


class AssignmentResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    institute_id: uuid.UUID
    exam_stream: str
    scheduled_date: date
    start_time: time
    end_time: time
    duration_minutes: int
    total_marks: float
    passing_marks: float
    negative_marking_enabled: bool
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
        json_encoders = {uuid.UUID: str}
