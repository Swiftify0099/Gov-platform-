from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class GPTExplainRequest(BaseModel):
    question_id: UUID
    language: Optional[str] = "en"


class GPTExplainResponse(BaseModel):
    question_id: str
    explanation: str
    language: str
    cached: bool
