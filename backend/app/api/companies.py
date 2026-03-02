import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.schemas.company import CompanyCreate, CompanyDetail, CompanyOut, CompanyUpdate
from app.services import company_service
from app.services.openwebui_client import OpenWebUIClient

router = APIRouter(prefix="/api/companies", tags=["companies"])


@router.get("/", response_model=list[CompanyOut])
async def list_companies(
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    return await company_service.list_companies(db)


@router.post("/", response_model=CompanyOut, status_code=201)
async def create_company(
    body: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    existing = await company_service.get_company_by_slug(db, body.slug)
    if existing:
        raise HTTPException(status_code=409, detail="Company slug already exists")
    return await company_service.create_company(db, body)


@router.get("/{company_id}", response_model=CompanyDetail)
async def get_company(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    company = await company_service.get_company(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    detail = CompanyDetail.model_validate(company)

    # Try to fetch live counts from the instance
    if company.status == "online":
        try:
            client = company_service.get_owui_client(company)
            users = await client.get("/api/v1/users/")
            detail.user_count = len(users) if isinstance(users, list) else 0
        except Exception:
            pass
        try:
            client = company_service.get_owui_client(company)
            models = await client.get("/api/models")
            if isinstance(models, dict) and "data" in models:
                detail.model_count = len(models["data"])
            elif isinstance(models, list):
                detail.model_count = len(models)
        except Exception:
            pass
        try:
            client = company_service.get_owui_client(company)
            kbs = await client.get("/api/v1/knowledge/")
            detail.knowledge_count = len(kbs) if isinstance(kbs, list) else 0
        except Exception:
            pass
        try:
            client = company_service.get_owui_client(company)
            groups = await client.get("/api/v1/groups/")
            detail.group_count = len(groups) if isinstance(groups, list) else 0
        except Exception:
            pass

    return detail


@router.put("/{company_id}", response_model=CompanyOut)
async def update_company(
    company_id: uuid.UUID,
    body: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    company = await company_service.get_company(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return await company_service.update_company(db, company, body)


@router.delete("/{company_id}", status_code=204)
async def delete_company(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    company = await company_service.get_company(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    await company_service.delete_company(db, company)
