from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.dependencies import require_role
from app.models.user import User, UserRole
from app.models.assignment import Assignment
from app.models.submission import Submission
from app.models.violation import Violation
from app.models.institute import Institute
from app.models.payment import Payment

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/super-admin")
async def super_admin_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Platform-wide analytics for super admin."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Total users
    total_users = await db.scalar(select(func.count(User.id)))
    new_users = await db.scalar(
        select(func.count(User.id)).where(User.created_at >= since)
    )

    # Total institutes
    total_institutes = await db.scalar(select(func.count(Institute.id)))

    # Total submissions
    total_submissions = await db.scalar(select(func.count(Submission.id)))

    # Total revenue
    total_revenue = await db.scalar(
        select(func.sum(Payment.amount)).where(Payment.status == "success")
    )

    # Violations in period
    violations_count = await db.scalar(
        select(func.count(Violation.id)).where(Violation.detected_at >= since)
    )

    return {
        "period_days": days,
        "users": {
            "total": total_users or 0,
            "new_in_period": new_users or 0,
        },
        "institutes": {"total": total_institutes or 0},
        "submissions": {"total": total_submissions or 0},
        "revenue": {"total_inr": float(total_revenue or 0)},
        "violations": {"count_in_period": violations_count or 0},
    }


@router.get("/institute")
async def institute_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Analytics for institute admin."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    institute_result = await db.execute(
        select(Institute).where(Institute.admin_id == current_user.id)
    )
    institute = institute_result.scalar_one_or_none()
    if not institute:
        return {"error": "No institute found"}

    # Student stats
    total_students = await db.scalar(
        select(func.count(User.id)).where(
            and_(User.institute_id == institute.id, User.role == UserRole.STUDENT)
        )
    )

    # Submission stats
    submissions_result = await db.execute(
        select(func.count(Submission.id), func.avg(Submission.score_percentage))
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .where(
            and_(
                Assignment.institute_id == institute.id,
                Submission.submitted_at >= since,
            )
        )
    )
    sub_count, avg_score = submissions_result.one()

    # Pass rate
    pass_count = await db.scalar(
        select(func.count(Submission.id))
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .where(
            and_(
                Assignment.institute_id == institute.id,
                Submission.is_passed == True,
                Submission.submitted_at >= since,
            )
        )
    )

    return {
        "period_days": days,
        "total_students": total_students or 0,
        "submissions": {
            "count": sub_count or 0,
            "avg_score_percentage": round(float(avg_score or 0), 2),
            "pass_count": pass_count or 0,
            "pass_rate": round((pass_count or 0) / max(sub_count or 1, 1) * 100, 2),
        },
    }
