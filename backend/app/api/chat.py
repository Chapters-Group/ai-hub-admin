import logging
from typing import Any

import httpx
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.api.deps import get_company, get_owui
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/companies/{company_id}/chat", tags=["chat"])


@router.get("/models")
async def list_models(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/models")


@router.post("/completions")
async def chat_completions(
    request: Request,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
):
    """Proxy chat completions with streaming support."""
    body = await request.json()
    is_stream = body.get("stream", False)

    if not is_stream:
        return await client.post("/openai/chat/completions", json=body, timeout=120.0)

    # Streaming: proxy SSE chunks through
    async def event_generator():
        headers = {
            "Authorization": f"Bearer {client.api_key}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=120.0) as http:
            async with http.stream(
                "POST",
                f"{client.base_url}/openai/chat/completions",
                json=body,
                headers=headers,
            ) as resp:
                async for chunk in resp.aiter_bytes():
                    yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
