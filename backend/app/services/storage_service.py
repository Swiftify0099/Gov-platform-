import os
import uuid
import aiofiles
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException
from app.config import settings
import logging

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _ensure_dir(path: str) -> None:
    Path(path).mkdir(parents=True, exist_ok=True)


def _get_dated_subdir(base_dir: str) -> str:
    now = datetime.now()
    subdir = os.path.join(base_dir, str(now.year), f"{now.month:02d}")
    _ensure_dir(subdir)
    return subdir


async def save_profile_photo(file: UploadFile, user_id: str) -> str:
    """Save profile photo to local filesystem. Returns relative path."""
    await _validate_image(file)
    ext = ALLOWED_MIME_TYPES.get(file.content_type, ".jpg")
    subdir = _get_dated_subdir(settings.PROFILE_PHOTO_DIR)
    filename = f"{user_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(subdir, filename)

    content = await file.read()
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    # Return relative path for DB storage
    rel_path = os.path.relpath(filepath, settings.LOCAL_STORAGE_ROOT)
    logger.info(f"Profile photo saved: {rel_path}")
    return rel_path


async def save_violation_screenshot(base64_data: str, submission_id: str, violation_num: int) -> str:
    """Save violation screenshot from base64. Returns relative path."""
    import base64
    _ensure_dir(settings.VIOLATION_SCREENSHOT_DIR)
    subdir = _get_dated_subdir(settings.VIOLATION_SCREENSHOT_DIR)
    filename = f"{submission_id}_v{violation_num}_{uuid.uuid4().hex[:8]}.jpg"
    filepath = os.path.join(subdir, filename)

    # Strip data URL prefix if present
    if "base64," in base64_data:
        base64_data = base64_data.split("base64,")[1]

    image_data = base64.b64decode(base64_data)
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(image_data)

    return os.path.relpath(filepath, settings.LOCAL_STORAGE_ROOT)


async def save_question_file(file: UploadFile, institute_id: str) -> str:
    """Save bulk question upload file."""
    allowed_types = {"application/json", "text/csv", "application/vnd.ms-excel"}
    if file.content_type not in allowed_types and not file.filename.endswith((".json", ".csv")):
        raise HTTPException(status_code=400, detail="Only JSON and CSV files are allowed")

    _ensure_dir(settings.QUESTION_FILE_DIR)
    subdir = _get_dated_subdir(settings.QUESTION_FILE_DIR)
    ext = ".json" if file.filename.endswith(".json") else ".csv"
    filename = f"{institute_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(subdir, filename)

    content = await file.read()
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    return os.path.relpath(filepath, settings.LOCAL_STORAGE_ROOT)


def get_file_url(relative_path: str, base_url: str) -> str:
    """Generate public URL for a stored file."""
    return f"{base_url}/api/uploads/{relative_path.replace(os.sep, '/')}"


async def _validate_image(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_MIME_TYPES.keys())}"
        )
    # Check size
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB}MB"
        )
    await file.seek(0)


async def cleanup_temp_files() -> int:
    """Remove temp files older than retention period."""
    import time
    removed = 0
    temp_dir = settings.TEMP_DIR
    if not os.path.exists(temp_dir):
        return 0

    cutoff = time.time() - (settings.TEMP_FILE_RETENTION_HOURS * 3600)
    for root, dirs, files in os.walk(temp_dir):
        for fname in files:
            fpath = os.path.join(root, fname)
            if os.path.getmtime(fpath) < cutoff:
                os.remove(fpath)
                removed += 1

    logger.info(f"Cleaned up {removed} temp files")
    return removed
