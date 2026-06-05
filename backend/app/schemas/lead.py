from datetime import datetime
from typing import Optional

from pydantic import EmailStr
from sqlmodel import SQLModel


class LeadBase(SQLModel):
    email: EmailStr
    name: Optional[str] = None
    company: str
    company_domain: str
    role: Optional[str] = None
    headline: Optional[str] = None
    seniority: Optional[str] = None
    linkedin_url: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    tech_stack: list[str] = []
    meta_data: dict = {}
    source: str = "manual"
    apollo_id: Optional[str] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(SQLModel):
    name: Optional[str] = None
    role: Optional[str] = None
    headline: Optional[str] = None
    seniority: Optional[str] = None
    status: Optional[str] = None
    bant_score: Optional[int] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    meta_data: Optional[dict] = None


class LeadRead(LeadBase):
    id: int
    bant_score: int
    status: str
    campaign_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class ProspectFilter(SQLModel):
    titles: list[str] = []
    seniorities: list[str] = []
    locations: list[str] = []
    countries: list[str] = []
    industries: list[str] = []
    company_sizes: list[str] = []
    technologies: list[str] = []
    keywords: Optional[str] = None
    page: int = 1
    per_page: int = 25
    scroll_token: Optional[str] = None


class ProspectResult(SQLModel):
    apollo_id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    email_status: Optional[str] = None
    role: Optional[str] = None
    headline: Optional[str] = None
    seniority: Optional[str] = None
    linkedin_url: Optional[str] = None
    photo_url: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    company: Optional[str] = None
    company_domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    tech_stack: list[str] = []
    already_saved: bool = False


class ProspectSearchResponse(SQLModel):
    results: list[ProspectResult]
    total: int
    page: int
    total_pages: int
    scroll_token: Optional[str] = None
