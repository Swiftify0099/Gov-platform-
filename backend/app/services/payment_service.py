import hashlib
import hmac
import base64
import json
import httpx
from loguru import logger
from app.config import settings


async def create_razorpay_order(amount_paise: int, plan_id: str) -> dict:
    """Create a Razorpay order."""
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise ValueError("Razorpay credentials not configured")

    auth = (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    payload = {
        "amount": amount_paise,
        "currency": "INR",
        "notes": {"plan_id": plan_id},
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.razorpay.com/v1/orders",
            json=payload,
            auth=auth,
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

    return {
        "order_id": data["id"],
        "amount": data["amount"],
        "currency": data["currency"],
        "key_id": settings.RAZORPAY_KEY_ID,
    }


async def verify_razorpay_payment(
    order_id: str, payment_id: str, signature: str
) -> bool:
    """Verify Razorpay payment signature."""
    if not settings.RAZORPAY_KEY_SECRET:
        return False

    try:
        message = f"{order_id}|{payment_id}"
        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            message.encode(),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception as e:
        logger.error(f"Razorpay signature verification failed: {e}")
        return False


async def create_phonepe_order(amount_paise: int, plan_id: str) -> dict:
    """Create a PhonePe payment request."""
    if not settings.PHONEPE_MERCHANT_ID or not settings.PHONEPE_SALT_KEY:
        raise ValueError("PhonePe credentials not configured")

    payload = {
        "merchantId": settings.PHONEPE_MERCHANT_ID,
        "merchantTransactionId": f"TXN_{plan_id[:8]}",
        "amount": amount_paise,
        "currency": "INR",
        "redirectUrl": f"{settings.FRONTEND_URL}/payment/callback",
        "redirectMode": "POST",
        "paymentInstrument": {"type": "PAY_PAGE"},
    }
    encoded = base64.b64encode(json.dumps(payload).encode()).decode()
    checksum_str = encoded + "/pg/v1/pay" + settings.PHONEPE_SALT_KEY
    sha256_hash = hashlib.sha256(checksum_str.encode()).hexdigest()
    checksum = f"{sha256_hash}###{settings.PHONEPE_SALT_INDEX}"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://{settings.PHONEPE_BASE_URL}/pg/v1/pay",
            json={"request": encoded},
            headers={"X-VERIFY": checksum, "Content-Type": "application/json"},
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

    redirect_url = (
        data.get("data", {}).get("instrumentResponse", {}).get("redirectInfo", {}).get("url")
    )
    return {
        "order_id": payload["merchantTransactionId"],
        "redirect_url": redirect_url,
        "gateway": "phonepe",
    }


async def verify_phonepe_payment(merchant_transaction_id: str) -> bool:
    """Check PhonePe payment status."""
    if not settings.PHONEPE_MERCHANT_ID or not settings.PHONEPE_SALT_KEY:
        return False

    path = f"/pg/v1/status/{settings.PHONEPE_MERCHANT_ID}/{merchant_transaction_id}"
    checksum_str = path + settings.PHONEPE_SALT_KEY
    sha256_hash = hashlib.sha256(checksum_str.encode()).hexdigest()
    checksum = f"{sha256_hash}###{settings.PHONEPE_SALT_INDEX}"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://{settings.PHONEPE_BASE_URL}{path}",
            headers={"X-VERIFY": checksum, "X-MERCHANT-ID": settings.PHONEPE_MERCHANT_ID},
            timeout=30.0,
        )
        data = response.json()

    return data.get("code") == "PAYMENT_SUCCESS"
