import asyncio
import logging
from typing import Any

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from app.api.deps import get_company, get_owui
from app.models.company import Company
from app.services.openwebui_client import OpenWebUIClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/companies/{company_id}/files", tags=["files"])


@router.get("/")
async def list_files(
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.get("/api/v1/files/")


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    content = await file.read()
    result = await client.upload_file(
        "/api/v1/files/",
        file_content=content,
        filename=file.filename or "upload",
        content_type=file.content_type or "application/octet-stream",
    )

    # Open WebUI processes files asynchronously. Poll until status is no longer "pending".
    file_id = result.get("id")
    if file_id:
        for _ in range(60):  # up to ~60 seconds
            file_info = await client.get(f"/api/v1/files/{file_id}")
            status = (file_info.get("data") or {}).get("status", "")
            if status != "pending":
                if status == "failed":
                    logger.error("File processing failed: %s", file_id)
                    raise HTTPException(status_code=400, detail="File processing failed. The file format may not be supported or the content could not be extracted.")
                return file_info
            await asyncio.sleep(1)
        raise HTTPException(status_code=408, detail="File processing timed out. Try again or use a smaller file.")

    return result


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    company: Company = Depends(get_company),
    client: OpenWebUIClient = Depends(get_owui),
) -> Any:
    return await client.delete(f"/api/v1/files/{file_id}")
