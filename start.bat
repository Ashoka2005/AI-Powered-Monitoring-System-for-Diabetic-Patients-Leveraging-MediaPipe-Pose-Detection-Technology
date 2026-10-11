@echo off
title DiaFit AI Launch System
echo ===================================================
echo           Starting DiaFit AI Platform
echo ===================================================
echo [1/2] Starting Backend Server (Port 5000)...
start "DiaFit AI - Backend (Port 5000)" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
echo [2/2] Starting Frontend Web Client (Port 5173)...
start "DiaFit AI - Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"
echo.
echo ===================================================
echo DiaFit AI is live!
echo Access the Web App at: http://localhost:5173
echo ===================================================
timeout /t 4 >nul
