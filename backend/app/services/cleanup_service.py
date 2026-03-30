import os
import glob
from datetime import datetime, timedelta, timezone
from pathlib import Path
from loguru import logger
from app.config import settings


async def cleanup_temp_files() -> int:
    """Delete temp files older than the configured retention period."""
    cutoff = datetime.now(timezone.utc) - timedelta(
        hours=settings.TEMP_FILE_RETENTION_HOURS
    )
    cutoff_timestamp = cutoff.timestamp()

    temp_dir = settings.TEMP_DIR
    if not os.path.exists(temp_dir):
        return 0

    deleted_count = 0
    for filepath in Path(temp_dir).rglob("*"):
        if filepath.is_file():
            try:
                file_mtime = filepath.stat().st_mtime
                if file_mtime < cutoff_timestamp:
                    filepath.unlink()
                    deleted_count += 1
            except Exception as e:
                logger.warning(f"Could not delete temp file {filepath}: {e}")

    if deleted_count > 0:
        logger.info(f"Cleanup: deleted {deleted_count} temp files")

    return deleted_count


async def cleanup_old_violation_screenshots(retention_days: int = 90) -> int:
    """Delete violation screenshots older than retention period."""
    cutoff_timestamp = (
        datetime.now(timezone.utc) - timedelta(days=retention_days)
    ).timestamp()

    screenshot_dir = settings.VIOLATION_SCREENSHOT_DIR
    if not os.path.exists(screenshot_dir):
        return 0

    deleted_count = 0
    for filepath in Path(screenshot_dir).rglob("*"):
        if filepath.is_file():
            try:
                if filepath.stat().st_mtime < cutoff_timestamp:
                    filepath.unlink()
                    deleted_count += 1
            except Exception as e:
                logger.warning(f"Could not delete screenshot {filepath}: {e}")

    if deleted_count > 0:
        logger.info(f"Cleanup: deleted {deleted_count} old violation screenshots")

    return deleted_count


def get_storage_stats() -> dict:
    """Return storage usage statistics."""
    stats = {}
    dirs = {
        "profile_photos": settings.PROFILE_PHOTO_DIR,
        "question_files": settings.QUESTION_FILE_DIR,
        "violation_screenshots": settings.VIOLATION_SCREENSHOT_DIR,
        "temp": settings.TEMP_DIR,
    }
    for name, path in dirs.items():
        if os.path.exists(path):
            files = list(Path(path).rglob("*"))
            total_size = sum(f.stat().st_size for f in files if f.is_file())
            stats[name] = {
                "file_count": len([f for f in files if f.is_file()]),
                "total_size_mb": round(total_size / (1024 * 1024), 2),
            }
        else:
            stats[name] = {"file_count": 0, "total_size_mb": 0}
    return stats
