import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_admin, get_company, get_owui
from app.models.admin_user import AdminUser
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

router = APIRouter(prefix="/api/companies/{company_id}/users", tags=["users"])


@router.get("/")
async def list_users(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/users/")


@router.get("/search")
async def search_users(
    q: str = Query(""),
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/users/search", params={"q": q})


@router.get("/permissions")
async def get_permissions(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/users/permissions")


@router.post("/permissions")
async def update_permissions(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/users/permissions", json=body)


@router.post("/signup")
async def create_user(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/auths/signup", json=body)


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/users/{user_id}")


@router.post("/{user_id}/update")
async def update_user(
    user_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/users/{user_id}/update", json=body)


@router.post("/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/users/{user_id}/role", json=body)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.delete(f"/api/v1/users/{user_id}")


@router.get("/{user_id}/settings")
async def get_user_settings(
    user_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/users/{user_id}/settings")


@router.post("/{user_id}/settings")
async def update_user_settings(
    user_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/users/{user_id}/settings", json=body)
