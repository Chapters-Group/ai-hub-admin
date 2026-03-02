# CHAPTERS AI Hub Admin Panel - Implementation Reference

## Overview

Centralized admin panel for managing 50+ Open WebUI instances across CHAPTERS Group portfolio companies. React + shadcn/ui + Tremor frontend, FastAPI backend, PostgreSQL database.

## Architecture

API Proxy Pattern: React -> Axios (admin JWT) -> FastAPI router -> deps validate JWT -> decrypt company API key -> OpenWebUIClient(base_url, api_key) -> httpx to target Open WebUI instance. Frontend never sees Open WebUI API keys.

## Database Schema (5 tables)

- **companies**: name, slug, instance_url, api_key (encrypted), status, version, contact info
- **admin_users**: email, hashed_password, role (super_admin for MVP)
- **audit_logs**: who did what, when, on which company (JSONB details)
- **health_checks**: company_id, status_code, response_time_ms, version, error, checked_at
- **cached_analytics**: company_id, metric_type, data (JSONB), fetched_at

## URL Patterns

- Admin panel's own: `/api/auth/*`, `/api/companies/*`, `/api/health/*`, `/api/audit/*`
- Per-company proxy: `/api/companies/{company_id}/users/*`, `/api/companies/{company_id}/models/*`, etc.

## Build Phases

- **Phase 1 - Foundation**: Auth, companies CRUD, health monitor, company selector
- **Phase 2 - Core Management**: Users, knowledge, models, groups
- **Phase 3 - Config & Insights**: Config, analytics, auth keys, files
- **Phase 4 - Platform**: Provisioning, portfolio, clone/sync, API proxy, prompts, tools
- **Phase 5 - Polish**: Audit logging, export, notifications, bulk ops

## Tech Stack

**Frontend**: React, shadcn/ui, Tremor, Zustand, React Query, Axios, React Router, lucide-react

**Backend**: FastAPI, SQLAlchemy (async), asyncpg, httpx, pydantic-settings, python-jose, passlib, alembic, cryptography

## Development Setup

Quick start (single command):
```bash
./start.sh
```
This starts PostgreSQL, runs migrations, seeds the admin user, and launches both backend and frontend. Press Ctrl+C to stop.

Manual setup (3 terminals):
1. `docker compose up -d` (PostgreSQL)
2. `cd backend && source .venv/bin/activate && PYTHONPATH=. alembic upgrade head && python -m app.seed && uvicorn app.main:app --reload --port 8000`
3. `cd frontend && npm run dev`

Access at `http://localhost:5173` (login: admin@chaptersgroup.com / changeme123)

## Deployment

Deployed to Azure Container Apps behind App Gateway at `admin.chaptersgroup.com`.

- **CI/CD**: GitHub Actions (push to `main` → build → push ACR → deploy)
- **Infra**: Container App (`ca-chgadmin-prod`) in `cae-chgaihub-prod`, internal ingress only
- **SSL**: Certbot auto-renewal → Key Vault → App Gateway
- **Auth**: JWT-based (Entra ID SSO planned)

See [docs/deployment.md](deployment.md) for full Azure deployment guide.
