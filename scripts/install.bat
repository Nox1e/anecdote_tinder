@echo off
REM Install script for the project
REM This script sets up the Python virtual environment and installs all dependencies

setlocal enabledelayedexpansion

echo 🚀 Starting installation process...

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR:~0,-1%
for %%A in ("%PROJECT_ROOT%") do set PROJECT_ROOT=%%~dpA
set PROJECT_ROOT=%PROJECT_ROOT:~0,-1%

echo 📁 Project root: %PROJECT_ROOT%

REM Check if Python 3 is installed
where python >nul 2>nul
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Python virtual environment
echo 🐍 Setting up Python virtual environment...
cd /d "%PROJECT_ROOT%\backend"

if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
) else (
    echo Virtual environment already exists
)

REM Activate virtual environment and install Python dependencies
echo 📦 Installing Python dependencies...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    exit /b 1
)

REM Install dependencies using the activated virtual environment
python -m pip install --upgrade pip
if errorlevel 1 (
    echo ❌ Failed to upgrade pip
    exit /b 1
)

pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    exit /b 1
)

echo ✅ Python dependencies installed successfully

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd /d "%PROJECT_ROOT%\frontend"
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)

echo ✅ Frontend dependencies installed successfully

REM Create .env files if they don't exist
if not exist "%PROJECT_ROOT%\backend\.env" (
    echo 📝 Creating backend .env file from example...
    copy "%PROJECT_ROOT%\backend\.env.example" "%PROJECT_ROOT%\backend\.env"
)

if not exist "%PROJECT_ROOT%\frontend\.env" (
    echo 📝 Creating frontend .env file from example...
    copy "%PROJECT_ROOT%\frontend\.env.example" "%PROJECT_ROOT%\frontend\.env"
)

echo.
echo 🎉 Installation completed successfully!
echo.
echo 📋 Next steps:
echo   • Run the backend: start_backend.bat
echo   • Run the frontend: start_frontend.bat
echo   • Or run both: start_all.bat
echo.
echo 💡 Note: Make sure to configure your .env files before starting the services.
echo.

pause
