# Services package
from app.services.auth_service import generate_otp, store_otp, verify_otp_from_redis, get_or_create_user, create_tokens_for_user
from app.services.otp_service import send_otp_sms as send_otp, generate_otp as gen_otp
from app.services.storage_service import save_profile_photo, save_violation_screenshot, save_question_file, cleanup_temp_files
from app.services.gpt_service import get_explanation_for_question as get_gpt_explanation
from app.services.score_service import calculate_score
from app.services.payment_service import create_razorpay_order, verify_razorpay_payment
