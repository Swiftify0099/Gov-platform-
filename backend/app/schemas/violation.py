from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class ViolationCreate(BaseModel):
    submission_id: UUID
    violation_type: str
    description: Optional[str] = None
    screenshot_base64: Optional[str] = None


class ViolationResponse(BaseModel):
    id: str
    violation_number: int
    violation_type: str
    auto_submitted: bool
    remaining_warnings: int
