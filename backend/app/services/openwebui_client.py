import logging
import time
from typing import Any

import httpx

logger = logging.getLogger(__name__)


class OpenWebUIClient:
    """Async HTTP client for a single Open WebUI instance."""

    def __init__(self, base_url: str, api_key: str, timeout: float = 30.0):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def get(self, path: str, params: dict | None = None) -> Any:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(
                f"{self.base_url}{path}", headers=self._headers(), params=params
            )
            resp.raise_for_status()
            return resp.json()

    async def post(self, path: str, json: Any = None, data: Any = None, timeout: float | None = None) -> Any:
        async with httpx.AsyncClient(timeout=timeout or self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}{path}", headers=self._headers(), json=json, data=data
            )
            if resp.status_code >= 400:
                logger.error("POST %s -> %s: %s", path, resp.status_code, resp.text[:500])
            resp.raise_for_status()
            return resp.json()

    async def upload_file(self, path: str, file_content: bytes, filename: str, content_type: str) -> Any:
        """Upload a file via multipart form data."""
        headers = {"Authorization": f"Bearer {self.api_key}"}
        files = {"file": (filename, file_content, content_type)}
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{self.base_url}{path}", headers=headers, files=files
            )
            resp.raise_for_status()
            return resp.json()

    async def put(self, path: str, json: Any = None) -> Any:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.put(
                f"{self.base_url}{path}", headers=self._headers(), json=json
            )
            resp.raise_for_status()
            return resp.json()

    async def delete(self, path: str) -> Any:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.delete(f"{self.base_url}{path}", headers=self._headers())
            resp.raise_for_status()
            return resp.json()

    async def health_check(self) -> dict:
        """Check instance health. Returns status_code, response_time_ms, version."""
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/health", headers=self._headers())
                elapsed_ms = int((time.monotonic() - start) * 1000)
                status_code = resp.status_code

                version = None
                if resp.status_code == 200:
                    try:
                        body = resp.json()
                        version = body.get("version") or body.get("app_version")
                    except Exception:
                        pass
                    # /health may not include version; try /api/version
                    if not version:
                        try:
                            ver_resp = await client.get(
                                f"{self.base_url}/api/version",
                                headers=self._headers(),
                            )
                            if ver_resp.status_code == 200:
                                ver_body = ver_resp.json()
                                version = ver_body.get("version")
                        except Exception:
                            pass

                if status_code == 200 and elapsed_ms > 2000:
                    status = "slow"
                elif status_code == 200:
                    status = "online"
                else:
                    status = "offline"

                return {
                    "status": status,
                    "status_code": status_code,
                    "response_time_ms": elapsed_ms,
                    "version": version,
                    "error_message": None,
                }
        except Exception as e:
            elapsed_ms = int((time.monotonic() - start) * 1000)
            return {
                "status": "offline",
                "status_code": None,
                "response_time_ms": elapsed_ms,
                "version": None,
                "error_message": str(e),
            }
