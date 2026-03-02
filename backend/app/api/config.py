from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_company, get_owui
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

router = APIRouter(prefix="/api/companies/{company_id}/config", tags=["config"])


# --- General / Connections ---

@router.get("/export")
async def export_config(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/configs/export")


@router.post("/import")
async def import_config(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/configs/import", json=body)


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


# --- Default Models ---

@router.get("/models")
async def get_default_models(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/configs/models")


@router.post("/models")
async def update_default_models(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/configs/models", json=body)


# --- Banners ---

@router.get("/banners")
async def get_banners(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/configs/banners")


@router.post("/banners")
async def update_banners(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/configs/banners", json=body)


# --- Code Execution ---

@router.get("/code-execution")
async def get_code_execution(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/configs/code_execution")


@router.post("/code-execution")
async def update_code_execution(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/configs/code_execution", json=body)


# --- RAG / Retrieval ---

@router.get("/rag")
async def get_rag_config(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/retrieval/config")


@router.post("/rag")
async def update_rag_config(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/retrieval/config/update", json=body)


# --- Auth Settings ---

@router.get("/auth")
async def get_auth_config(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/auths/admin/config")


@router.post("/auth")
async def update_auth_config(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/auths/admin/config", json=body)


# --- Tool Servers ---

@router.get("/tool-servers")
async def get_tool_servers(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/configs/tool_servers")


@router.post("/tool-servers")
async def update_tool_servers(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/configs/tool_servers", json=body)
