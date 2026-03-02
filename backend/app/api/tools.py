from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_company, get_owui
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

router = APIRouter(prefix="/api/companies/{company_id}/tools", tags=["tools"])


@router.get("/")
async def list_tools(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/tools/")


@router.post("/create")
async def create_tool(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/tools/create", json=body)


@router.get("/id/{tool_id}")
async def get_tool(
    tool_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/tools/id/{tool_id}")


@router.post("/id/{tool_id}/update")
async def update_tool(
    tool_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/tools/id/{tool_id}/update", json=body)


@router.delete("/id/{tool_id}/delete")
async def delete_tool(
    tool_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.delete(f"/api/v1/tools/id/{tool_id}/delete")


@router.get("/id/{tool_id}/valves")
async def get_tool_valves(
    tool_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/tools/id/{tool_id}/valves")


@router.get("/id/{tool_id}/valves/spec")
async def get_tool_valves_spec(
    tool_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/tools/id/{tool_id}/valves/spec")


@router.post("/id/{tool_id}/valves/update")
async def update_tool_valves(
    tool_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/tools/id/{tool_id}/valves/update", json=body)
