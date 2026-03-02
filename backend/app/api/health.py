import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.schemas.health import CompanyHealthStatus, HealthCheckOut, HealthSummary
from app.services import company_service, health_service

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("/", response_model=HealthSummary)
async def get_health_summary(
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    companies = await company_service.list_companies(db)
    statuses: list[CompanyHealthStatus] = []

    for c in companies:
        latest = await health_service.get_latest_health(db, c.id)
        statuses.append(
            CompanyHealthStatus(
                company_id=c.id,
                company_name=c.name,
                company_slug=c.slug,
                instance_url=c.instance_url,
                status=c.status,
                status_code=latest.status_code if latest else None,
                response_time_ms=latest.response_time_ms if latest else None,
                version=latest.version if latest else c.version,
                last_checked=latest.checked_at if latest else None,
            )
        )

    online = sum(1 for s in statuses if s.status == "online")
    slow = sum(1 for s in statuses if s.status == "slow")
    offline = sum(1 for s in statuses if s.status == "offline")
    unknown = sum(1 for s in statuses if s.status == "unknown")

    return HealthSummary(
        total=len(statuses),
        online=online,
        slow=slow,
        offline=offline,
        unknown=unknown,
        statuses=statuses,
    )


@router.post("/{company_id}/check", response_model=HealthCheckOut)
async def trigger_health_check(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    company = await company_service.get_company(db, company_id)
    if not company:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Company not found")
    return await health_service.check_company_health(db, company)
