import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api import analytics, auth, chat, companies, config, files, functions, groups, health, knowledge, models, prompts, tools, users
from app.config import settings
from app.services.health_service import health_poll_loop

logger = logging.getLogger(__name__)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background health polling
    task = asyncio.create_task(health_poll_loop(settings.HEALTH_CHECK_INTERVAL))
    logger.info("Health poll loop started (interval=%ds)", settings.HEALTH_CHECK_INTERVAL)
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="CHAPTERS AI Hub Admin",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(health.router)
app.include_router(users.router)
app.include_router(knowledge.router)
app.include_router(models.router)
app.include_router(groups.router)
app.include_router(files.router)
app.include_router(config.router)
app.include_router(analytics.router)
app.include_router(prompts.router)
app.include_router(tools.router)
app.include_router(functions.router)
app.include_router(chat.router)


@app.get("/health")
async def root_health():
    return {"status": "ok"}


# Serve frontend static files in production (when static/ dir exists from Docker build)
if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        file_path = STATIC_DIR / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
