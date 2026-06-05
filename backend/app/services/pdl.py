import logging
from typing import Any

import httpx

from app.core.config import settings
from app.schemas.lead import ProspectFilter, ProspectResult, ProspectSearchResponse

logger = logging.getLogger(__name__)

PDL_BASE_URL = "https://api.peopledatalabs.com/v5"

SENIORITY_MAP: dict[str, str] = {
    "C-Level": "cxo",
    "VP": "vp",
    "Director": "director",
    "Manager": "manager",
    "Senior": "senior",
    "Entry": "entry",
    "Owner": "owner",
    "Founder": "owner",
}

SENIORITY_REVERSE: dict[str, str] = {v: k for k, v in SENIORITY_MAP.items()}

# Expansão de abreviações → frases completas que o PDL usa
TITLE_EXPANSIONS: dict[str, list[str]] = {
    "cto": ["chief technology officer", "chief technical officer"],
    "ceo": ["chief executive officer"],
    "cfo": ["chief financial officer"],
    "coo": ["chief operating officer"],
    "cmo": ["chief marketing officer"],
    "cpo": ["chief product officer", "chief people officer"],
    "ciso": ["chief information security officer"],
    "cdo": ["chief data officer", "chief digital officer"],
    "vp": ["vice president"],
    "vp engineering": ["vice president engineering", "vice president of engineering"],
    "vp sales": ["vice president sales", "vice president of sales"],
    "vp product": ["vice president product", "vice president of product"],
    "vp marketing": ["vice president marketing", "vice president of marketing"],
    "svp": ["senior vice president"],
    "evp": ["executive vice president"],
    "head of engineering": ["head of engineering", "director of engineering"],
    "head of product": ["head of product", "director of product"],
    "head of sales": ["head of sales", "director of sales"],
    "head of data": ["head of data", "director of data"],
    "head of infra": ["head of infrastructure", "director of infrastructure"],
}


def _expand_titles(titles: list[str]) -> list[str]:
    expanded: list[str] = []
    for t in titles:
        key = t.lower().strip()
        if key in TITLE_EXPANSIONS:
            expanded.extend(TITLE_EXPANSIONS[key])
        else:
            expanded.append(t)
    return expanded


def _build_query(filters: ProspectFilter) -> dict[str, Any]:
    must: list[dict[str, Any]] = []
    should: list[dict[str, Any]] = []

    def _any_of(field: str, values: list[str], query_type: str = "match") -> dict[str, Any]:
        """Cria um bool.should aninhado que obriga ao menos um valor a bater."""
        if len(values) == 1:
            return {query_type: {field: values[0]}}
        return {"bool": {"should": [{query_type: {field: v}} for v in values]}}

    # Títulos: expande abreviações e obriga ao menos um a bater
    expanded_titles = _expand_titles(filters.titles)
    if expanded_titles:
        must.append(_any_of("job_title", expanded_titles))

    if filters.seniorities:
        levels = [SENIORITY_MAP[s] for s in filters.seniorities if s in SENIORITY_MAP]
        if levels:
            must.append(_any_of("job_title_levels", levels))

    if filters.countries:
        must.append(_any_of("location_country", [c.lower() for c in filters.countries], "term"))

    if filters.locations:
        must.append(_any_of("location_name", filters.locations))

    if filters.industries:
        must.append(_any_of("job_company_industry", filters.industries))

    if filters.company_sizes:
        must.append(_any_of("job_company_size", filters.company_sizes, "term"))

    if filters.technologies:
        must.append(_any_of("skills", filters.technologies))

    if filters.keywords:
        must.append({"bool": {"should": [
            {"match": {"job_title": filters.keywords}},
            {"match": {"job_company_name": filters.keywords}},
        ]}})

    return {"bool": {"must": must}} if must else {"match_all": {}}


def _str_or_none(val: Any) -> str | None:
    """PDL retorna True/False para campos de PII ocultos no free tier."""
    return val if isinstance(val, str) else None


def _parse_person(person: dict[str, Any]) -> ProspectResult:
    email = _str_or_none(person.get("work_email")) or _str_or_none(person.get("recommended_personal_email"))
    has_email = bool(person.get("work_email"))
    email_status = "verified" if isinstance(person.get("work_email"), str) else ("exists" if has_email else "unknown")

    levels = person.get("job_title_levels") or []
    seniority: str | None = None
    for level in ["cxo", "owner", "vp", "director", "manager", "senior", "entry"]:
        if level in levels:
            seniority = SENIORITY_REVERSE.get(level)
            break

    domain = (person.get("job_company_website") or "").replace("https://", "").replace("http://", "").rstrip("/")
    country = _str_or_none(person.get("location_country")) or person.get("location_country")
    if isinstance(country, bool):
        country = None
    skills: list[str] = (person.get("skills") or [])[:15]

    linkedin = _str_or_none(person.get("linkedin_url"))
    if linkedin and not linkedin.startswith("http"):
        linkedin = f"https://{linkedin}"

    return ProspectResult(
        apollo_id=person.get("id"),
        name=_str_or_none(person.get("full_name")) or person.get("full_name"),
        email=email,
        email_status=email_status,
        role=_str_or_none(person.get("job_title")) or person.get("job_title"),
        headline=_str_or_none(person.get("headline")),
        seniority=seniority,
        linkedin_url=linkedin,
        photo_url=None,
        city=_str_or_none(person.get("location_locality")),
        state=_str_or_none(person.get("location_region")),
        country=country.title() if isinstance(country, str) else None,
        company=_str_or_none(person.get("job_company_name")) or person.get("job_company_name"),
        company_domain=domain,
        industry=_str_or_none(person.get("job_company_industry")) or person.get("job_company_industry"),
        company_size=_str_or_none(person.get("job_company_size")) or person.get("job_company_size"),
        annual_revenue=str(person["job_company_annual_revenue"]) if isinstance(person.get("job_company_annual_revenue"), (int, float)) else None,
        tech_stack=skills,
    )


