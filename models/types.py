from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

Category = Literal["CS", "프로젝트", "문제해결", "인성", "적합성"]


@dataclass
class CompanyProfile:
    name: str
    tech_stack: list[str]
    culture: str
    recent_news: str
    source_urls: list[str]      # Tavily 검색 결과 출처 — LLM 생성값 금지


@dataclass
class SessionContext:
    chroma_collection_name: str
    company_profile: CompanyProfile | None  # Tavily 실패 시 None
    job_description: str


@dataclass
class Question:
    id: str
    text: str
    category: Category
    difficulty: int             # 1~5
    is_followup: bool
    parent_id: str | None       # 꼬리질문이면 부모 질문 id, 아니면 None


@dataclass
class EvaluationResult:
    question: Question
    user_answer: str
    star_score: int             # STAR 구조 점수 1~5
    specificity_score: int      # 구체성 점수 1~5
    relevance_score: int        # 직무 관련성 점수 1~5
    consistency_score: int      # 일관성 점수 1~5
    weakness_tags: list[str]    # 약점 태그 — 꼬리질문 발동 트리거
    feedback: str               # JSON 형식으로 LLM이 반환


@dataclass
class Report:
    overall_score: float
    category_scores: dict[str, float]
    weakness_summary: list[str]
    improvement_suggestions: str


@dataclass
class SessionState:
    context: SessionContext
    history: list[tuple[Question, EvaluationResult]] = field(default_factory=list)
    bundle_count: int = 0
    question_count: int = 0
    current_followup_depth: int = 0
    max_followup_depth: int = 3
    min_bundles_for_report: int = 3
    max_questions: int = 50
    is_active: bool = True
