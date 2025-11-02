@echo off
echo ====================================
echo   Checking Service Status
echo ====================================
echo.

netstat -ano | findstr ":3000 :5000" >nul
if %errorlevel% == 0 (
    echo Services are running:
    netstat -ano | findstr ":3000 :5000"
    echo.
    echo Backend:  http://localhost:5000
    echo Frontend: http://localhost:3000
) else (
    echo Services are NOT running.
    echo.
    echo To start them, run: START_ALL.bat
)

echo.
pause

