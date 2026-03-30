from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Numeric, ARRAY, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institute_id = Column(UUID(as_uuid=True), ForeignKey("institutes.id", ondelete="CASCADE"))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    language = Column(String(5), default="en")
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_answers = Column(ARRAY(Integer), nullable=False)
    marks = Column(Numeric(5, 2), default=1.0)
    negative_marks = Column(Numeric(5, 2), default=0.0)
    difficulty = Column(String(20), default="Medium")
    topic = Column(String(255))
    explanation = Column(Text)
    exam_stream = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    institute = relationship("Institute", back_populates="questions")
    assignment_questions = relationship("AssignmentQuestion", back_populates="question")
