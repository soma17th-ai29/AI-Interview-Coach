from models.types import EvaluationResult, Question, Report


def generate_report(history: list[tuple[Question, EvaluationResult]]) -> Report:
    """stub: 정훈님이 실제 구현으로 교체 예정
    전체 Q&A 히스토리를 받아 종합 리포트 반환
    """
    scores = [
        (r.star_score + r.specificity_score + r.relevance_score + r.consistency_score) / 4
        for _, r in history
    ]
    overall = sum(scores) / len(scores) if scores else 0.0
    return Report(
        overall_score=round(overall, 2),
        category_scores={"전체": overall},
        weakness_summary=list({tag for _, r in history for tag in r.weakness_tags}),
        improvement_suggestions="stub: 정훈님이 구현 예정",
    )
