#!/usr/bin/env bash
set -e

echo "=== Running database migrations ==="
PYTHONPATH=/app alembic upgrade head

echo "=== Seeding admin user ==="
PYTHONPATH=/app python -m app.seed

echo "=== Starting uvicorn ==="
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 2 \
    --log-level info \
    --proxy-headers \
    --forwarded-allow-ips "*"
