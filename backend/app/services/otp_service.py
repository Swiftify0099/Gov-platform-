import random
import string
from typing import Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)


def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


async def send_otp_sms(phone: str, otp: str) -> bool:
    """Send OTP via configured SMS provider."""
    if settings.ENVIRONMENT == "development":
        logger.info(f"[DEV MODE] OTP for {phone}: {otp}")
        return True

    if settings.SMS_PROVIDER == "twilio":
        return await _send_via_twilio(phone, otp)
    elif settings.SMS_PROVIDER == "msg91":
        return await _send_via_msg91(phone, otp)
    return False


async def _send_via_twilio(phone: str, otp: str) -> bool:
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"Your ExamPrep OTP is: {otp}. Valid for 5 minutes. Do not share.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=f"+91{phone}" if not phone.startswith("+") else phone,
        )
        logger.info(f"OTP sent via Twilio: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"Twilio error: {e}")
        return False


async def _send_via_msg91(phone: str, otp: str) -> bool:
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "[api.msg91.com](https://api.msg91.com/api/v5/otp)",
                params={
                    "authkey": settings.MSG91_AUTH_KEY,
                    "template_id": settings.MSG91_TEMPLATE_ID,
                    "mobile": f"91{phone}",
                    "otp": otp,
                }
            )
            return resp.status_code == 200
    except Exception as e:
        logger.error(f"MSG91 error: {e}")
        return False
