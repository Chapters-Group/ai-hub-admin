import uuid
from datetime import datetime

from pydantic import BaseModel, HttpUrl


class CompanyCreate(BaseModel):
    name: str
    slug: str
    instance_url: HttpUrl
    api_key: str
    contact_name: str | None = None
    contact_email: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    instance_url: HttpUrl | None = None
    api_key: str | None = None
    contact_name: str | None = None
    contact_email: str | None = None


class CompanyOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    instance_url: str
    status: str
    version: str | None
    contact_name: str | None
    contact_email: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CompanyDetail(CompanyOut):
    user_count: int | None = None
    model_count: int | None = None
    knowledge_count: int | None = None
    group_count: int | None = None
