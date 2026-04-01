from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.redis_client import get_redis
from app.models.user import User
from app.utils.jwt_utils import decode_access_token
import redis.asyncio as redis

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
    redis_conn: redis.Redis = Depends(get_redis),
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Check if token is blacklisted
    is_blacklisted = await redis_conn.get(f"blacklist:{token}")
    if is_blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked"
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    return user


async def get_current_student(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    return current_user


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("institute_admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


async def get_current_super_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin access required")
    return current_user


def require_role(*roles):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles and current_user.role != "super_admin":
            raise HTTPException(status_code=403, detail=f"Access denied, requires one of {roles}")
        return current_user
    return role_checker
