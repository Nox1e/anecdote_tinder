#!/bin/bash

# Start frontend development server
# This script starts the React/Vite frontend with hot reload

set -e  # Exit on any error

echo "🚀 Starting frontend development server..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Project root: $PROJECT_ROOT"

# Change to frontend directory
cd "$PROJECT_ROOT/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Node modules not found. Please run ./scripts/install.sh first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please run ./scripts/install.sh first or create .env from .env.example."
    exit 1
fi

# Check if required packages are installed
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. This doesn't appear to be a valid frontend directory."
    exit 1
fi

echo "✅ Environment check passed"

# Set environment variables for development
export NODE_ENV="development"

echo "⚛️ Starting Vite development server..."
echo "📍 Frontend will be available at: http://localhost:5173"
echo "💡 Press Ctrl+C to stop the server"
echo ""

# Start the Vite development server
npm run dev