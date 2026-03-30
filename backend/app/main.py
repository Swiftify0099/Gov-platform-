from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import logging
from loguru import logger

from app.config import settings
from app.database import engine
from app.redis_client import get_redis, close_redis
from app.routers import (
    auth, users, institutes, courses, questions,
    assignments, submissions, violations, payments,
    uploads, gpt, analytics, admin
)

# Ensure upload directories exist
for dir_path in [
    settings.PROFILE_PHOTO_DIR,
    settings.QUESTION_FILE_DIR,
    settings.VIOLATION_SCREENSHOT_DIR,
    settings.TEMP_DIR,
    "./logs",
]:
    os.makedirs(dir_path, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ExamPrep Platform API...")
    # Initialize Redis
    await get_redis()
    logger.info("Redis connected")

    # Schedule cleanup job
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from app.services.storage_service import cleanup_temp_files
    scheduler = AsyncIOScheduler()
    scheduler.add_job(cleanup_temp_files, "interval", hours=6)
    scheduler.start()

    yield

    logger.info("Shutting down...")
    await close_redis()
    scheduler.shutdown()


app = FastAPI(
    title="ExamPrep Platform API",
    version="1.0.0",
    description="Government exam preparation platform with proctoring",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT == "development" else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(institutes.router)
app.include_router(courses.router)
app.include_router(questions.router)
app.include_router(assignments.router)
app.include_router(submissions.router)
app.include_router(violations.router)
app.include_router(payments.router)
app.include_router(uploads.router)
app.include_router(gpt.router)
app.include_router(analytics.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }
