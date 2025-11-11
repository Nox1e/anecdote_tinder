#!/bin/bash

# Seed database with test users
# This script populates the database with celebrity user profiles

set -e  # Exit on any error

echo "🌱 Seeding database with test users..."

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
if ! python -c "import fastapi, sqlalchemy" 2>/dev/null; then
    echo "❌ Required packages not found. Please run ./scripts/install.sh first."
    exit 1
fi

echo "✅ Environment check passed"

# Set environment variables for development
export PYTHONPATH="$PROJECT_ROOT/backend:$PYTHONPATH"

echo "🚀 Running seed script..."
echo ""

# Run the seed script
python seed_users.py

echo ""
echo "✅ Database seeding completed!"
echo ""
echo "💡 You can now login with any of the seeded accounts:"
echo "   Email: username@domain.com (e.g., elon@tesla.com)"
echo "   Password: password123"
echo ""
