from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.redis_client import get_redis
from app.schemas.gpt import GPTExplainRequest, GPTExplainResponse
from app.services.gpt_service import get_explanation_for_question
from app.dependencies import get_current_student
from app.models.user import User
import logging

router = APIRouter(prefix="/api/gpt", tags=["gpt"])
logger = logging.getLogger(__name__)


@router.post("/explain", response_model=GPTExplainResponse)
async def explain_question(
    payload: GPTExplainRequest,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
    redis_conn=Depends(get_redis),
):
    try:
        language = payload.language or current_user.language_preference or "en"
        explanation = await get_explanation_for_question(
            question_id=str(payload.question_id),
            language=language,
            db=db,
            redis_conn=redis_conn,
        )
        return GPTExplainResponse(
            question_id=str(payload.question_id),
            explanation=explanation,
            language=language,
            cached=False,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"GPT explain error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate explanation")
