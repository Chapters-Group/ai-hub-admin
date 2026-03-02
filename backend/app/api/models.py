from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_company, get_owui
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

router = APIRouter(prefix="/api/companies/{company_id}/models", tags=["models"])


@router.get("/")
async def list_models(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/models")


@router.get("/base")
async def list_base_models(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/models/base")


@router.post("/create")
async def create_model(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/models/create", json=body)


@router.post("/update")
async def update_model(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/models/update", json=body)


@router.post("/delete")
async def delete_model(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/models/delete", json=body)


@router.post("/{model_id}/toggle")
async def toggle_model(
    model_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/models/{model_id}/toggle")


@router.post("/{model_id}/access")
async def set_model_access(
    model_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/models/{model_id}/access", json=body)


@router.post("/sync")
async def sync_models(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/models/sync")


@router.get("/export")
async def export_models(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/models/export")


@router.post("/import")
async def import_models(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/models/import", json=body)


# Connections
@router.get("/connections")
async def get_connections(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/configs/connections")


@router.post("/connections")
async def update_connections(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/configs/connections", json=body)


@router.post("/connections/verify")
async def verify_connection(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/openai/verify", json=body)
