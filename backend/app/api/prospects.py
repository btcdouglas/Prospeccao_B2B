import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.lead import Lead
from app.schemas.lead import LeadRead, ProspectFilter, ProspectResult, ProspectSearchResponse
from app.services.pdl import pdl_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/search", response_model=ProspectSearchResponse)
async def search_prospects(filters: ProspectFilter, session: Session = Depends(get_session)) -> ProspectSearchResponse:
    results = await pdl_service.search_people(filters)

    saved_ids = set(
        session.exec(select(Lead.apollo_id).where(Lead.apollo_id.isnot(None))).all()  # type: ignore[attr-defined]
    )
    saved_emails = set(session.exec(select(Lead.email)).all())

    for r in results.results:
        r.already_saved = (r.apollo_id in saved_ids) or (bool(r.email) and r.email in saved_emails)

    return results


@router.post("/save", response_model=LeadRead)
def save_prospect(prospect: ProspectResult, session: Session = Depends(get_session)) -> Lead:
    if not prospect.email:
        raise HTTPException(status_code=400, detail="Prospect sem email não pode ser salvo no pipeline")

    existing = session.exec(select(Lead).where(Lead.email == prospect.email)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Lead com este email já existe no pipeline")

    lead = Lead(
        email=prospect.email,
        name=prospect.name,
        company=prospect.company or "",
        company_domain=prospect.company_domain or "",
        role=prospect.role,
        headline=prospect.headline,
        seniority=prospect.seniority,
        linkedin_url=prospect.linkedin_url,
        phone=prospect.phone,
        photo_url=prospect.photo_url,
        city=prospect.city,
        state=prospect.state,
        country=prospect.country,
        industry=prospect.industry,
        company_size=prospect.company_size,
        annual_revenue=prospect.annual_revenue,
        tech_stack=prospect.tech_stack,
        source="pdl",
        apollo_id=prospect.apollo_id,
        status="new",
    )
    session.add(lead)
    session.commit()
    session.refresh(lead)
    logger.info("Prospect salvo: %s (%s)", lead.name, lead.email)
    return lead


@router.post("/save-bulk", response_model=list[LeadRead])
def save_bulk(prospects: list[ProspectResult], session: Session = Depends(get_session)) -> list[Lead]:
    saved: list[Lead] = []
    existing_emails = set(session.exec(select(Lead.email)).all())

    for prospect in prospects:
        if not prospect.email or prospect.email in existing_emails:
            continue
        lead = Lead(
            email=prospect.email,
            name=prospect.name,
            company=prospect.company or "",
            company_domain=prospect.company_domain or "",
            role=prospect.role,
            headline=prospect.headline,
            seniority=prospect.seniority,
            linkedin_url=prospect.linkedin_url,
            photo_url=prospect.photo_url,
            city=prospect.city,
            state=prospect.state,
            country=prospect.country,
            industry=prospect.industry,
            company_size=prospect.company_size,
            annual_revenue=prospect.annual_revenue,
            tech_stack=prospect.tech_stack,
            source="pdl",
            apollo_id=prospect.apollo_id,
            status="new",
            updated_at=datetime.utcnow(),
        )
        session.add(lead)
        existing_emails.add(prospect.email)
        saved.append(lead)

    session.commit()
    for lead in saved:
        session.refresh(lead)
    logger.info("Bulk save: %d prospects salvos", len(saved))
    return saved
