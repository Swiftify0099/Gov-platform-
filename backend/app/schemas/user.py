from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
import uuid


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    exam_stream: Optional[str] = None
    preferred_language: Optional[str] = None

    @validator("preferred_language")
    def validate_language(cls, v):
        if v and v not in ["en", "mr", "hi"]:
            raise ValueError("Language must be en, mr, or hi")
        return v

    @validator("exam_stream")
    def validate_stream(cls, v):
        valid_streams = ["MPSC", "UPSC", "Group B", "Group C", "Group D", "All India Services"]
        if v and v not in valid_streams:
            raise ValueError(f"Exam stream must be one of {valid_streams}")
        return v


class UserResponse(BaseModel):
    id: uuid.UUID
    phone_number: str
    full_name: Optional[str]
    email: Optional[str]
    role: str
    exam_stream: Optional[str]
    preferred_language: str
    profile_photo_url: Optional[str]
    is_profile_complete: bool
    institute_id: Optional[uuid.UUID]
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
        json_encoders = {uuid.UUID: str}


class UserCreate(BaseModel):
    phone_number: str
    full_name: Optional[str] = None
    role: str = "student"

    @validator("phone_number")
    def validate_phone(cls, v):
        cleaned = v.replace("+91", "").replace(" ", "").strip()
        if not cleaned.isdigit() or len(cleaned) != 10:
            raise ValueError("Invalid Indian phone number")
        return cleaned
