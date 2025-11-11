#!/bin/bash

# Start backend development server
# This script starts the FastAPI backend with hot reload

set -e  # Exit on any error

echo "🚀 Starting backend development server..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Project root: $PROJECT_ROOT"

# Change to backend directory
cd "$PROJECT_ROOT/backend"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run ./scripts/install.sh first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please run ./scripts/install.sh first or create .env from .env.example."
    exit 1
fi

# Activate virtual environment
echo "🐍 Activating virtual environment..."
source .venv/bin/activate

# Check if required packages are installed
if ! python -c "import fastapi, uvicorn" 2>/dev/null; then
    echo "❌ Required packages not found. Please run ./scripts/install.sh first."
    exit 1
fi

echo "✅ Environment check passed"

# Set environment variables for development
export PYTHONPATH="$PROJECT_ROOT/backend:$PYTHONPATH"
export ENVIRONMENT="development"

echo "🌐 Starting FastAPI server..."
echo "📍 Backend will be available at: http://localhost:8000"
echo "📖 API docs will be available at: http://localhost:8000/docs"
echo ""
echo "💡 Press Ctrl+C to stop the server"
echo ""

# Start the FastAPI server
python main.py