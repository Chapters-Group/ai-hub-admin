from typing import Any

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_company, get_owui
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

router = APIRouter(prefix="/api/companies/{company_id}/knowledge", tags=["knowledge"])


@router.get("/")
async def list_knowledge(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/knowledge/")


@router.post("/create")
async def create_knowledge(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/knowledge/create", json=body)


@router.get("/search")
async def search_knowledge(
    q: str = Query(""),
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/knowledge/search", params={"q": q})


@router.get("/{kb_id}")
async def get_knowledge(
    kb_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/knowledge/{kb_id}")


@router.get("/{kb_id}/files")
async def list_knowledge_files(
    kb_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/knowledge/{kb_id}/files")


@router.post("/{kb_id}/update")
async def update_knowledge(
    kb_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/knowledge/{kb_id}/update", json=body)


@router.delete("/{kb_id}")
async def delete_knowledge(
    kb_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.delete(f"/api/v1/knowledge/{kb_id}")


@router.post("/{kb_id}/file/add")
async def add_file_to_knowledge(
    kb_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/knowledge/{kb_id}/file/add", json=body, timeout=120.0)


@router.post("/{kb_id}/file/remove")
async def remove_file_from_knowledge(
    kb_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/knowledge/{kb_id}/file/remove", json=body)


@router.post("/{kb_id}/reset")
async def reset_knowledge(
    kb_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/knowledge/{kb_id}/reset")
