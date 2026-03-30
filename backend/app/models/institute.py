from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Institute(Base):
    __tablename__ = "institutes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    address = Column(Text)
    phone = Column(String(15))
    email = Column(String(255))
    logo_path = Column(String(500))
    is_active = Column(Boolean, default=True)
    subscription_expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    users = relationship("User", back_populates="institute")
    courses = relationship("Course", back_populates="institute")
    questions = relationship("Question", back_populates="institute")
    assignments = relationship("Assignment", back_populates="institute")
