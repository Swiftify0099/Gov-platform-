import re
from typing import Optional
from fastapi import HTTPException, status


def validate_phone_number(phone: str) -> str:
    """Validate and normalize Indian phone number."""
    cleaned = phone.replace("+91", "").replace(" ", "").replace("-", "").strip()
    if not cleaned.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number must contain only digits",
        )
    if len(cleaned) != 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number must be exactly 10 digits",
        )
    if not cleaned[0] in "6789":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Indian mobile number",
        )
    return cleaned


def validate_email(email: Optional[str]) -> Optional[str]:
    """Basic email format validation."""
    if not email:
        return None
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format",
        )
    return email.lower().strip()


def validate_otp(otp: str) -> str:
    """Validate OTP format."""
    if not otp.isdigit() or len(otp) != 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP must be a 6-digit number",
        )
    return otp


def validate_exam_stream(stream: str) -> str:
    """Validate exam stream selection."""
    valid_streams = ["MPSC", "UPSC", "Group B", "Group C", "Group D", "All India Services"]
    if stream not in valid_streams:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid exam stream. Choose from: {', '.join(valid_streams)}",
        )
    return stream
