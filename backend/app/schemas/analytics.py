import uuid
from datetime import datetime

from pydantic import BaseModel


class CachedAnalyticsOut(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    metric_type: str
    data: dict | None
    fetched_at: datetime

    model_config = {"from_attributes": True}
