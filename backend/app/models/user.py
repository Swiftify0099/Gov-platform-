import enum
from sqlalchemy import Column, String, Boolean, Enum, ForeignKey, DateTime, Text, ARRAY, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    INSTITUTE_ADMIN = "institute_admin"
    STUDENT = "student"


class LanguageCode(str, enum.Enum):
    EN = "en"
    MR = "mr"
    HI = "hi"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    name = Column(String(255))
    email = Column(String(255))
    role = Column(Enum(UserRole, name="user_role"), nullable=False, default=UserRole.STUDENT)
    institute_id = Column(UUID(as_uuid=True), ForeignKey("institutes.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_phone_verified = Column(Boolean, default=False)
    profile_photo_path = Column(String(500))
    profile_photo_url = Column(String(500))
    language_preference = Column(Enum(LanguageCode, name="language_code"), default=LanguageCode.EN)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True))

    institute = relationship("Institute", back_populates="users")
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    submissions = relationship("Submission", back_populates="student")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    exam_streams = Column(ARRAY(String), default=[])
    date_of_birth = Column(String(20))
    gender = Column(String(20))
    city = Column(String(100))
    state = Column(String(100))
    profile_completed = Column(Boolean, default=False)
    total_exams_taken = Column(Integer, default=0)
    total_score = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="student_profile")
