#!/bin/bash

# Start both backend and frontend development servers
# This script orchestrates starting both services in background processes

set -e  # Exit on any error

echo "🚀 Starting both backend and frontend development servers..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Project root: $PROJECT_ROOT"

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    echo "✅ All servers stopped"
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM

# Check if virtual environment exists
if [ ! -d "$PROJECT_ROOT/backend/.venv" ]; then
    echo "❌ Backend virtual environment not found. Please run ./scripts/install.sh first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo "❌ Frontend node modules not found. Please run ./scripts/install.sh first."
    exit 1
fi

# Check if .env files exist
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo "❌ Backend .env file not found. Please run ./scripts/install.sh first."
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo "❌ Frontend .env file not found. Please run ./scripts/install.sh first."
    exit 1
fi

echo "✅ Environment check passed"

# Start backend in background
echo "🐍 Starting backend server in background..."
cd "$PROJECT_ROOT/backend"
source .venv/bin/activate
export PYTHONPATH="$PROJECT_ROOT/backend:$PYTHONPATH"
export ENVIRONMENT="development"

# Start backend and capture PID
python main.py > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check backend.log for details."
    cat "$PROJECT_ROOT/backend.log"
    exit 1
fi

echo "✅ Backend started (PID: $BACKEND_PID)"

# Start frontend in background
echo "⚛️ Starting frontend server in background..."
cd "$PROJECT_ROOT/frontend"
export NODE_ENV="development"

# Start frontend and capture PID
npm run dev > "$PROJECT_ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start. Check frontend.log for details."
    cat "$PROJECT_ROOT/frontend.log"
    cleanup
    exit 1
fi

echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Both servers are running!"
echo ""
echo "📍 Backend API: http://localhost:8000"
echo "📍 Backend docs: http://localhost:8000/docs"
echo "📍 Frontend app: http://localhost:5173"
echo ""
echo "📋 Logs:"
echo "  • Backend: $PROJECT_ROOT/backend.log"
echo "  • Frontend: $PROJECT_ROOT/frontend.log"
echo ""
echo "💡 Press Ctrl+C to stop both servers"
echo ""

# Wait for background processes or interrupt signal
wait