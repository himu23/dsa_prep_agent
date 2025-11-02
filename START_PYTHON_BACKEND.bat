@echo off
echo ====================================
echo   Starting Python Backend
echo ====================================
echo.

cd backend

echo Checking dependencies...
python test_python_backend.py

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Dependencies check failed!
    echo Please install requirements:
    echo   pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

echo.
echo Starting Python backend on port 8000...
echo.
echo Backend will be available at: http://localhost:8000
echo Test endpoint: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop
echo.

python run_python_server.py

pause

