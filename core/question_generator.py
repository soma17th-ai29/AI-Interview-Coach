import uuid
from models.types import Question, SessionState


def generate_question(state: SessionState, is_followup: bool) -> Question:
    """stub: 질문 생성 담당자가 실제 구현으로 교체 예정
    SessionState를 받아 다음 질문 반환
    """
    parent_id = state.history[-1][0].id if is_followup and state.history else None
    return Question(
        id=str(uuid.uuid4()),
        text=(
            "프로젝트에서 가장 어려웠던 기술적 결정과 트레이드오프를 말씀해 주세요."
            if not is_followup
            else "왜 다른 대안이 아니라 그 선택이었는지 더 구체적으로 설명해 주세요."
        ),
        category="프로젝트",
        difficulty=3,
        is_followup=is_followup,
        parent_id=parent_id,
    )
