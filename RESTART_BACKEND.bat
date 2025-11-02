@echo off
echo ====================================
echo   RESTARTING Backend Server
echo ====================================
echo.

echo Step 1: Stopping old processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Starting fresh backend...
cd backend
node server.js

