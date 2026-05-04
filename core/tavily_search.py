from models.types import CompanyProfile


def search_company(company_name: str) -> CompanyProfile:
    """stub: 태균님이 실제 구현으로 교체 예정
    회사명으로 Tavily 검색 후 CompanyProfile 반환 (24시간 캐시)
    """
    return CompanyProfile(
        name=company_name,
        tech_stack=["Python", "FastAPI"],
        culture="자율과 책임",
        recent_news=f"{company_name} 관련 최신 정보 없음 (stub)",
        source_urls=[],
    )
