from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone
from app.database import get_db
from app.redis_client import get_redis
from app.models.user import User, StudentProfile
from app.models.institute import Institute
from app.schemas.auth import (
    SendOTPRequest, SendOTPResponse,
    VerifyOTPRequest, TokenResponse, RefreshTokenRequest
)
from app.services.otp_service import generate_otp, send_otp_sms
from app.utils.jwt_utils import create_access_token, create_refresh_token, decode_refresh_token
from app.dependencies import get_current_user
from app.config import settings
import redis.asyncio as redis
import logging

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp(
    request: SendOTPRequest,
    db: AsyncSession = Depends(get_db),
    redis_conn: redis.Redis = Depends(get_redis),
):
    phone = request.phone.strip()

    # Rate limiting: 1 OTP per 60 seconds
    cooldown_key = f"otp:cooldown:{phone}"
    if await redis_conn.get(cooldown_key):
        raise HTTPException(
            status_code=429,
            detail="Please wait 60 seconds before requesting another OTP"
        )

    # Check if user exists (or create guest record)
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()

    otp = generate_otp()

    # Store OTP in Redis
    otp_key = f"otp:{phone}"
    await redis_conn.setex(otp_key, settings.REDIS_OTP_TTL, otp)
    await redis_conn.setex(cooldown_key, 60, "1")

    # Send SMS
    sent = await send_otp_sms(phone, otp)
    if not sent and settings.ENVIRONMENT != "development":
        raise HTTPException(status_code=500, detail="Failed to send OTP. Try again.")

    # In dev mode, return OTP in response
    dev_otp = otp if settings.ENVIRONMENT == "development" else None

    return SendOTPResponse(
        message="OTP sent successfully",
        is_new_user=user is None,
        dev_otp=dev_otp,
    )


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(
    request: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
    redis_conn: redis.Redis = Depends(get_redis),
):
    phone = request.phone.strip()
    otp_key = f"otp:{phone}"
    stored_otp = await redis_conn.get(otp_key)

    # Default credentials bypass in dev
    is_default = (
        settings.ENVIRONMENT == "development" and
        request.otp in ("000000", "123456")
    )

    if not is_default and (not stored_otp or stored_otp != request.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Delete used OTP
    await redis_conn.delete(otp_key)

    # Get or create user
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()

    is_new_user = False
    if not user:
        is_new_user = True
        # Determine role from default phones
        role = "student"
        if phone == settings.SUPER_ADMIN_PHONE:
            role = "super_admin"
        elif phone == settings.DEFAULT_INSTITUTE_ADMIN_PHONE:
            role = "institute_admin"

        user = User(
            phone=phone,
            role=role,
            is_phone_verified=True,
            name=request.name or (
                settings.SUPER_ADMIN_NAME if role == "super_admin"
                else settings.DEFAULT_INSTITUTE_ADMIN_NAME if role == "institute_admin"
                else None
            ),
        )
        db.add(user)
        await db.flush()

        # Create default institute for institute admin
        if role == "institute_admin":
            institute = Institute(
                name="Default Institute",
                code=f"INST{phone[-4:]}",
            )
            db.add(institute)
            await db.flush()
            user.institute_id = institute.id

        # Create student profile
        if role == "student":
            profile = StudentProfile(user_id=user.id)
            db.add(profile)

        await db.commit()
        await db.refresh(user)
    else:
        await db.execute(
            update(User).where(User.id == user.id).values(
                is_phone_verified=True,
                last_login_at=datetime.now(timezone.utc)
            )
        )
        await db.commit()

    # Generate tokens
    token_data = {"sub": str(user.id), "role": user.role, "phone": user.phone}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Store session in Redis
    session_key = f"session:{user.id}"
    await redis_conn.setex(session_key, settings.REDIS_SESSION_TTL, refresh_token)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user_id=str(user.id),
        role=user.role,
        is_new_user=is_new_user,
        name=user.name,
        profile_photo_url=user.profile_photo_url,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    redis_conn: redis.Redis = Depends(get_redis),
):
    payload = decode_refresh_token(request.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    session_key = f"session:{user_id}"
    stored_token = await redis_conn.get(session_key)

    if stored_token != request.refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token mismatch")

    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    token_data = {"sub": str(user.id), "role": user.role, "phone": user.phone}
    access_token = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)
    await redis_conn.setex(session_key, settings.REDIS_SESSION_TTL, new_refresh)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        token_type="bearer",
        user_id=str(user.id),
        role=user.role,
        is_new_user=False,
        name=user.name,
        profile_photo_url=user.profile_photo_url,
    )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    redis_conn: redis.Redis = Depends(get_redis),
):
    session_key = f"session:{current_user.id}"
    await redis_conn.delete(session_key)
    return {"message": "Logged out successfully"}
