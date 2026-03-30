from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
import os
from app.database import get_db
from app.models.user import User
from app.services.storage_service import save_profile_photo, get_file_url
from app.dependencies import get_current_student, get_current_user
from app.config import settings
import logging

router = APIRouter(prefix="/api/uploads", tags=["uploads"])
logger = logging.getLogger(__name__)


@router.post("/profile-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    relative_path = await save_profile_photo(file, str(current_user.id))
    photo_url = f"/api/uploads/profile/{relative_path.replace(os.sep, '/')}"

    await db.execute(
        update(User).where(User.id == current_user.id).values(
            profile_photo_path=relative_path,
            profile_photo_url=photo_url,
        )
    )
    await db.commit()

    return {
        "message": "Profile photo uploaded successfully",
        "photo_url": photo_url,
        "path": relative_path,
    }


@router.get("/profile/{year}/{month}/{filename}")
async def serve_profile_photo(
    year: str, month: str, filename: str,
    current_user: User = Depends(get_current_user),
):
    filepath = os.path.join(settings.PROFILE_PHOTO_DIR, year, month, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)


@router.get("/violations/{year}/{month}/{filename}")
async def serve_violation_screenshot(
    year: str, month: str, filename: str,
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("institute_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    filepath = os.path.join(settings.VIOLATION_SCREENSHOT_DIR, year, month, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)
