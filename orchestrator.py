from core.answer_evaluator import evaluate_answer
from core.document_loader import load_documents
from core.question_generator import generate_question
from core.report_generator import generate_report
from core.tavily_search import search_company
from models.types import Question, Report, SessionContext, SessionState

MIN_ANSWER_LENGTH = 50


def start_session(
    pdf_paths: list[str],
    job_description: str,
    company_name: str,
) -> SessionState:
    collection_name = load_documents(pdf_paths)

    company_profile = None
    if company_name:
        try:
            company_profile = search_company(company_name)
        except Exception:
            company_profile = None

    context = SessionContext(
        chroma_collection_name=collection_name,
        company_profile=company_profile,
        job_description=job_description,
    )
    return SessionState(context=context)


def process_answer(
    state: SessionState,
    question: Question,
    answer: str,
) -> dict:
    """
    Returns:
        {"action": "retry"}                               — 답변 너무 짧음
        {"action": "followup", "question": Question}      — 꼬리질문 생성
        {"action": "next_question", "question": Question} — 다음 메인 질문
        {"action": "can_report", "question": Question}    — 리포트 가능, 계속 여부 선택
        {"action": "force_end"}                           — 강제 종료
    """
    if len(answer.strip()) < MIN_ANSWER_LENGTH:
        return {"action": "retry"}

    result = evaluate_answer(question, answer, state.context)
    state.history.append((question, result))
    state.question_count += 1

    can_followup = (
        bool(result.weakness_tags)
        and state.current_followup_depth < state.max_followup_depth
    )

    if can_followup:
        next_q = generate_question(state, is_followup=True)
        state.current_followup_depth += 1
        return {"action": "followup", "question": next_q}

    state.bundle_count += 1
    state.current_followup_depth = 0

    if state.question_count >= state.max_questions:
        state.is_active = False
        return {"action": "force_end"}

    next_q = generate_question(state, is_followup=False)

    if state.bundle_count >= state.min_bundles_for_report:
        return {"action": "can_report", "question": next_q}

    return {"action": "next_question", "question": next_q}


def end_session(state: SessionState) -> Report:
    if state.bundle_count < state.min_bundles_for_report:
        raise ValueError(
            f"최소 {state.min_bundles_for_report}묶음 이상 완료해야 리포트를 생성할 수 있습니다. "
            f"현재: {state.bundle_count}묶음"
        )
    state.is_active = False
    return generate_report(state.history)
