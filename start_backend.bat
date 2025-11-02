@echo off
echo ====================================
echo   Starting DSA Prep Agent Backend
echo ====================================
echo.

cd backend
echo Current directory: %CD%
echo.

echo Stopping any old Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% == 0 (
    echo Old processes stopped.
) else (
    echo No old processes found.
)
echo.

echo Starting backend server...
echo.
echo Backend will run on: http://localhost:5000
echo Test endpoint: http://localhost:5000/api/test
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause

