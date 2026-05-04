from models.types import EvaluationResult, Question, SessionContext


def evaluate_answer(
    question: Question, answer: str, context: SessionContext
) -> EvaluationResult:
    """stub: 세림님이 실제 구현으로 교체 예정
    질문 + 답변 + 컨텍스트를 받아 평가 결과 반환
    """
    return EvaluationResult(
        question=question,
        user_answer=answer,
        star_score=3,
        specificity_score=3,
        relevance_score=3,
        consistency_score=3,
        weakness_tags=["구체성 부족"],
        feedback='{"strengths": "답변 구조 양호", "improvements": "구체적 수치 필요"}',
    )
