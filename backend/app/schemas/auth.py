from pydantic import BaseModel
from typing import Optional


class SendOTPRequest(BaseModel):
    phone: str

    class Config:
        json_schema_extra = {"example": {"phone": "9000000000"}}


class SendOTPResponse(BaseModel):
    message: str
    is_new_user: bool
    dev_otp: Optional[str] = None


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {"phone": "9000000000", "otp": "123456", "name": "Test User"}
        }


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    is_new_user: bool
    name: Optional[str] = None
    profile_photo_url: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str
