from openai import AsyncOpenAI
from app.config import settings
import logging

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def get_explanation(
    question_text: str,
    options: list[str],
    correct_answer: str,
    language: str = "en",
    question_id: str = None,
    redis_conn=None,
) -> str:
    """Get GPT-4o explanation with Redis caching."""
    cache_key = f"gpt:explain:{question_id}:{language}" if question_id else None

    # Check cache
    if cache_key and redis_conn:
        cached = await redis_conn.get(cache_key)
        if cached:
            logger.info(f"GPT cache hit for {cache_key}")
            return cached

    lang_map = {"en": "English", "mr": "Marathi", "hi": "Hindi"}
    lang_name = lang_map.get(language, "English")

    prompt = f"""Explain why the correct answer to this question is correct.
Question: {question_text}
Options: {', '.join([f'{chr(65+i)}) {opt}' for i, opt in enumerate(options)])}
Correct Answer: {correct_answer}
Explain in simple language in {lang_name}. Be concise and educational."""

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": f"You are a helpful exam preparation tutor. Respond in {lang_name}."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=settings.OPENAI_MAX_TOKENS,
            temperature=0.7,
        )
        explanation = response.choices[0].message.content

        # Cache the response
        if cache_key and redis_conn:
            await redis_conn.setex(cache_key, settings.REDIS_GPT_CACHE_TTL, explanation)

        return explanation
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise


async def get_explanation_for_question(question_id: str, language: str, db, redis_conn) -> str:
    """Fetch question from DB and get explanation."""
    from sqlalchemy import select
    from app.models.question import Question

    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise ValueError("Question not found")

    options = [question.option_a, question.option_b, question.option_c, question.option_d]
    correct_letters = [chr(65 + i) for i in question.correct_answers]
    correct_text = ", ".join([f"{l}) {options[question.correct_answers[j]]}" for j, l in enumerate(correct_letters)])

    return await get_explanation(
        question_text=question.text,
        options=options,
        correct_answer=correct_text,
        language=language,
        question_id=str(question_id),
        redis_conn=redis_conn,
    )
