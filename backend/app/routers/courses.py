from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.database import get_db
from app.dependencies import require_role
from app.models.user import User, UserRole
from app.models.institute import Institute, Course, Batch

router = APIRouter(prefix="/api/v1/courses", tags=["Courses"])


@router.post("/")
async def create_course(
    name: str,
    description: str = "",
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Create a new course/subject."""
    institute_result = await db.execute(
        select(Institute).where(Institute.admin_id == current_user.id)
    )
    institute = institute_result.scalar_one_or_none()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    course = Course(
        name=name,
        description=description,
        institute_id=institute.id,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return {"id": str(course.id), "name": course.name, "description": course.description}


@router.get("/")
async def list_courses(
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List all courses for this institute."""
    institute_result = await db.execute(
        select(Institute).where(Institute.admin_id == current_user.id)
    )
    institute = institute_result.scalar_one_or_none()
    if not institute:
        return []

    result = await db.execute(
        select(Course).where(Course.institute_id == institute.id)
    )
    courses = result.scalars().all()
    return [{"id": str(c.id), "name": c.name, "description": c.description} for c in courses]


@router.post("/batches")
async def create_batch(
    name: str,
    course_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Create a new batch/class."""
    batch = Batch(name=name, course_id=course_id)
    db.add(batch)
    await db.commit()
    await db.refresh(batch)
    return {"id": str(batch.id), "name": batch.name, "course_id": str(batch.course_id)}


@router.get("/batches")
async def list_batches(
    course_id: uuid.UUID = None,
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List all batches."""
    query = select(Batch)
    if course_id:
        query = query.where(Batch.course_id == course_id)

    result = await db.execute(query)
    batches = result.scalars().all()
    return [{"id": str(b.id), "name": b.name, "course_id": str(b.course_id)} for b in batches]
