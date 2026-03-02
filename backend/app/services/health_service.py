import asyncio
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.models.company import Company
from app.models.health_check import HealthCheck
from app.services.company_service import get_owui_client

logger = logging.getLogger(__name__)


async def check_company_health(db: AsyncSession, company: Company) -> HealthCheck:
    """Run a health check for a single company and save the result."""
    client = get_owui_client(company)
    result = await client.health_check()

    # Update company status
    company.status = result["status"]
    if result.get("version"):
        company.version = result["version"]

    health = HealthCheck(
        company_id=company.id,
        status_code=result["status_code"],
        response_time_ms=result["response_time_ms"],
        version=result.get("version"),
        error_message=result.get("error_message"),
    )
    db.add(health)
    await db.commit()
    await db.refresh(health)
    return health


async def check_all_health() -> None:
    """Check health for all registered companies."""
    async with async_session_factory() as db:
        result = await db.execute(select(Company))
        companies = result.scalars().all()

        for company in companies:
            try:
                await check_company_health(db, company)
            except Exception:
                logger.exception("Health check failed for %s", company.slug)


async def health_poll_loop(interval: int) -> None:
    """Background loop that checks all companies every `interval` seconds."""
    while True:
        try:
            await check_all_health()
        except Exception:
            logger.exception("Health poll loop error")
        await asyncio.sleep(interval)


async def get_latest_health(db: AsyncSession, company_id) -> HealthCheck | None:
    result = await db.execute(
        select(HealthCheck)
        .where(HealthCheck.company_id == company_id)
        .order_by(HealthCheck.checked_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()
