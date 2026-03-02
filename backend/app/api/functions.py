from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_company, get_owui
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

router = APIRouter(prefix="/api/companies/{company_id}/functions", tags=["functions"])


@router.get("/")
async def list_functions(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/functions/")


@router.post("/create")
async def create_function(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/functions/create", json=body)


@router.get("/id/{function_id}")
async def get_function(
    function_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/functions/id/{function_id}")


@router.post("/id/{function_id}/update")
async def update_function(
    function_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/functions/id/{function_id}/update", json=body)


@router.delete("/id/{function_id}/delete")
async def delete_function(
    function_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.delete(f"/api/v1/functions/id/{function_id}/delete")


@router.post("/id/{function_id}/toggle")
async def toggle_function(
    function_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/functions/id/{function_id}/toggle")


@router.post("/id/{function_id}/toggle/global")
async def toggle_function_global(
    function_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/functions/id/{function_id}/toggle/global")


@router.get("/id/{function_id}/valves")
async def get_function_valves(
    function_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/functions/id/{function_id}/valves")


@router.get("/id/{function_id}/valves/spec")
async def get_function_valves_spec(
    function_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/functions/id/{function_id}/valves/spec")


@router.post("/id/{function_id}/valves/update")
async def update_function_valves(
    function_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(
        f"/api/v1/functions/id/{function_id}/valves/update", json=body
    )