class PDLService:
    def __init__(self) -> None:
        self.api_key = settings.PDL_API_KEY

    def _is_configured(self) -> bool:
        return bool(self.api_key)

    async def search_people(self, filters: ProspectFilter) -> ProspectSearchResponse:
        if not self._is_configured():
            return _demo_results(filters)

        body: dict[str, Any] = {
            "query": _build_query(filters),
            "size": filters.per_page,
            "dataset": "all",
        }
        if filters.scroll_token:
            body["scroll_token"] = filters.scroll_token

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{PDL_BASE_URL}/person/search",
                    json=body,
                    headers={"X-Api-Key": self.api_key, "Content-Type": "application/json"},
                )
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                return ProspectSearchResponse(results=[], total=0, page=filters.page, total_pages=1)
            logger.error("PDL API error %s: %s", exc.response.status_code, exc.response.text)
            raise RuntimeError(f"People Data Labs retornou {exc.response.status_code}") from exc
        except httpx.RequestError as exc:
            logger.error("PDL request failed: %s", exc)
            raise RuntimeError("Falha ao conectar com People Data Labs") from exc

        people = data.get("data") or []
        total = data.get("total") or 0
        next_scroll = data.get("scroll_token")
        total_pages = max(1, -(-total // filters.per_page))

        return ProspectSearchResponse(
            results=[_parse_person(p) for p in people],
            total=total,
            page=filters.page,
            total_pages=total_pages,
            scroll_token=next_scroll,
        )


def _demo_results(filters: ProspectFilter) -> ProspectSearchResponse:
    demo = [
        ProspectResult(
            apollo_id=f"demo_{i}",
            name=name, email=email, email_status="verified",
            role=role, seniority=seniority, company=company,
            company_domain=domain, industry=industry,
            country="Brazil", state=state, city=city, company_size=size,
        )
        for i, (name, email, role, seniority, company, domain, industry, state, city, size) in enumerate([
            ("Ana Lima", "ana@fintech.io", "CTO", "C-Level", "FinTech IO", "fintech.io", "Fintech", "SP", "São Paulo", "11-50"),
            ("Bruno Carvalho", "bruno@cloudops.com.br", "VP Engineering", "VP", "CloudOps", "cloudops.com.br", "Cloud Computing", "RJ", "Rio de Janeiro", "51-200"),
            ("Carla Mendes", "carla@saas.co", "Head of Infrastructure", "Director", "SaaS Co", "saas.co", "SaaS", "SP", "Campinas", "11-50"),
            ("Daniel Rocha", "daniel@agritech.com.br", "Founder & CEO", "C-Level", "AgriTech BR", "agritech.com.br", "Agriculture Technology", "GO", "Goiânia", "1-10"),
            ("Fernanda Torres", "fernanda@healthtech.io", "VP Product", "VP", "HealthTech IO", "healthtech.io", "Health Technology", "MG", "Belo Horizonte", "51-200"),
            ("Gabriel Souza", "gabriel@edtech.com.br", "CTO", "C-Level", "EdTech Brasil", "edtech.com.br", "Education Technology", "SP", "São Paulo", "11-50"),
            ("Helena Costa", "helena@retailtech.com", "Director of Engineering", "Director", "RetailTech", "retailtech.com", "Retail Technology", "PR", "Curitiba", "201-500"),
            ("Igor Nunes", "igor@proptech.io", "Head of Data", "Director", "PropTech IO", "proptech.io", "Real Estate Technology", "SP", "São Paulo", "11-50"),
            ("Julia Martins", "julia@legaltech.com.br", "CEO", "C-Level", "LegalTech BR", "legaltech.com.br", "Legal Technology", "SP", "São Paulo", "1-10"),
            ("Lucas Ferreira", "lucas@logtech.io", "VP Operations", "VP", "LogTech IO", "logtech.io", "Logistics Technology", "SP", "Santos", "51-200"),
        ])
    ]

    titles_lower = [t.lower() for t in (filters.titles or [])]
    countries_lower = [c.lower() for c in (filters.countries or [])]
    industries_lower = [i.lower() for i in (filters.industries or [])]
    seniorities_lower = [s.lower() for s in (filters.seniorities or [])]

    filtered = [
        p for p in demo
        if (not titles_lower or any(t in (p.role or "").lower() for t in titles_lower))
        and (not countries_lower or (p.country or "").lower() in countries_lower)
        and (not industries_lower or any(ind in (p.industry or "").lower() for ind in industries_lower))
        and (not seniorities_lower or (p.seniority or "").lower() in seniorities_lower)
        and (not filters.company_sizes or p.company_size in filters.company_sizes)
        and (not filters.keywords or filters.keywords.lower() in (p.name or "").lower()
             or filters.keywords.lower() in (p.company or "").lower())
    ]

    return ProspectSearchResponse(results=filtered, total=len(filtered), page=1, total_pages=1)


pdl_service = PDLService()
