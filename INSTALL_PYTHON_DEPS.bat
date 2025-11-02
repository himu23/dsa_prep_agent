@echo off
echo ====================================
echo   Installing Python Dependencies
echo ====================================
echo.

cd backend

echo Installing required packages...
python -m pip install fastapi uvicorn[standard] requests python-dotenv

if %errorlevel% == 0 (
    echo.
    echo ✅ Dependencies installed successfully!
    echo.
    echo You can now start the Python backend with:
    echo   python run_python_server.py
    echo   OR
    echo   START_PYTHON_BACKEND.bat
) else (
    echo.
    echo ❌ Installation failed!
    echo Please check Python is installed and pip is available.
)

echo.
pause

