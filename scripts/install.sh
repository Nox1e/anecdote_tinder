#!/bin/bash

# Install script for the project
# This script sets up the Python virtual environment and installs all dependencies

set -e  # Exit on any error

echo "🚀 Starting installation process..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Project root: $PROJECT_ROOT"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Python virtual environment
echo "🐍 Setting up Python virtual environment..."
cd "$PROJECT_ROOT/backend"

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment and install Python dependencies
echo "📦 Installing Python dependencies..."
source .venv/bin/activate
# Install dependencies using the activated virtual environment
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Python dependencies installed successfully"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
npm install

echo "✅ Frontend dependencies installed successfully"

# Create .env files if they don't exist
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo "📝 Creating backend .env file from example..."
    cp "$PROJECT_ROOT/backend/.env.example" "$PROJECT_ROOT/backend/.env"
fi

if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo "📝 Creating frontend .env file from example..."
    cp "$PROJECT_ROOT/frontend/.env.example" "$PROJECT_ROOT/frontend/.env"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  • Run the backend: ./scripts/start_backend.sh"
echo "  • Run the frontend: ./scripts/start_frontend.sh"
echo "  • Or run both: ./scripts/start_all.sh"
echo ""
echo "💡 Note: Make sure to configure your .env files before starting the services."