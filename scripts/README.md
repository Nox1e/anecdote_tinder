# Development Scripts

This directory contains utility scripts to help with development setup and execution.

## Scripts

### `install.sh`
Sets up the entire development environment:
- Creates Python virtual environment for backend
- Installs Python dependencies
- Installs frontend npm packages
- Creates `.env` files from examples if they don't exist

**Usage:**
```bash
./scripts/install.sh
```

**Prerequisites:**
- Python 3.8+
- Node.js 16+
- npm

### `start_backend.sh`
Starts the FastAPI backend development server with hot reload.

**Usage:**
```bash
./scripts/start_backend.sh
```

**Access:**
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs

### `start_frontend.sh`
Starts the React/Vite frontend development server with hot reload.

**Usage:**
```bash
./scripts/start_frontend.sh
```

**Access:**
- Frontend app: http://localhost:5173

### `start_all.sh`
Starts both backend and frontend servers in background processes.

**Usage:**
```bash
./scripts/start_all.sh
```

**Features:**
- Runs both servers simultaneously
- Logs output to files (`backend.log` and `frontend.log`)
- Graceful shutdown with Ctrl+C
- Shows PIDs for both processes

## Platform Compatibility

### Linux/macOS
All scripts work natively on Linux and macOS systems with bash.

### Windows
For Windows users, you can:
1. Use WSL (Windows Subsystem for Linux) to run these scripts natively
2. Run the commands manually:
   - Backend: `cd backend && source .venv/bin/activate && python main.py`
   - Frontend: `cd frontend && npm run dev`

## Environment Configuration

The scripts will create `.env` files from `.env.example` if they don't exist. Make sure to configure these files before starting the services:

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

## Troubleshooting

1. **Permission denied**: Run `chmod +x scripts/*.sh` to make scripts executable
2. **Virtual environment issues**: Delete `backend/.venv` and run `install.sh` again
3. **Port conflicts**: Check if ports 8000 (backend) or 5173 (frontend) are already in use
4. **Dependencies issues**: Run `install.sh` to refresh all dependencies