from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer, Numeric, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institute_id = Column(UUID(as_uuid=True), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="SET NULL"))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    exam_stream = Column(String(50))
    status = Column(String(20), default="draft")
    scheduled_date = Column(Date, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    total_marks = Column(Numeric(8, 2), nullable=False)
    passing_marks = Column(Numeric(8, 2), nullable=False)
    negative_marking_enabled = Column(Boolean, default=False)
    show_result_immediately = Column(Boolean, default=True)
    shuffle_questions = Column(Boolean, default=False)
    shuffle_options = Column(Boolean, default=False)
    max_attempts = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    institute = relationship("Institute", back_populates="assignments")
    assignment_questions = relationship("AssignmentQuestion", back_populates="assignment", order_by="AssignmentQuestion.order_index")
    submissions = relationship("Submission", back_populates="assignment")


class AssignmentQuestion(Base):
    __tablename__ = "assignment_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, nullable=False)

    assignment = relationship("Assignment", back_populates="assignment_questions")
    question = relationship("Question", back_populates="assignment_questions")
