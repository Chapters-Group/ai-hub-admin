#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Start postgres if not running
if ! docker compose -f "$ROOT/docker-compose.yml" ps --format '{{.State}}' 2>/dev/null | grep -q running; then
  echo "Starting PostgreSQL..."
  docker compose -f "$ROOT/docker-compose.yml" up -d 2>/dev/null
fi

# Run migrations
echo "Running migrations..."
cd "$ROOT/backend"
source .venv/bin/activate
PYTHONPATH=. alembic upgrade head 2>&1 | tail -1

# Start backend
echo "Starting backend on :8000..."
PYTHONPATH=. uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend on :5173..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================="
echo "  App ready at http://localhost:5173"
echo "  API docs at http://localhost:8000/docs"
echo "  Press Ctrl+C to stop"
echo "============================="
echo ""

# Stop both on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
