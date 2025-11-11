@echo off
REM Seed database with test users
REM This script populates the database with celebrity user profiles

setlocal enabledelayedexpansion

echo 🌱 Seeding database with test users...

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
python -c "import fastapi, sqlalchemy" >nul 2>nul
if errorlevel 1 (
    echo ❌ Required packages not found. Please run install.bat first.
    pause
    exit /b 1
)

echo ✅ Environment check passed

echo 🚀 Running seed script...
echo.

REM Run the seed script
python seed_users.py
if errorlevel 1 (
    echo ❌ Database seeding failed.
    pause
    exit /b 1
)

echo.
echo ✅ Database seeding completed!
echo.
echo 💡 You can now login with any of the seeded accounts:
echo    Email: username@domain.com (e.g., elon@tesla.com)
echo    Password: password123
echo.

pause
