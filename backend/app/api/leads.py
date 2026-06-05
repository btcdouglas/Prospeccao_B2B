from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadRead, LeadUpdate

router = APIRouter()


@router.get("/", response_model=list[LeadRead])
def list_leads(
    session: Session = Depends(get_session),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    status: Optional[str] = None,
    country: Optional[str] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    industry: Optional[str] = None,
    seniority: Optional[str] = None,
    company_size: Optional[str] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
) -> list[Lead]:
    statement = select(Lead)

    if status:
        statement = statement.where(Lead.status == status)
    if country:
        statement = statement.where(Lead.country == country)
    if state:
        statement = statement.where(Lead.state == state)
    if city:
        statement = statement.where(Lead.city.icontains(city))  # type: ignore[attr-defined]
    if industry:
        statement = statement.where(Lead.industry.icontains(industry))  # type: ignore[attr-defined]
    if seniority:
        statement = statement.where(Lead.seniority == seniority)
    if company_size:
        statement = statement.where(Lead.company_size == company_size)
    if source:
        statement = statement.where(Lead.source == source)
    if search:
        statement = statement.where(
            Lead.name.icontains(search)  # type: ignore[attr-defined]
            | Lead.company.icontains(search)  # type: ignore[attr-defined]
            | Lead.email.icontains(search)  # type: ignore[attr-defined]
        )

    statement = statement.order_by(Lead.created_at.desc()).offset(skip).limit(limit)  # type: ignore[attr-defined]
    return list(session.exec(statement).all())


@router.post("/", response_model=LeadRead)
def create_lead(lead_in: LeadCreate, session: Session = Depends(get_session)) -> Lead:
    existing = session.exec(select(Lead).where(Lead.email == lead_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email já existe")

    lead = Lead(
        email=lead_in.email,
        name=lead_in.name,
        company=lead_in.company,
        company_domain=lead_in.company_domain,
        role=lead_in.role,
        headline=lead_in.headline,
        seniority=lead_in.seniority,
        linkedin_url=lead_in.linkedin_url,
        phone=lead_in.phone,
        photo_url=lead_in.photo_url,
        city=lead_in.city,
        state=lead_in.state,
        country=lead_in.country,
        industry=lead_in.industry,
        company_size=lead_in.company_size,
        annual_revenue=lead_in.annual_revenue,
        tech_stack=lead_in.tech_stack,
        meta_data=lead_in.meta_data,
        source=lead_in.source,
        apollo_id=lead_in.apollo_id,
    )
    session.add(lead)
    session.commit()
    session.refresh(lead)
    return lead


@router.get("/{lead_id}", response_model=LeadRead)
def get_lead(lead_id: int, session: Session = Depends(get_session)) -> Lead:
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    return lead


@router.patch("/{lead_id}", response_model=LeadRead)
def update_lead(lead_id: int, lead_in: LeadUpdate, session: Session = Depends(get_session)) -> Lead:
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")

    data = lead_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(lead, key, value)
    lead.updated_at = datetime.utcnow()

    session.add(lead)
    session.commit()
    session.refresh(lead)
    return lead


@router.delete("/{lead_id}")
def delete_lead(lead_id: int, session: Session = Depends(get_session)) -> dict:
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    session.delete(lead)
    session.commit()
    return {"ok": True}
