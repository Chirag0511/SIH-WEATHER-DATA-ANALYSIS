#!/usr/bin/env bash
# National Weather Intelligence Platform Launcher (Linux / macOS)
set -e

echo "========================================================"
echo "  NATIONAL WEATHER INTELLIGENCE PLATFORM FOR INDIA"
echo "  Smart India Hackathon (SIH 2026) Platform Launcher"
echo "========================================================"

echo "[1/3] Checking Python dependencies..."
python3 -m pip install -q -r backend/requirements.txt

echo "[2/3] Starting FastAPI Backend on port 8000..."
uvicorn backend.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "[3/3] Starting Next.js Frontend on port 3000..."
npm run dev &
FRONTEND_PID=$!

echo "Platform running!"
echo "Public UI:       http://localhost:3000"
echo "Admin Console:   http://localhost:3000/admin"
echo "Analytics:       http://localhost:3000/analytics"
echo "API Docs:        http://127.0.0.1:8000/docs"
echo "Admin Demo:      admin@sih.gov.in / Admin@2026"
echo "Reviewer Demo:   reviewer@sih.gov.in / Reviewer@2026"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
