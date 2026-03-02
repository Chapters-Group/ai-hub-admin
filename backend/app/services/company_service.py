import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.services.encryption import decrypt_api_key, encrypt_api_key
from app.services.openwebui_client import OpenWebUIClient


async def list_companies(db: AsyncSession) -> list[Company]:
    result = await db.execute(select(Company).order_by(Company.name))
    return list(result.scalars().all())


async def get_company(db: AsyncSession, company_id: uuid.UUID) -> Company | None:
    return await db.get(Company, company_id)


async def get_company_by_slug(db: AsyncSession, slug: str) -> Company | None:
    result = await db.execute(select(Company).where(Company.slug == slug))
    return result.scalar_one_or_none()


async def create_company(db: AsyncSession, data: CompanyCreate) -> Company:
    company = Company(
        name=data.name,
        slug=data.slug,
        instance_url=str(data.instance_url).rstrip("/"),
        api_key_encrypted=encrypt_api_key(data.api_key),
        contact_name=data.contact_name,
        contact_email=data.contact_email,
    )

    # Verify connectivity
    client = OpenWebUIClient(company.instance_url, data.api_key)
    health = await client.health_check()
    company.status = health["status"]
    company.version = health.get("version")

    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


async def update_company(
    db: AsyncSession, company: Company, data: CompanyUpdate
) -> Company:
    if data.name is not None:
        company.name = data.name
    if data.instance_url is not None:
        company.instance_url = str(data.instance_url).rstrip("/")
    if data.api_key is not None:
        company.api_key_encrypted = encrypt_api_key(data.api_key)
    if data.contact_name is not None:
        company.contact_name = data.contact_name
    if data.contact_email is not None:
        company.contact_email = data.contact_email

    await db.commit()
    await db.refresh(company)
    return company


async def delete_company(db: AsyncSession, company: Company) -> None:
    await db.delete(company)
    await db.commit()


def get_owui_client(company: Company) -> OpenWebUIClient:
    api_key = decrypt_api_key(company.api_key_encrypted)
    return OpenWebUIClient(company.instance_url, api_key)
