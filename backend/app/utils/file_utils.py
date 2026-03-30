import os
import shutil
from pathlib import Path
from typing import Optional
import mimetypes
from fastapi import UploadFile, HTTPException, status
from loguru import logger
from app.config import settings


def validate_file(file: UploadFile, max_size_mb: Optional[float] = None) -> None:
    """Validate file MIME type and size."""
    # Check content type
    if file.content_type not in settings.allowed_image_types_list:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type {file.content_type} not allowed. Allowed: {settings.ALLOWED_IMAGE_TYPES}",
        )

    max_mb = max_size_mb or settings.MAX_UPLOAD_SIZE_MB
    # Can't easily check size before reading, so we check after
    return None


def get_file_extension(filename: str, content_type: str) -> str:
    """Get safe file extension from content type or filename."""
    ext_map = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }
    if content_type in ext_map:
        return ext_map[content_type]
    if filename and "." in filename:
        return Path(filename).suffix.lower()
    return ".jpg"


def sanitize_filename(filename: str) -> str:
    """Remove dangerous characters from filename."""
    safe = "".join(c for c in filename if c.isalnum() or c in "._-")
    return safe[:50] if safe else "file"
