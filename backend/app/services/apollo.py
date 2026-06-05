import logging
from typing import Any

import httpx

from app.core.config import settings
from app.schemas.lead import ProspectFilter, ProspectResult, ProspectSearchResponse

logger = logging.getLogger(__name__)

APOLLO_BASE_URL = "https://api.apollo.io/api/v1"

COMPANY_SIZE_MAP = {
    "1-10": "1,10",
    "11-50": "11,50",
    "51-200": "51,200",
    "201-500": "201,500",
    "501-1000": "501,1000",
    "1001-5000": "1001,5000",
    "5001+": "5001,10000000",
}


def _parse_person(person: dict) -> ProspectResult:
    org = person.get("organization") or {}
    num_employees = org.get("estimated_num_employees") or 0
    if num_employees <= 10:
        size = "1-10"
    elif num_employees <= 50:
        size = "11-50"
    elif num_employees <= 200:
        size = "51-200"
    elif num_employees <= 500:
        size = "201-500"
    elif num_employees <= 1000:
        size = "501-1000"
    elif num_employees <= 5000:
        size = "1001-5000"
    else:
        size = "5001+"

    domain = (org.get("website_url") or "").replace("https://", "").replace("http://", "").rstrip("/")
    revenue = org.get("annual_revenue_printed") or org.get("estimated_annual_revenue") or None

    return ProspectResult(
        apollo_id=person.get("id"),
        name=person.get("name"),
        email=person.get("email"),
        email_status=person.get("email_status"),
        role=person.get("title"),
        headline=person.get("headline"),
        seniority=person.get("seniority"),
        linkedin_url=person.get("linkedin_url"),
        photo_url=person.get("photo_url"),
        city=person.get("city") or org.get("city"),
        state=person.get("state") or org.get("state"),
        country=person.get("country") or org.get("country"),
        company=org.get("name"),
        company_domain=domain,
        industry=org.get("industry"),
        company_size=size if num_employees else None,
        annual_revenue=str(revenue) if revenue else None,
        tech_stack=[t.get("name", "") for t in (person.get("account", {}) or {}).get("technologies", [])],
    )


class ApolloService:
    def __init__(self) -> None:
        self.api_key = settings.APOLLO_API_KEY
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
        }

    def _is_configured(self) -> bool:
        return bool(self.api_key)

    async def search_people(self, filters: ProspectFilter) -> ProspectSearchResponse:
        if not self._is_configured():
            return _demo_results(filters)

        body: dict[str, Any] = {
            "page": filters.page,
            "per_page": filters.per_page,
        }

        if filters.titles:
            body["person_titles"] = filters.titles
        if filters.seniorities:
            body["person_seniorities"] = [s.lower() for s in filters.seniorities]
        if filters.locations:
            body["person_locations"] = filters.locations
        if filters.countries:
            body["organization_locations"] = filters.countries
        if filters.industries:
            body["organization_industry_tag_ids"] = []
            body["q_organization_industry_tag_names"] = filters.industries
        if filters.company_sizes:
            body["organization_num_employees_ranges"] = [
                COMPANY_SIZE_MAP[s] for s in filters.company_sizes if s in COMPANY_SIZE_MAP
            ]
        if filters.technologies:
            body["currently_using_any_of_technology_uids"] = filters.technologies
        if filters.keywords:
            body["q_keywords"] = filters.keywords

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{APOLLO_BASE_URL}/mixed_people/search",
                    json=body,
                    headers=self.headers,
                )
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPStatusError as exc:
            logger.error("Apollo API error %s: %s", exc.response.status_code, exc.response.text)
            raise RuntimeError(f"Apollo API retornou {exc.response.status_code}") from exc
        except httpx.RequestError as exc:
            logger.error("Apollo request failed: %s", exc)
            raise RuntimeError("Falha ao conectar com Apollo API") from exc

        people = data.get("people", [])
        pagination = data.get("pagination", {})

        return ProspectSearchResponse(
            results=[_parse_person(p) for p in people],
            total=pagination.get("total_entries", 0),
            page=pagination.get("page", 1),
            total_pages=pagination.get("total_pages", 1),
        )


def _demo_results(filters: ProspectFilter) -> ProspectSearchResponse:
    """Dados demo quando APOLLO_API_KEY não está configurado."""
    demo = [
        ProspectResult(
            apollo_id=f"demo_{i}",
            name=name,
            email=email,
            email_status="verified",
            role=role,
            seniority=seniority,
            company=company,
            company_domain=domain,
            industry=industry,
            country="Brazil",
            state=state,
            city=city,
            company_size=size,
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

    titles_lower = [t.lower() for t in filters.titles]
    countries_lower = [c.lower() for c in filters.countries]
    industries_lower = [i.lower() for i in filters.industries]
    seniorities_lower = [s.lower() for s in filters.seniorities]

    filtered = [
        p for p in demo
        if (not titles_lower or any(t in (p.role or "").lower() for t in titles_lower))
        and (not countries_lower or (p.country or "").lower() in countries_lower)
        and (not industries_lower or any(i in (p.industry or "").lower() for i in industries_lower))
        and (not seniorities_lower or (p.seniority or "").lower() in seniorities_lower)
        and (not filters.company_sizes or p.company_size in filters.company_sizes)
        and (not filters.keywords or filters.keywords.lower() in (p.name or "").lower()
             or filters.keywords.lower() in (p.company or "").lower())
    ]

    return ProspectSearchResponse(
        results=filtered,
        total=len(filtered),
        page=1,
        total_pages=1,
    )


apollo_service = ApolloService()
