@echo off
REM Start frontend development server
REM This script starts the React/Vite frontend with hot reload

setlocal enabledelayedexpansion

echo 🚀 Starting frontend development server...

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR:~0,-1%
for %%A in ("%PROJECT_ROOT%") do set PROJECT_ROOT=%%~dpA
set PROJECT_ROOT=%PROJECT_ROOT:~0,-1%

echo 📁 Project root: %PROJECT_ROOT%

REM Change to frontend directory
cd /d "%PROJECT_ROOT%\frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo ❌ Node modules not found. Please run install.bat first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Please run install.bat first or create .env from .env.example.
    pause
    exit /b 1
)

REM Check if package.json file exists
if not exist "package.json" (
    echo ❌ package.json not found. This doesn't appear to be a valid frontend directory.
    pause
    exit /b 1
)

echo ✅ Environment check passed

REM Set environment variables for development
set NODE_ENV=development

echo ⚛️ Starting Vite development server...
echo 📍 Frontend will be available at: http://localhost:5173
echo 💡 Press Ctrl+C to stop the server
echo.

REM Start the Vite development server
call npm run dev

pause
