from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Campaign(SQLModel, table=True):
    __tablename__ = "campaign"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    tipo: str = Field(default="email")
    target_industry: Optional[str] = None
    config: str = Field(default="{}")
    status: str = Field(default="draft", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
