from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
import uuid

from app.database import get_db
from app.dependencies import require_role
from app.models.user import User, UserRole
from app.models.institute import Institute

router = APIRouter(prefix="/api/v1/institutes", tags=["Institutes"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_institute(
    name: str,
    description: str = "",
    contact_email: str = "",
    contact_phone: str = "",
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Super admin creates a new institute."""
    institute = Institute(
        name=name,
        description=description,
        contact_email=contact_email,
        contact_phone=contact_phone,
        admin_id=None,
        is_active=True,
    )
    db.add(institute)
    await db.commit()
    await db.refresh(institute)
    return {
        "id": str(institute.id),
        "name": institute.name,
        "is_active": institute.is_active,
    }


@router.get("/")
async def list_institutes(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Super admin lists all institutes."""
    query = select(Institute)
    if search:
        query = query.where(Institute.name.ilike(f"%{search}%"))

    result = await db.execute(query.offset((page - 1) * limit).limit(limit))
    institutes = result.scalars().all()
    return [
        {
            "id": str(i.id),
            "name": i.name,
            "description": i.description,
            "contact_email": i.contact_email,
            "contact_phone": i.contact_phone,
            "is_active": i.is_active,
            "admin_id": str(i.admin_id) if i.admin_id else None,
        }
        for i in institutes
    ]


@router.get("/{institute_id}")
async def get_institute(
    institute_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get institute details."""
    result = await db.execute(select(Institute).where(Institute.id == institute_id))
    institute = result.scalar_one_or_none()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    return {
        "id": str(institute.id),
        "name": institute.name,
        "description": institute.description,
        "contact_email": institute.contact_email,
        "is_active": institute.is_active,
    }


@router.patch("/{institute_id}/assign-admin")
async def assign_admin_to_institute(
    institute_id: uuid.UUID,
    admin_user_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Assign an institute admin user to an institute."""
    result = await db.execute(select(Institute).where(Institute.id == institute_id))
    institute = result.scalar_one_or_none()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    # Verify the target user exists and has admin role
    user_result = await db.execute(select(User).where(User.id == admin_user_id))
    admin = user_result.scalar_one_or_none()
    if not admin:
        raise HTTPException(status_code=404, detail="User not found")
    if admin.role != UserRole.INSTITUTE_ADMIN:
        raise HTTPException(status_code=400, detail="User is not an Institute Admin")

    institute.admin_id = admin_user_id
    admin.institute_id = institute.id
    await db.commit()
    return {"message": "Admin assigned successfully"}


@router.patch("/{institute_id}/toggle-active")
async def toggle_institute_active(
    institute_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable an institute."""
    result = await db.execute(select(Institute).where(Institute.id == institute_id))
    institute = result.scalar_one_or_none()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    institute.is_active = not institute.is_active
    await db.commit()
    return {"is_active": institute.is_active}
