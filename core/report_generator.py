"""종합 리포트 생성 모듈 — 결정적 점수 집계 + 코칭 코멘트(추후 LLM)"""

from __future__ import annotations

import logging
from collections import Counter

from models.types import EvaluationResult, Question, Report

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# 상수
# ─────────────────────────────────────────────
WEAKNESS_TOP_N = 5
SCORE_KEYS: tuple[str, ...] = (
    "star_score",
    "specificity_score",
    "relevance_score",
    "consistency_score",
)


# ─────────────────────────────────────────────
# 결정적 집계
# ─────────────────────────────────────────────
def _avg_4scores(r: EvaluationResult) -> float:
    return sum(getattr(r, k) for k in SCORE_KEYS) / len(SCORE_KEYS)


def _aggregate_overall_score(history: list[tuple[Question, EvaluationResult]]) -> float:
    if not history:
        return 0.0
    return round(sum(_avg_4scores(r) for _, r in history) / len(history), 2)


def _aggregate_category_scores(
    history: list[tuple[Question, EvaluationResult]],
) -> dict[str, float]:
    """카테고리별 평균 점수.

    꼬리질문은 부모 메인 질문과 동일한 category 를 가지므로 자연스럽게 같은
    버킷에 합산된다. 등장하지 않은 카테고리는 결과 dict 에서 제외해 0점 오해를 막는다.
    """
    bucket: dict[str, list[float]] = {}
    for q, r in history:
        bucket.setdefault(q.category, []).append(_avg_4scores(r))
    return {cat: round(sum(scores) / len(scores), 2) for cat, scores in bucket.items()}


def _aggregate_weakness_top(
    history: list[tuple[Question, EvaluationResult]],
    top_n: int = WEAKNESS_TOP_N,
) -> list[str]:
    """약점 태그를 빈도 내림차순으로 정렬해 상위 N개 반환."""
    counter: Counter[str] = Counter()
    for _, r in history:
        counter.update(r.weakness_tags)
    return [tag for tag, _ in counter.most_common(top_n)]


# ─────────────────────────────────────────────
# 개선 제안 — 결정적 폴백 (LLM 통합 전까지의 기본 코멘트)
# ─────────────────────────────────────────────
def _fallback_suggestions(weakness_top: list[str]) -> str:
    if not weakness_top:
        return (
            "전반적으로 균형 잡힌 답변이었습니다. "
            "STAR 구조와 구체적인 수치 인용을 한 단계 더 보강하면 답변이 한층 강해집니다."
        )
    tags = ", ".join(weakness_top)
    return (
        f"가장 자주 드러난 약점은 [{tags}] 입니다. "
        "STAR 구조(상황·과제·행동·결과)를 명시하고, 답변마다 정량 지표(수치·비율·기간)를 "
        "최소 1개 이상 인용해 보세요. 직무 관련성을 높이려면 회사·직무 키워드를 답변 도입부에 "
        "자연스럽게 배치하는 것도 효과적입니다."
    )


# ─────────────────────────────────────────────
# 엔트리 포인트
# ─────────────────────────────────────────────
def generate_report(history: list[tuple[Question, EvaluationResult]]) -> Report:
    """전체 Q&A 히스토리를 받아 종합 리포트 반환.

    - 점수/약점 집계는 결정적 로직 (LLM 미사용).
    - improvement_suggestions 는 후속 단계에서 LLM 코칭 코멘트로 교체 예정.
    """
    if not history:
        logger.info("빈 history → 빈 리포트 반환")
        return Report(
            overall_score=0.0,
            category_scores={},
            weakness_summary=[],
            improvement_suggestions="평가할 답변이 없습니다.",
        )

    overall = _aggregate_overall_score(history)
    category_scores = _aggregate_category_scores(history)
    weakness_top = _aggregate_weakness_top(history)
    suggestions = _fallback_suggestions(weakness_top)

    return Report(
        overall_score=overall,
        category_scores=category_scores,
        weakness_summary=weakness_top,
        improvement_suggestions=suggestions,
    )
