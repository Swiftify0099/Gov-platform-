from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class PaymentOrderCreate(BaseModel):
    plan_id: uuid.UUID


class PaymentVerify(BaseModel):
    payment_id: uuid.UUID
    gateway_payment_id: str
    gateway_signature: Optional[str] = None


class PaymentResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    plan_id: Optional[uuid.UUID]
    gateway: str
    gateway_order_id: Optional[str]
    gateway_payment_id: Optional[str]
    amount: float
    currency: str
    status: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
        json_encoders = {uuid.UUID: str}


class SubscriptionPlanCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    duration_days: int
    price: float
    features: Optional[str] = None


class SubscriptionPlanResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    duration_days: int
    price: float
    features: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True
        json_encoders = {uuid.UUID: str}
