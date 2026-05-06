import hashlib
import json
import os
import time
from pathlib import Path

from tavily import TavilyClient

from models.types import CompanyProfile

CACHE_DIR = Path(__file__).parent.parent / "cache"
CACHE_TTL_SECONDS = 24 * 60 * 60


def search_company(company_name: str) -> CompanyProfile:
    """회사명으로 Tavily 검색 후 CompanyProfile 반환 (24시간 캐시)"""
    cached = _load_cache(company_name)
    if cached is not None:
        return cached

    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        raise ValueError("TAVILY_API_KEY 환경변수가 설정되지 않았습니다")

    client = TavilyClient(api_key=api_key)
    query = f"{company_name} 인재상 기술스택 회사문화 최신뉴스"
    response = client.search(query=query, max_results=5)
    results = response.get("results", [])

    if not results:
        return CompanyProfile(
            name=company_name,
            tech_stack=[],
            culture="",
            recent_news="검색 결과 없음",
            source_urls=[],
        )

    recent_news = "\n\n".join(r["content"] for r in results if r.get("content"))
    source_urls = [r["url"] for r in results if r.get("url")]

    profile = CompanyProfile(
        name=company_name,
        tech_stack=[],
        culture="",
        recent_news=recent_news,
        source_urls=source_urls,
    )

    _save_cache(company_name, profile)
    return profile


def _cache_path(company_name: str) -> Path:
    safe_name = hashlib.md5(company_name.encode("utf-8")).hexdigest()
    return CACHE_DIR / f"{safe_name}.json"


def _load_cache(company_name: str) -> CompanyProfile | None:
    path = _cache_path(company_name)
    if not path.exists():
        return None
    try:
        with open(path, encoding="utf-8") as f:
            cached = json.load(f)
        if time.time() - cached["timestamp"] > CACHE_TTL_SECONDS:
            return None
        data = cached["data"]
        return CompanyProfile(**data)
    except Exception:
        return None


def _save_cache(company_name: str, profile: CompanyProfile) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = _cache_path(company_name)
    payload = {
        "timestamp": time.time(),
        "data": {
            "name": profile.name,
            "tech_stack": profile.tech_stack,
            "culture": profile.culture,
            "recent_news": profile.recent_news,
            "source_urls": profile.source_urls,
        },
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
