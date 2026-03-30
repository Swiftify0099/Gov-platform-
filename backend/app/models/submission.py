from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Numeric, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="in_progress")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True))
    time_taken_seconds = Column(Integer)
    total_score = Column(Numeric(8, 2), default=0)
    correct_count = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)
    skipped_count = Column(Integer, default=0)
    violation_count = Column(Integer, default=0)
    face_verified = Column(Boolean, default=False)
    rank = Column(Integer)
    percentile = Column(Numeric(5, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
    answers = relationship("SubmissionAnswer", back_populates="submission")
    violations = relationship("Violation", back_populates="submission")


class SubmissionAnswer(Base):
    __tablename__ = "submission_answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    selected_options = Column(ARRAY(Integer), default=[])
    is_correct = Column(Boolean)
    marks_awarded = Column(Numeric(5, 2), default=0)
    time_spent_seconds = Column(Integer, default=0)
    answered_at = Column(DateTime(timezone=True))

    submission = relationship("Submission", back_populates="answers")
    question = relationship("Question")
