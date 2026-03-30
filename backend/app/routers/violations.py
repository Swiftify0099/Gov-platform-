from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db
from app.redis_client import get_redis
from app.models.submission import Submission
from app.models.violation import Violation
from app.schemas.violation import ViolationCreate, ViolationResponse
from app.dependencies import get_current_student, get_current_admin, get_current_user
from app.services.storage_service import save_violation_screenshot
from app.config import settings
from app.models.user import User
from datetime import datetime, timezone
from typing import List
import logging

router = APIRouter(prefix="/api/violations", tags=["violations"])
logger = logging.getLogger(__name__)


@router.post("", response_model=ViolationResponse)
async def log_violation(
    payload: ViolationCreate,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
    redis_conn=Depends(get_redis),
):
    # Verify submission belongs to student
    result = await db.execute(
        select(Submission).where(
            Submission.id == payload.submission_id,
            Submission.student_id == current_user.id,
            Submission.status == "in_progress"
        )
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Active submission not found")

    # Count existing violations
    existing_count_result = await db.execute(
        select(Violation).where(Violation.submission_id == payload.submission_id)
    )
    violation_count = len(existing_count_result.scalars().all())
    new_violation_number = violation_count + 1

    # Save screenshot if provided
    screenshot_path = None
    if payload.screenshot_base64:
        try:
            screenshot_path = await save_violation_screenshot(
                payload.screenshot_base64,
                str(payload.submission_id),
                new_violation_number
            )
        except Exception as e:
            logger.warning(f"Failed to save screenshot: {e}")

    # Create violation record
    violation = Violation(
        submission_id=payload.submission_id,
        student_id=current_user.id,
        assignment_id=submission.assignment_id,
        violation_type=payload.violation_type,
        description=payload.description,
        screenshot_path=screenshot_path,
        violation_number=new_violation_number,
        occurred_at=datetime.now(timezone.utc),
    )
    db.add(violation)

    # Update submission violation count
    await db.execute(
        update(Submission).where(Submission.id == payload.submission_id).values(
            violation_count=new_violation_number
        )
    )
    await db.commit()
    await db.refresh(violation)

    # Auto-submit if max violations reached
    auto_submitted = False
    if new_violation_number >= settings.MAX_VIOLATIONS:
        await db.execute(
            update(Submission).where(Submission.id == payload.submission_id).values(
                status="auto_submitted",
                submitted_at=datetime.now(timezone.utc)
            )
        )
        await db.commit()
        auto_submitted = True

    return ViolationResponse(
        id=str(violation.id),
        violation_number=new_violation_number,
        violation_type=payload.violation_type,
        auto_submitted=auto_submitted,
        remaining_warnings=max(0, settings.MAX_VIOLATIONS - new_violation_number),
    )
