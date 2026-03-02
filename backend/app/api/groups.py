from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_company, get_owui
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

router = APIRouter(prefix="/api/companies/{company_id}/groups", tags=["groups"])


@router.get("/")
async def list_groups(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/groups/")


@router.post("/create")
async def create_group(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/groups/create", json=body)


@router.get("/export")
async def export_groups(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/groups/export")


@router.get("/{group_id}")
async def get_group(
    group_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/groups/id/{group_id}")


@router.post("/{group_id}/update")
async def update_group(
    group_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/groups/id/{group_id}/update", json=body)


@router.post("/{group_id}/users/add")
async def add_users_to_group(
    group_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/groups/id/{group_id}/users/add", json=body)


@router.post("/{group_id}/users/remove")
async def remove_users_from_group(
    group_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/groups/id/{group_id}/users/remove", json=body)


@router.delete("/{group_id}")
async def delete_group(
    group_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.delete(f"/api/v1/groups/id/{group_id}/delete")
