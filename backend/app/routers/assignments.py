from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.assignment import Assignment, AssignmentQuestion
from app.models.institute import Institute
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentResponse

router = APIRouter(prefix="/api/v1/assignments", tags=["Assignments"])


@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    data: AssignmentCreate,
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Create a new assignment/exam schedule."""
    institute_result = await db.execute(
        select(Institute).where(Institute.admin_id == current_user.id)
    )
    institute = institute_result.scalar_one_or_none()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    assignment = Assignment(
        title=data.title,
        description=data.description,
        institute_id=institute.id,
        exam_stream=data.exam_stream,
        scheduled_date=data.scheduled_date,
        start_time=data.start_time,
        end_time=data.end_time,
        duration_minutes=data.duration_minutes,
        total_marks=data.total_marks,
        passing_marks=data.passing_marks,
        negative_marking_enabled=data.negative_marking_enabled,
        batch_id=data.batch_id,
        is_active=True,
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment


@router.get("/", response_model=List[AssignmentResponse])
async def list_assignments(
    stream: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List assignments visible to the current user."""
    now = datetime.now(timezone.utc)

    query = select(Assignment).where(Assignment.is_active == True)

    # Students see their institute's assignments
    if current_user.role == UserRole.STUDENT:
        if current_user.institute_id:
            query = query.where(Assignment.institute_id == current_user.institute_id)
        if stream:
            query = query.where(Assignment.exam_stream == stream)
    elif current_user.role == UserRole.INSTITUTE_ADMIN:
        institute_result = await db.execute(
            select(Institute).where(Institute.admin_id == current_user.id)
        )
        institute = institute_result.scalar_one_or_none()
        if institute:
            query = query.where(Assignment.institute_id == institute.id)

    result = await db.execute(query.offset((page - 1) * limit).limit(limit))
    assignments = result.scalars().all()
    return assignments


@router.get("/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(
    assignment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single assignment by ID."""
    result = await db.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


@router.put("/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(
    assignment_id: uuid.UUID,
    data: AssignmentUpdate,
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Update an assignment."""
    result = await db.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(assignment, field, value)

    await db.commit()
    await db.refresh(assignment)
    return assignment


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assignment(
    assignment_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.INSTITUTE_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Delete/deactivate an assignment."""
    result = await db.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.is_active = False
    await db.commit()
