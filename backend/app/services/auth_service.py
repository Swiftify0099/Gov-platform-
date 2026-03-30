from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.utils.jwt_utils import create_access_token, create_refresh_token
from app.redis_client import get_redis
from app.config import settings
import secrets
import string
from loguru import logger


async def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    if settings.ENVIRONMENT == "development":
        return "123456"  # Fixed OTP for development
    return "".join(secrets.choice(string.digits) for _ in range(6))


async def store_otp(phone_number: str, otp: str) -> None:
    """Store OTP in Redis with TTL."""
    redis = await get_redis()
    key = f"otp:{phone_number}"
    await redis.setex(key, settings.REDIS_OTP_TTL, otp)
    logger.info(f"OTP stored for {phone_number[:6]}****")


async def verify_otp_from_redis(phone_number: str, otp: str) -> bool:
    """Verify OTP from Redis."""
    redis = await get_redis()
    key = f"otp:{phone_number}"
    stored_otp = await redis.get(key)

    if not stored_otp:
        return False

    if stored_otp.decode() == otp:
        await redis.delete(key)
        return True
    return False


async def get_or_create_user(phone_number: str, db: AsyncSession) -> User:
    """Get existing user or create new one."""
    result = await db.execute(
        select(User).where(User.phone_number == phone_number)
    )
    user = result.scalar_one_or_none()

    if not user:
        # Check if it's a default admin number
        from app.models.user import UserRole
        role = UserRole.STUDENT

        if phone_number == settings.SUPER_ADMIN_PHONE:
            role = UserRole.SUPER_ADMIN
        elif phone_number == settings.DEFAULT_INSTITUTE_ADMIN_PHONE:
            role = UserRole.INSTITUTE_ADMIN

        user = User(
            phone_number=phone_number,
            role=role,
            full_name=settings.SUPER_ADMIN_NAME if role == UserRole.SUPER_ADMIN else (
                settings.DEFAULT_INSTITUTE_ADMIN_NAME if role == UserRole.INSTITUTE_ADMIN else None
            ),
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info(f"New user created: {phone_number[:6]}**** role={role.value}")

    return user


async def create_tokens_for_user(user: User) -> dict:
    """Create access + refresh tokens for a user."""
    payload = {
        "sub": str(user.id),
        "phone": user.phone_number,
        "role": user.role.value,
    }
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Store refresh token in Redis
    redis = await get_redis()
    await redis.setex(
        f"refresh:{user.id}",
        settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        refresh_token,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "role": user.role.value,
            "is_profile_complete": user.is_profile_complete,
        },
    }
