from typing import List, Dict, Any
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


def calculate_score(
    answers: List[Dict[str, Any]],
    negative_marking: bool = False,
) -> Dict[str, Any]:
    """Calculate exam score from answer list."""
    total_score = Decimal("0")
    correct_count = 0
    wrong_count = 0
    skipped_count = 0

    for answer in answers:
        selected = set(answer.get("selected_options", []))
        correct = set(answer.get("correct_answers", []))
        marks = Decimal(str(answer.get("marks", 1)))
        neg_marks = Decimal(str(answer.get("negative_marks", 0)))

        if not selected:
            skipped_count += 1
            answer["is_correct"] = False
            answer["marks_awarded"] = 0
            continue

        if selected == correct:
            correct_count += 1
            total_score += marks
            answer["is_correct"] = True
            answer["marks_awarded"] = float(marks)
        else:
            wrong_count += 1
            answer["is_correct"] = False
            if negative_marking:
                total_score -= neg_marks
                answer["marks_awarded"] = -float(neg_marks)
            else:
                answer["marks_awarded"] = 0

    return {
        "total_score": float(total_score),
        "correct_count": correct_count,
        "wrong_count": wrong_count,
        "skipped_count": skipped_count,
        "answers": answers,
    }


def calculate_percentage(score: float, total_marks: float) -> float:
    if total_marks == 0:
        return 0.0
    return round((score / total_marks) * 100, 2)
