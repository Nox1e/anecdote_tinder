@echo off
REM Start backend development server
REM This script starts the FastAPI backend with hot reload

setlocal enabledelayedexpansion

echo 🚀 Starting backend development server...

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR:~0,-1%
for %%A in ("%PROJECT_ROOT%") do set PROJECT_ROOT=%%~dpA
set PROJECT_ROOT=%PROJECT_ROOT:~0,-1%

echo 📁 Project root: %PROJECT_ROOT%

REM Change to backend directory
cd /d "%PROJECT_ROOT%\backend"

REM Check if virtual environment exists
if not exist ".venv" (
    echo ❌ Virtual environment not found. Please run install.bat first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Please run install.bat first or create .env from .env.example.
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🐍 Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)

REM Check if required packages are installed
python -c "import fastapi, uvicorn" >nul 2>nul
if errorlevel 1 (
    echo ❌ Required packages not found. Please run install.bat first.
    pause
    exit /b 1
)

echo ✅ Environment check passed

REM Set environment variables for development
set PYTHONPATH=%PROJECT_ROOT%\backend;%PYTHONPATH%
set ENVIRONMENT=development

echo 🌐 Starting FastAPI server...
echo 📍 Backend will be available at: http://localhost:8000
echo 📖 API docs will be available at: http://localhost:8000/docs
echo.
echo 💡 Press Ctrl+C to stop the server
echo.

REM Start the FastAPI server
python main.py

pause
