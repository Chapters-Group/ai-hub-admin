import uuid
from datetime import datetime

from pydantic import BaseModel


class AuditLogOut(BaseModel):
    id: uuid.UUID
    admin_user_id: uuid.UUID
    company_id: uuid.UUID | None
    action: str
    resource_type: str
    resource_id: str | None
    details: dict | None
    ip_address: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogQuery(BaseModel):
    company_id: uuid.UUID | None = None
    action: str | None = None
    resource_type: str | None = None
    limit: int = 50
    offset: int = 0
