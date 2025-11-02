@echo off
echo ====================================
echo   Starting All Services
echo ====================================
echo.

echo [1/3] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo [2/4] Starting Python Backend (Port 8000)...
start "Python Backend" cmd /k "cd backend && python run_python_server.py"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo   Services Started!
echo ====================================
echo.
echo Node.js Backend:  http://localhost:5000
echo Python Backend:   http://localhost:8000
echo Frontend:         http://localhost:3000
echo.
echo Three new windows opened - keep them running!
echo Close this window when done.
echo.
pause

