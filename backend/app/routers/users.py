from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, and_
from typing import List, Optional
import uuid

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me")
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """Get the current authenticated user's profile."""
    return {
        "id": str(current_user.id),
        "phone_number": current_user.phone_number,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.value,
        "exam_stream": current_user.exam_stream,
        "preferred_language": current_user.preferred_language,
        "profile_photo_url": current_user.profile_photo_url,
        "is_profile_complete": current_user.is_profile_complete,
        "institute_id": str(current_user.institute_id) if current_user.institute_id else None,
        "is_active": current_user.is_active,
    }


@router.put("/me")
async def update_profile(
    full_name: Optional[str] = None,
    email: Optional[str] = None,
    exam_stream: Optional[str] = None,
    preferred_language: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""
    if full_name is not None:
        current_user.full_name = full_name
    if email is not None:
        current_user.email = email
    if exam_stream is not None:
        current_user.exam_stream = exam_stream
    if preferred_language is not None:
        current_user.preferred_language = preferred_language

    # Mark profile complete if all required fields present
    if (
        current_user.full_name
        and current_user.profile_photo_url
        and current_user.exam_stream
    ):
        current_user.is_profile_complete = True

    await db.commit()
    await db.refresh(current_user)
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "exam_stream": current_user.exam_stream,
        "preferred_language": current_user.preferred_language,
        "is_profile_complete": current_user.is_profile_complete,
    }


@router.get("/{user_id}")
async def get_user_by_id(
    user_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get any user by ID (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user.id),
        "phone_number": user.phone_number,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.value,
        "exam_stream": user.exam_stream,
        "is_active": user.is_active,
        "profile_photo_url": user.profile_photo_url,
        "is_profile_complete": user.is_profile_complete,
    }


@router.patch("/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    await db.commit()
    return {"is_active": user.is_active}
