@echo off
title National Weather Intelligence Platform - SIH 2026
echo ========================================================
echo   NATIONAL WEATHER INTELLIGENCE PLATFORM FOR INDIA
echo   Smart India Hackathon (SIH 2026) Platform Launcher
echo ========================================================
echo.

echo [1/3] Checking Python backend dependencies...
python -m pip install -q -r backend\requirements.txt

echo [2/3] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "SIH Weather Backend" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Launching Next.js Frontend on http://localhost:3000 ...
start "SIH Weather Frontend" cmd /k "npm.cmd run dev"

echo.
echo ========================================================
echo   PLATFORM ACTIVE!
echo   Public Dashboard:    http://localhost:3000
echo   Admin Console:       http://localhost:3000/admin
echo   Analytics Hub:       http://localhost:3000/analytics
echo   FastAPI Swagger UI:  http://127.0.0.1:8000/docs
echo.
echo   Demo Admin Login:    admin@sih.gov.in / Admin@2026
echo   Demo Reviewer Login: reviewer@sih.gov.in / Reviewer@2026
echo ========================================================
pause
