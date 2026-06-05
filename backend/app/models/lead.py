from datetime import datetime
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.types import JSON
from sqlmodel import Field, SQLModel


class Lead(SQLModel, table=True):
    __tablename__ = "lead"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: Optional[str] = None
    company: str
    company_domain: str = Field(index=True)
    role: Optional[str] = None
    headline: Optional[str] = None
    seniority: Optional[str] = Field(default=None, index=True)
    linkedin_url: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None

    city: Optional[str] = Field(default=None, index=True)
    state: Optional[str] = Field(default=None)
    country: Optional[str] = Field(default=None, index=True)

    industry: Optional[str] = Field(default=None, index=True)
    company_size: Optional[str] = Field(default=None)
    annual_revenue: Optional[str] = Field(default=None)

    tech_stack: list = Field(default=[], sa_column=Column(JSON))
    meta_data: dict = Field(default={}, sa_column=Column(JSON))

    bant_score: int = Field(default=0, ge=0, le=100)
    status: str = Field(default="new", index=True)
    source: str = Field(default="manual")
    apollo_id: Optional[str] = Field(default=None)

    campaign_id: Optional[int] = Field(default=None, foreign_key="campaign.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
