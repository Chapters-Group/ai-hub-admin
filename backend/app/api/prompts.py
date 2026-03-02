from typing import Any, Optional

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_company, get_owui
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

router = APIRouter(prefix="/api/companies/{company_id}/prompts", tags=["prompts"])


@router.get("/")
async def list_prompts(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/prompts/")


@router.get("/tags")
async def list_prompt_tags(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/prompts/tags")


@router.post("/create")
async def create_prompt(
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post("/api/v1/prompts/create", json=body)


@router.get("/id/{prompt_id}")
async def get_prompt(
    prompt_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(f"/api/v1/prompts/id/{prompt_id}")


@router.post("/id/{prompt_id}/update")
async def update_prompt(
    prompt_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(f"/api/v1/prompts/id/{prompt_id}/update", json=body)


@router.delete("/id/{prompt_id}/delete")
async def delete_prompt(
    prompt_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.delete(f"/api/v1/prompts/id/{prompt_id}/delete")


@router.get("/id/{prompt_id}/history")
async def get_prompt_history(
    prompt_id: str,
    page: int = Query(0),
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get(
        f"/api/v1/prompts/id/{prompt_id}/history", params={"page": page}
    )


@router.post("/id/{prompt_id}/update/version")
async def set_prompt_version(
    prompt_id: str,
    body: dict,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.post(
        f"/api/v1/prompts/id/{prompt_id}/update/version", json=body
    )
