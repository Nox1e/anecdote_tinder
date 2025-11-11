@echo off
REM Start both backend and frontend development servers
REM This script orchestrates starting both services in separate windows

setlocal enabledelayedexpansion

echo 🚀 Starting both backend and frontend development servers...

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR:~0,-1%
for %%A in ("%PROJECT_ROOT%") do set PROJECT_ROOT=%%~dpA
set PROJECT_ROOT=%PROJECT_ROOT:~0,-1%

echo 📁 Project root: %PROJECT_ROOT%

REM Check if virtual environment exists
if not exist "%PROJECT_ROOT%\backend\.venv" (
    echo ❌ Backend virtual environment not found. Please run install.bat first.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "%PROJECT_ROOT%\frontend\node_modules" (
    echo ❌ Frontend node modules not found. Please run install.bat first.
    pause
    exit /b 1
)

REM Check if .env files exist
if not exist "%PROJECT_ROOT%\backend\.env" (
    echo ❌ Backend .env file not found. Please run install.bat first.
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%\frontend\.env" (
    echo ❌ Frontend .env file not found. Please run install.bat first.
    pause
    exit /b 1
)

echo ✅ Environment check passed

echo 🐍 Starting backend server in a new window...
start "Backend Server" /d "%PROJECT_ROOT%\scripts" cmd /k call start_backend.bat

echo ⚛️ Starting frontend server in a new window...
start "Frontend Server" /d "%PROJECT_ROOT%\scripts" cmd /k call start_frontend.bat

echo.
echo 🎉 Both servers are starting!
echo.
echo 📍 Backend API: http://localhost:8000
echo 📍 Backend docs: http://localhost:8000/docs
echo 📍 Frontend app: http://localhost:5173
echo.
echo 💡 Use the taskbar to switch between server windows
echo.
echo Note: Close each window individually to stop the servers
echo.

pause
