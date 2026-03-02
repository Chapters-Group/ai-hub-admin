import uuid
from datetime import datetime

from pydantic import BaseModel


class HealthCheckOut(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    status_code: int | None
    response_time_ms: int | None
    version: str | None
    error_message: str | None
    checked_at: datetime

    model_config = {"from_attributes": True}


class CompanyHealthStatus(BaseModel):
    company_id: uuid.UUID
    company_name: str
    company_slug: str
    instance_url: str
    status: str
    status_code: int | None = None
    response_time_ms: int | None = None
    version: str | None = None
    last_checked: datetime | None = None


class HealthSummary(BaseModel):
    total: int
    online: int
    slow: int
    offline: int
    unknown: int
    statuses: list[CompanyHealthStatus]
