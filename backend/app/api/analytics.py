from typing import Any, Optional

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_company, get_owui
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

router = APIRouter(prefix="/api/companies/{company_id}/analytics", tags=["analytics"])


@router.get("/summary")
async def get_summary(
    start_date: Optional[int] = Query(None),
    end_date: Optional[int] = Query(None),
    group_id: Optional[str] = Query(None),
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    params = {}
    if start_date is not None:
        params["start_date"] = start_date
    if end_date is not None:
        params["end_date"] = end_date
    if group_id:
        params["group_id"] = group_id
    return await client.get("/api/v1/analytics/summary", params=params)


@router.get("/models")
async def get_model_analytics(
    start_date: Optional[int] = Query(None),
    end_date: Optional[int] = Query(None),
    group_id: Optional[str] = Query(None),
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    params = {}
    if start_date is not None:
        params["start_date"] = start_date
    if end_date is not None:
        params["end_date"] = end_date
    if group_id:
        params["group_id"] = group_id
    return await client.get("/api/v1/analytics/models", params=params)


@router.get("/users")
async def get_user_analytics(
    start_date: Optional[int] = Query(None),
    end_date: Optional[int] = Query(None),
    group_id: Optional[str] = Query(None),
    limit: int = Query(50),
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    params = {"limit": limit}
    if start_date is not None:
        params["start_date"] = start_date
    if end_date is not None:
        params["end_date"] = end_date
    if group_id:
        params["group_id"] = group_id
    return await client.get("/api/v1/analytics/users", params=params)


@router.get("/daily")
async def get_daily_stats(
    start_date: Optional[int] = Query(None),
    end_date: Optional[int] = Query(None),
    group_id: Optional[str] = Query(None),
    granularity: str = Query("daily"),
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    params = {"granularity": granularity}
    if start_date is not None:
        params["start_date"] = start_date
    if end_date is not None:
        params["end_date"] = end_date
    if group_id:
        params["group_id"] = group_id
    return await client.get("/api/v1/analytics/daily", params=params)


@router.get("/tokens")
async def get_token_usage(
    start_date: Optional[int] = Query(None),
    end_date: Optional[int] = Query(None),
    group_id: Optional[str] = Query(None),
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    params = {}
    if start_date is not None:
        params["start_date"] = start_date
    if end_date is not None:
        params["end_date"] = end_date
    if group_id:
        params["group_id"] = group_id
    return await client.get("/api/v1/analytics/tokens", params=params)
