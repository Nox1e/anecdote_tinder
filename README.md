# Project - Comprehensive Setup and Documentation

A full-stack dating application with a Python FastAPI backend and React frontend, featuring user authentication, profile management, matching, and messaging capabilities.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Seeding](#database-seeding)
- [Running the Application](#running-the-application)
  - [Quick Start](#quick-start)
  - [Running Backend](#running-backend)
  - [Running Frontend](#running-frontend)
- [Environment Configuration](#environment-configuration)
- [API Overview](#api-overview)
- [Frontend Pages](#frontend-pages)
- [Testing](#testing)
  - [Backend Tests](#backend-tests)
  - [Frontend Tests](#frontend-tests)
- [Development Scripts](#development-scripts)
- [Linting and Formatting](#linting-and-formatting)
- [Authentication & Session Management](#authentication--session-management)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Known Limitations](#known-limitations)

## Overview

This project is a dating application that allows users to:

- **Register and authenticate** with secure password hashing and JWT token management
- **Create and manage profiles** with personal information
- **Search and discover** other users
- **Like and match** with other users
- **Manage account settings** including profile visibility and account closure
- **View mutual matches** and interactions

The application uses a modern tech stack with clear separation between backend API and frontend UI, making it scalable and maintainable for future enhancements.

## Tech Stack

### Backend
- **Framework:** FastAPI 0.104+ (Python async web framework)
- **Server:** Uvicorn 0.24+ (ASGI application server)
- **Database:** SQLAlchemy 2.0+ (ORM) with SQLite for development
- **Authentication:** JWT tokens with python-jose and bcrypt for password hashing
- **Validation:** Pydantic 2.5+ for data validation
- **Testing:** pytest 7.4+ with pytest-asyncio for async test support
- **Python:** 3.8+

### Frontend
- **Framework:** React 18.2+ with TypeScript
- **Build Tool:** Vite 5.0+ for fast development and optimized production builds
- **Routing:** React Router v6 for client-side navigation
- **State Management:** Zustand 4.4+ for lightweight global state
- **Styling:** Tailwind CSS 3.3+ for utility-first CSS
- **HTTP Client:** Axios 1.6+ for API requests
- **Form Validation:** React Hook Form 7.48+ with Zod 3.22+ for schema validation
- **Testing:** Vitest 1.2+ with React Testing Library 14.2+
- **Node.js:** 16+

## Repository Structure

```
project/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── auth.py        # Authentication endpoints (register, login, logout)
│   │   │   ├── profile.py     # User profile endpoints
│   │   │   ├── like.py        # Like/match endpoints
│   │   │   ├── feed.py        # Feed/discovery endpoints
│   │   │   └── settings.py    # Account settings endpoints
│   │   ├── models/            # SQLAlchemy models (User, Profile, Like, etc.)
│   │   ├── schemas/           # Pydantic schemas for request/response validation
│   │   ├── services/          # Business logic and database operations
│   │   ├── db/                # Database session and initialization
│   │   ├── auth.py            # Authentication utilities (token, password hashing)
│   │   ├── config.py          # Application configuration from environment
│   │   └── main.py            # FastAPI app instantiation and middleware setup
│   ├── tests/                 # Backend test suite
│   │   ├── test_auth.py       # Authentication tests
│   │   ├── test_profile.py    # Profile management tests
│   │   ├── test_like.py       # Like/matching tests
│   │   └── conftest.py        # pytest fixtures and setup
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Example environment variables
│   ├── seed_users.py          # Database seeding script (celebrity profiles)
│   └── main.py                # Entry point script
│
├── frontend/                  # React + Vite frontend application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── LoginPage.tsx         # User login page
│   │   │   ├── RegisterPage.tsx      # User registration page
│   │   │   ├── SearchPage.tsx        # Discover and search other users
│   │   │   ├── MatchesPage.tsx       # View matched users
│   │   │   ├── ProfilePage.tsx       # Manage user profile
│   │   │   ├── SettingsPage.tsx      # Account settings
│   │   │   └── __tests__/            # Page component tests
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useAuth.ts     # Auth context and state management
│   │   ├── services/          # HTTP clients for API calls
│   │   │   └── index.ts       # Service exports (authService, profileService, etc.)
│   │   ├── state/             # Zustand stores
│   │   ├── types/             # TypeScript type definitions
│   │   ├── test/              # Test setup and utilities
│   │   ├── App.tsx            # Main app component with routing
│   │   └── main.tsx           # React entry point
│   ├── vite.config.ts         # Vite configuration with test setup
│   ├── tsconfig.json          # TypeScript configuration
│   ├── package.json           # npm dependencies and scripts
│   ├── .env.example           # Example environment variables
│   └── tailwind.config.ts     # Tailwind CSS configuration
│
├── scripts/                   # Development utility scripts
│   ├── install.sh             # Setup script (installs all dependencies)
│   ├── seed_users.sh          # Database seeding (test users)
│   ├── start_backend.sh       # Starts the backend server
│   ├── start_frontend.sh      # Starts the frontend dev server
│   ├── start_all.sh           # Starts both servers in background
│   └── README.md              # Script documentation
│
├── docs/                      # Documentation and assets
├── pyproject.toml             # Python project configuration (build, testing, linting)
└── README.md                  # This file
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8 or higher** - Required for the backend
  - Check: `python --version` or `python3 --version`
  - Download: https://www.python.org/downloads/

- **Node.js 16 or higher** - Required for the frontend
  - Check: `node --version`
  - Download: https://nodejs.org/

- **npm (Node Package Manager)** - Usually comes with Node.js
  - Check: `npm --version`

- **Git** - For version control
  - Check: `git --version`

- **Bash** - For running shell scripts (included on macOS/Linux; Windows users can use WSL)

## Installation

### Option 1: Using the Installation Script (Recommended)

The easiest way to get started is to use the provided installation script:

```bash
# From the project root directory
chmod +x scripts/install.sh
./scripts/install.sh
```

This script will:
1. Create a Python virtual environment for the backend
2. Install all Python dependencies from `requirements.txt`
3. Install all npm packages for the frontend
4. Create `.env` files from `.env.example` files if they don't exist

### Option 2: Manual Installation

If you prefer to set up manually:

#### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv .venv

# Activate the virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from example (if not already done)
cp .env.example .env
```

#### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Create .env file from example (if not already done)
cp .env.example .env
```

## Database Seeding

Seed the development database with ready-to-use celebrity profiles for quick testing.

### Using the Script (macOS/Linux)

```bash
./scripts/seed_users.sh
```

### Using the Script (Windows)

```powershell
scripts\seed_users.bat
```

**What the script does:**
- Activates the backend virtual environment automatically
- Ensures dependencies are installed and environment variables are configured
- Creates all database tables if they do not exist
- Adds 15 celebrity user accounts with complete profiles
- Skips seeding if the database already contains users

**Default login credentials:**
- `elon@tesla.com` / `password123`
- `mark@facebook.com` / `password123`
- `taylor@swiftmusic.com` / `password123`

💡 Run the seed script after the installation step anytime you need fresh sample data.

## Running the Application

### Quick Start

Start both servers simultaneously:

```bash
./scripts/start_all.sh
```

This will:
- Start the backend on `http://localhost:8000`
- Start the frontend on `http://localhost:5173`
- Display PIDs for both processes
- Log output to `backend.log` and `frontend.log`
- Allow graceful shutdown with `Ctrl+C`

### Running Backend

#### Using the Script (Recommended)

```bash
./scripts/start_backend.sh
```

#### Manual Backend Startup

```bash
cd backend

# Activate virtual environment (if not already active)
source .venv/bin/activate  # macOS/Linux
# or .venv\Scripts\activate  # Windows

# Run the server
python main.py
```

**Backend Access:**
- API Base URL: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs` (interactive Swagger UI)
- Alternative Docs: `http://localhost:8000/redoc` (ReDoc)
- Health Check: `http://localhost:8000/health`

### Running Frontend

#### Using the Script (Recommended)

```bash
./scripts/start_frontend.sh
```

#### Manual Frontend Startup

```bash
cd frontend

# Run the development server
npm run dev
```

**Frontend Access:**
- Application URL: `http://localhost:5173` (Vite dev server default port)

## Environment Configuration

### Backend Configuration

Create or edit `backend/.env` with the following variables:

```env
# Application Configuration
APP_NAME=FastAPI Backend
DEBUG=false
VERSION=0.1.0

# Database Configuration
DATABASE_URL=sqlite:///./data/app.db

# Security
SECRET_KEY=your-secret-key-change-in-production

# CORS Origins (comma-separated URLs allowed to access the API)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

**Configuration Details:**
- `APP_NAME`: Display name for the application
- `DEBUG`: Set to `true` for development with auto-reload; `false` for production
- `DATABASE_URL`: SQLite path for development; change to PostgreSQL/MySQL for production
- `SECRET_KEY`: Used for signing JWT tokens; change to a secure random string for production
- `CORS_ORIGINS`: Comma-separated list of frontend URLs allowed to make requests
- `HOST`: Server bind address (`0.0.0.0` for all interfaces)
- `PORT`: Server listen port

### Frontend Configuration

Create or edit `frontend/.env` with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Application Configuration
VITE_APP_NAME=Frontend App
VITE_APP_VERSION=0.1.0
```

**Configuration Details:**
- `VITE_API_BASE_URL`: Backend API URL for all HTTP requests
- `VITE_APP_NAME`: Application name displayed in the UI
- `VITE_APP_VERSION`: Version number for the frontend

**Environment Variable Naming:**
- Frontend environment variables must start with `VITE_` to be accessible in the browser
- Access them in code with: `import.meta.env.VITE_API_BASE_URL`

## API Overview

The backend provides RESTful API endpoints for the frontend. Base URL: `http://localhost:8000`

### Authentication Endpoints (`/auth`)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|-----------------|
| POST | `/auth/register` | Register a new user | None |
| POST | `/auth/login` | Authenticate and receive JWT token | None |
| GET | `/auth/me` | Get current authenticated user | Required |
| POST | `/auth/logout` | Logout and revoke session | Required |

**Example: Login**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Profile Endpoints (`/profile`)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|-----------------|
| GET | `/profile/me` | Get current user's profile | Required |
| PUT | `/profile/me` | Update current user's profile | Required |
| GET | `/profile/profiles/{user_id}` | Get public profile of a user | None |

**Profile Fields:**
- `display_name` - User's display name
- `bio` - Short biography
- `age` - User's age
- `gender` - Gender ('male', 'female', 'other', 'prefer_not_to_say')
- `interests` - List of interests/hobbies
- `location` - User's location
- `is_active` - Whether profile is visible in search

### Like/Match Endpoints (`/like`)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|-----------------|
| POST | `/like/{user_id}` | Like/interact with another user | Required |
| GET | `/like/matches` | Get list of matched users | Required |

### Feed Endpoints (`/feed`)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|-----------------|
| GET | `/feed/discover` | Get list of users to discover | Required |

### Settings Endpoints (`/settings`)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|-----------------|
| POST | `/settings/close-profile` | Close/hide user profile | Required |
| POST | `/settings/reopen-profile` | Reopen/unhide user profile | Required |

**Full API Documentation:**
Visit `http://localhost:8000/docs` when the backend is running for interactive Swagger UI documentation with the ability to test endpoints directly.

## Frontend Pages

The frontend includes the following main pages:

### Public Pages (No Authentication Required)

- **Login Page** (`/login`)
  - User email/password authentication
  - Link to registration page
  - Session persistence using JWT tokens in sessionStorage

- **Register Page** (`/register`)
  - New user registration form
  - Email, username, password validation
  - Link to login page

### Protected Pages (Authentication Required)

- **Search Page** (`/search`) - Default landing page after login
  - Discover and browse other users' profiles
  - View user photos and basic information
  - Like or pass on profiles
  - Real-time discovery feed

- **Matches Page** (`/matches`)
  - View all mutual matches
  - See matched user profiles
  - Open conversation or view details

- **Profile Page** (`/profile`)
  - View and edit personal profile information
  - Upload/manage profile pictures
  - Update interests, bio, and preferences
  - Form validation with Zod schema validation
  - Auto-save profile changes

- **Settings Page** (`/settings`)
  - Account preferences and visibility settings
  - Close or reopen profile visibility
  - View and manage account security
  - Logout functionality

## Testing

### Backend Tests

Run backend tests using pytest:

```bash
# From project root, activate virtual environment first
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run tests with coverage report
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py

# Run tests matching a pattern
pytest tests/test_auth.py::test_register
```

**Test Files:**
- `tests/test_auth.py` - Authentication endpoint tests (register, login, logout)
- `tests/test_profile.py` - Profile management tests
- `tests/test_like.py` - Like/matching functionality tests
- `tests/test_main.py` - Main app health check tests

**Test Setup:** The project uses `conftest.py` for pytest fixtures providing test database sessions and test client setup.

### Frontend Tests

Run frontend tests using Vitest:

```bash
cd frontend

# Run tests once
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test -- --watch

# Run tests with UI
npm run test -- --ui

# Run tests with coverage
npm run test -- --coverage
```

**Test Framework:**
- **Vitest** - Fast unit test framework compatible with Jest
- **React Testing Library** - Component testing best practices
- Test setup file: `src/test/setup.ts`
- Test configuration: `vite.config.ts` (test section)

**Test Files:**
- Component tests located in `src/pages/__tests__/` and component directories
- Mock setup in test files using `vi.mock()` for services and hooks
- Global test setup in `src/test/setup.ts`

## Development Scripts

Utility scripts are provided in the `scripts/` directory to streamline development:

### `install.sh`

Performs complete project setup:

```bash
./scripts/install.sh
```

**What it does:**
- Creates Python virtual environment (`backend/.venv`)
- Installs Python dependencies
- Installs npm packages
- Creates `.env` files if missing

### `start_backend.sh`

Starts the FastAPI backend development server:

```bash
./scripts/start_backend.sh
```

**Features:**
- Activates virtual environment automatically
- Runs with hot reload enabled
- Available at `http://localhost:8000`
- Logs displayed in terminal

### `start_frontend.sh`

Starts the React frontend development server:

```bash
./scripts/start_frontend.sh
```

**Features:**
- Runs Vite dev server with hot module replacement
- Available at `http://localhost:5173`
- Logs displayed in terminal

### `start_all.sh`

Starts both servers simultaneously in background:

```bash
./scripts/start_all.sh
```

**Features:**
- Runs backend and frontend in parallel
- Logs to `backend.log` and `frontend.log`
- Displays process IDs
- Graceful shutdown on `Ctrl+C`
- Easy cleanup of background processes

### `seed_users.sh`

Seeds the database with celebrity demo users for instant testing:

```bash
./scripts/seed_users.sh
```

**Features:**
- Activates the backend virtual environment automatically
- Creates tables if they do not exist
- Inserts 15 celebrity users with full profiles and `password123` password
- Skips seeding when users are already present

For more details, see `scripts/README.md`

## Linting and Formatting

### Backend Linting

The backend uses standard Python tooling configured in `pyproject.toml`:

```bash
cd backend

# Format code with Black
black .

# Sort imports with isort
isort .

# Run type checking with mypy
mypy app/

# Run linting with Flake8
flake8 app/
```

### Frontend Linting and Formatting

```bash
cd frontend

# Run ESLint to check for issues
npm run lint

# Automatically fix ESLint issues
npm run lint:fix

# Check code formatting with Prettier
npm run format:check

# Automatically format code with Prettier
npm run format

# Run TypeScript type checking
npm run type-check
```

## Authentication & Session Management

### How Authentication Works

1. **User Registration/Login:**
   - User submits credentials to `/auth/register` or `/auth/login`
   - Backend validates credentials and creates a JWT token
   - Frontend receives token and stores it in `sessionStorage`

2. **JWT Token Storage:**
   - Token is stored in browser's `sessionStorage` (cleared on browser close)
   - Alternative: Can be stored in `localStorage` for persistent sessions
   - Token is sent with each API request in the `Authorization: Bearer <token>` header

3. **State Management:**
   - Frontend uses **Zustand** store (`useAuthStore`) for centralized auth state
   - Auth state includes: user info, token, loading status, error messages
   - `useAuth` hook provides convenient access to auth state and actions

4. **Protected Routes:**
   - Frontend checks `isAuthenticated` flag before allowing access to protected pages
   - Unauthenticated users are redirected to login page
   - Session hydration on app startup checks for existing valid token

5. **Logout:**
   - Logout clears token from storage and updates state
   - Optional: Backend can revoke token for additional security

### Security Considerations

- **Production Deployment:**
  - Change `SECRET_KEY` in backend `.env` to a secure random string
  - Use HTTPS for all API communications
  - Set `DEBUG=false` in backend configuration
  - Configure `CORS_ORIGINS` to only include your frontend domain
  - Store tokens in HTTP-only cookies (more secure than localStorage)

- **Current Limitations (Development):**
  - Simple JWT-based authentication (no OAuth/SSO yet)
  - Tokens stored in sessionStorage (not HTTP-only cookies)
  - No refresh token rotation
  - Password reset not implemented

See [Known Limitations](#known-limitations) section below.

## Troubleshooting

### Common Issues and Solutions

#### Port Already in Use

**Problem:** "Address already in use" error when starting servers

**Solution:**
```bash
# Kill process using port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process using port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

#### Virtual Environment Issues

**Problem:** Python not found or virtual environment not activating

**Solution:**
```bash
# Delete existing virtual environment and reinstall
cd backend
rm -rf .venv
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### Dependency Installation Failures

**Problem:** `npm install` or `pip install` fails

**Solution:**
```bash
# Frontend: Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Backend: Upgrade pip and reinstall
pip install --upgrade pip
pip install -r requirements.txt
```

#### Database Issues

**Problem:** SQLite database errors or missing database

**Solution:**
```bash
# Backend creates database automatically
# To reset database:
cd backend
rm -rf data/app.db
python main.py  # This will recreate the database
```

#### Backend Can't Connect to Database

**Problem:** "Cannot open shared object file" or database connection errors

**Solution:**
- Ensure `DATABASE_URL` in `.env` is correctly formatted
- For SQLite: `DATABASE_URL=sqlite:///./data/app.db`
- Ensure the parent directory exists (backend creates it automatically)

#### Frontend API Connection Issues

**Problem:** "Failed to fetch" or CORS errors

**Solution:**
1. Verify backend is running on correct port (8000)
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Verify `CORS_ORIGINS` in backend `.env` includes frontend URL
4. Check browser console for specific error messages

#### Tests Failing

**Problem:** Test failures or test runner crashes

**Solution:**
```bash
# Backend tests
cd backend
pytest -v --tb=short  # Show full traceback

# Frontend tests
cd frontend
npm run test -- --reporter=verbose
```

#### Scripts Not Executable

**Problem:** "Permission denied" when running scripts

**Solution:**
```bash
chmod +x scripts/*.sh
./scripts/install.sh
```

### Getting Help

If issues persist:

1. Check the full error message and traceback
2. Verify all prerequisites are installed (`python --version`, `node --version`)
3. Ensure all `.env` files are properly configured
4. Review logs in `backend.log` and `frontend.log` (when using `start_all.sh`)
5. Try a clean reinstall with `./scripts/install.sh`

## Future Enhancements

### Planned Features

1. **Messaging System**
   - Real-time chat between matched users
   - WebSocket support for live notifications
   - Message history and search

2. **Enhanced Search**
   - Advanced filters (age, location, interests)
   - Saved search preferences
   - Search history

3. **User Verification**
   - Photo verification system
   - Email verification
   - Phone number verification

4. **Notifications**
   - Like notifications
   - Match notifications
   - Message notifications

5. **Mobile Application**
   - React Native mobile app
   - Push notifications
   - Native platform features

6. **Security Enhancements**
   - OAuth/SSO integration (Google, Facebook)
   - Two-factor authentication
   - Refresh token rotation
   - Rate limiting

7. **Analytics**
   - User engagement metrics
   - Popular search terms
   - Match success tracking

8. **Database**
   - Migration to PostgreSQL for production
   - Redis cache layer
   - Database scaling for production

### Adding New Features

To add new API endpoints:

1. Create route file in `backend/app/api/`
2. Create Pydantic schema in `backend/app/schemas/`
3. Create SQLAlchemy model in `backend/app/models/` if needed
4. Add routes to `backend/app/main.py`
5. Write tests in `backend/tests/`
6. Create frontend service in `frontend/src/services/`
7. Create React components in `frontend/src/pages/` or `frontend/src/components/`
8. Add routes to `frontend/src/App.tsx`

## Known Limitations

### Current Development Status

This project is designed for development and learning purposes. The following limitations apply:

1. **Authentication**
   - Simple session-based authentication, not production-ready
   - Tokens stored in `sessionStorage`, not HTTP-only cookies
   - No refresh token mechanism
   - No password reset functionality

2. **Database**
   - SQLite database (single-user, file-based)
   - Not suitable for concurrent production load
   - No built-in backup/recovery system
   - Migrate to PostgreSQL/MySQL for production

3. **Security**
   - Running on `DEBUG=true` by default for development
   - CORS allows all methods and headers
   - No rate limiting on API endpoints
   - `SECRET_KEY` is a default placeholder
   - No HTTPS by default

4. **Performance**
   - No caching layer (Redis)
   - No database query optimization
   - No pagination on large result sets
   - Not optimized for high concurrent users

5. **Features**
   - No real-time notifications
   - No message/chat system yet
   - Limited user discovery options
   - No image upload/storage (photos managed externally)

### Production Readiness Checklist

Before deploying to production, ensure:

- [ ] Change `SECRET_KEY` to a strong random string
- [ ] Set `DEBUG=false`
- [ ] Configure `CORS_ORIGINS` to specific domain(s)
- [ ] Use environment-specific `.env` files
- [ ] Set up HTTPS/SSL certificate
- [ ] Migrate database to PostgreSQL or MySQL
- [ ] Set up database backups
- [ ] Configure error logging and monitoring
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Set up automated tests and CI/CD
- [ ] Implement security headers
- [ ] Use environment secrets for sensitive data

### Scalability Notes

For production deployment with multiple users:

- Deploy backend to cloud platform (AWS, GCP, Heroku, DigitalOcean)
- Use managed PostgreSQL database
- Add Redis for caching and session management
- Implement API rate limiting
- Set up CDN for frontend assets
- Use load balancer for multiple backend instances
- Implement database connection pooling
- Monitor performance and set up alerts

---

**Project Version:** 0.1.0  
**Last Updated:** November 2024  
**License:** MIT

For detailed information about development scripts, see `scripts/README.md`
