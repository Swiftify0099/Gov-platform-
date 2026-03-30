from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "ExamPrepPlatform"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str
    FRONTEND_URL: str = "[localhost](http://localhost:5173)"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_OTP_TTL: int = 300
    REDIS_SESSION_TTL: int = 86400
    REDIS_GPT_CACHE_TTL: int = 86400

    # JWT
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Storage
    LOCAL_STORAGE_ROOT: str = "./data/uploads"
    PROFILE_PHOTO_DIR: str = "./data/uploads/profile_photos"
    QUESTION_FILE_DIR: str = "./data/uploads/question_files"
    VIOLATION_SCREENSHOT_DIR: str = "./data/uploads/violation_screenshots"
    TEMP_DIR: str = "./data/uploads/temp"
    MAX_UPLOAD_SIZE_MB: int = 5
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp"
    TEMP_FILE_RETENTION_HOURS: int = 24

    # SMS
    SMS_PROVIDER: str = "twilio"
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    MSG91_AUTH_KEY: Optional[str] = None
    MSG91_TEMPLATE_ID: Optional[str] = None

    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_MAX_TOKENS: int = 500

    # Razorpay
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = None

    # PhonePe
    PHONEPE_MERCHANT_ID: Optional[str] = None
    PHONEPE_SALT_KEY: Optional[str] = None
    PHONEPE_SALT_INDEX: int = 1
    PHONEPE_BASE_URL: str = "[api-preprod.phonepe.com](https://api-preprod.phonepe.com/apis/pg-sandbox)"

    # Active Gateway
    ACTIVE_PAYMENT_GATEWAY: str = "razorpay"

    # Face Verification
    FACE_MATCH_THRESHOLD: float = 0.6
    FACE_CHECK_INTERVAL_SECONDS: int = 10
    MAX_VIOLATIONS: int = 3

    # Default Admins
    SUPER_ADMIN_PHONE: str = "9000000000"
    SUPER_ADMIN_NAME: str = "Super Admin"
    DEFAULT_INSTITUTE_ADMIN_PHONE: str = "9000000001"
    DEFAULT_INSTITUTE_ADMIN_NAME: str = "Institute Admin"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def allowed_image_types_list(self) -> List[str]:
        return [t.strip() for t in self.ALLOWED_IMAGE_TYPES.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
