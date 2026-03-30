from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List, Optional
import uuid

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.institute import Institute, Course
from app.models.assignment import Assignment
from app.models.submission import Submission
from app.models.violation import Violation

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.get("/dashboard/stats")
async def get_admin_dashboard_stats(
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get institute admin dashboard statistics."""
    # Get institute
    institute_result = await db.execute(
        select(Institute).where(Institute.admin_id == current_user.id)
    )
    institute = institute_result.scalar_one_or_none()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    # Student count
    student_count_result = await db.execute(
        select(func.count(User.id)).where(
            and_(User.institute_id == institute.id, User.role == UserRole.STUDENT)
        )
    )
    student_count = student_count_result.scalar() or 0

    # Assignment count
    assignment_count_result = await db.execute(
        select(func.count(Assignment.id)).where(Assignment.institute_id == institute.id)
    )
    assignment_count = assignment_count_result.scalar() or 0

    # Total submissions
    submission_count_result = await db.execute(
        select(func.count(Submission.id)).join(
            Assignment, Submission.assignment_id == Assignment.id
        ).where(Assignment.institute_id == institute.id)
    )
    submission_count = submission_count_result.scalar() or 0

    # Total violations
    violation_count_result = await db.execute(
        select(func.count(Violation.id)).join(
            Submission, Violation.submission_id == Submission.id
        ).join(Assignment, Submission.assignment_id == Assignment.id).where(
            Assignment.institute_id == institute.id
        )
    )
    violation_count = violation_count_result.scalar() or 0

    return {
        "institute": {
            "id": str(institute.id),
            "name": institute.name,
        },
        "stats": {
            "total_students": student_count,
            "total_assignments": assignment_count,
            "total_submissions": submission_count,
            "total_violations": violation_count,
        }
    }


@router.get("/students")
async def list_institute_students(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List all students under this institute."""
    institute_result = await db.execute(
        select(Institute).where(Institute.admin_id == current_user.id)
    )
    institute = institute_result.scalar_one_or_none()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    query = select(User).where(
        and_(User.institute_id == institute.id, User.role == UserRole.STUDENT)
    )
    if search:
        query = query.where(
            User.full_name.ilike(f"%{search}%") | User.phone_number.contains(search)
        )

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0

    result = await db.execute(query.offset((page - 1) * limit).limit(limit))
    students = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "students": [
            {
                "id": str(s.id),
                "full_name": s.full_name,
                "phone_number": s.phone_number,
                "email": s.email,
                "exam_stream": s.exam_stream,
                "profile_photo_url": s.profile_photo_url,
                "is_active": s.is_active,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in students
        ],
    }
