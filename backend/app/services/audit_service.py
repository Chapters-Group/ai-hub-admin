import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


async def log_action(
    db: AsyncSession,
    admin_user_id: uuid.UUID,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    company_id: uuid.UUID | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    entry = AuditLog(
        admin_user_id=admin_user_id,
        company_id=company_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


async def list_audit_logs(
    db: AsyncSession,
    company_id: uuid.UUID | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[AuditLog]:
    q = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).offset(offset)
    if company_id:
        q = q.where(AuditLog.company_id == company_id)
    result = await db.execute(q)
    return list(result.scalars().all())
