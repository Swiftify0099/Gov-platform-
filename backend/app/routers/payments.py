from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import hmac
import hashlib
import json
import uuid

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.payment import Payment, PaymentStatus, PaymentGateway, SubscriptionPlan
from app.services.payment_service import (
    create_razorpay_order,
    verify_razorpay_payment,
    create_phonepe_order,
    verify_phonepe_payment,
)
from app.config import settings

router = APIRouter(prefix="/api/v1/payments", tags=["Payments"])


@router.get("/plans")
async def list_plans(db: AsyncSession = Depends(get_db)):
    """List all active subscription plans."""
    result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.is_active == True)
    )
    plans = result.scalars().all()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "description": p.description,
            "duration_days": int(p.duration_days),
            "price": float(p.price),
            "features": p.features,
        }
        for p in plans
    ]


@router.post("/create-order")
async def create_payment_order(
    plan_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a payment order using the active gateway."""
    plan_result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id)
    )
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    amount_paise = int(float(plan.price) * 100)
    gateway = settings.ACTIVE_PAYMENT_GATEWAY

    if gateway == "razorpay":
        order_data = await create_razorpay_order(amount_paise, str(plan.id))
        gateway_enum = PaymentGateway.RAZORPAY
    elif gateway == "phonepe":
        order_data = await create_phonepe_order(amount_paise, str(plan.id))
        gateway_enum = PaymentGateway.PHONEPE
    else:
        raise HTTPException(status_code=400, detail="No payment gateway configured")

    payment = Payment(
        student_id=current_user.id,
        plan_id=plan_id,
        gateway=gateway_enum,
        gateway_order_id=order_data.get("order_id"),
        amount=plan.price,
        status=PaymentStatus.PENDING,
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)

    return {
        "payment_id": str(payment.id),
        "gateway": gateway,
        "order_data": order_data,
        "amount": float(plan.price),
        "plan_name": plan.name,
    }


@router.post("/verify")
async def verify_payment(
    payment_id: uuid.UUID,
    gateway_payment_id: str,
    gateway_signature: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify payment after gateway callback."""
    result = await db.execute(
        select(Payment).where(Payment.id == payment_id)
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.gateway == PaymentGateway.RAZORPAY:
        is_valid = await verify_razorpay_payment(
            payment.gateway_order_id, gateway_payment_id, gateway_signature
        )
    elif payment.gateway == PaymentGateway.PHONEPE:
        is_valid = await verify_phonepe_payment(gateway_payment_id)
    else:
        is_valid = False

    if is_valid:
        payment.status = PaymentStatus.SUCCESS
        payment.gateway_payment_id = gateway_payment_id
        payment.gateway_signature = gateway_signature
    else:
        payment.status = PaymentStatus.FAILED

    await db.commit()
    return {"success": is_valid, "status": payment.status.value}


@router.get("/active-gateway")
async def get_active_gateway(
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
):
    """Get the currently active payment gateway."""
    return {"active_gateway": settings.ACTIVE_PAYMENT_GATEWAY}
