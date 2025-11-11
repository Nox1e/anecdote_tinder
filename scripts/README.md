# Development Scripts

This directory contains utility scripts to help with development setup and execution.

## Scripts

### `install.sh` / `install.bat`
Sets up the entire development environment:
- Creates Python virtual environment for backend
- Installs Python dependencies
- Installs frontend npm packages
- Creates `.env` files from examples if they don't exist

**Usage:**
```bash
# Linux/macOS
./scripts/install.sh

# Windows (from scripts folder or project root)
scripts\install.bat
# or simply double-click: install.bat
```

**Prerequisites:**
- Python 3.8+
- Node.js 16+
- npm

### `start_backend.sh` / `start_backend.bat`
Starts the FastAPI backend development server with hot reload.

**Usage:**
```bash
# Linux/macOS
./scripts/start_backend.sh

# Windows (from scripts folder or project root)
scripts\start_backend.bat
# or simply double-click: start_backend.bat
```

**Access:**
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs

### `start_frontend.sh` / `start_frontend.bat`
Starts the React/Vite frontend development server with hot reload.

**Usage:**
```bash
# Linux/macOS
./scripts/start_frontend.sh

# Windows (from scripts folder or project root)
scripts\start_frontend.bat
# or simply double-click: start_frontend.bat
```

**Access:**
- Frontend app: http://localhost:5173

### `start_all.sh` / `start_all.bat`
Starts both backend and frontend servers.

**Usage:**
```bash
# Linux/macOS (background processes)
./scripts/start_all.sh

# Windows (separate windows)
scripts\start_all.bat
# or simply double-click: start_all.bat
```

**Features:**
- **Linux/macOS**: Runs both servers in background processes, logs to files (`backend.log` and `frontend.log`), graceful shutdown with Ctrl+C
- **Windows**: Opens both servers in separate console windows for easy monitoring and stopping

## Platform Compatibility

### Linux/macOS
All `.sh` scripts work natively on Linux and macOS systems with bash.

### Windows
Batch files (`.bat`) are provided for Windows users:
- Can be run from Command Prompt (cmd.exe) or PowerShell
- Can be double-clicked to execute
- Each script opens in its own console window (except `install.bat` which runs in the current window)
- Close the console window to stop a server

## Environment Configuration

The scripts will create `.env` files from `.env.example` if they don't exist. Make sure to configure these files before starting the services:

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

## Troubleshooting

### All Platforms
1. **Port conflicts**: Check if ports 8000 (backend) or 5173 (frontend) are already in use
2. **Dependencies issues**: Run `install.sh` (or `install.bat` on Windows) to refresh all dependencies
3. **Virtual environment issues**: 
   - Delete `backend/.venv` folder
   - Run install script again

### Linux/macOS
1. **Permission denied**: Run `chmod +x scripts/*.sh` to make scripts executable

### Windows
1. **Python/Node not found**: Make sure Python and Node.js are installed and added to system PATH
2. **Scripts won't execute**: 
   - Try running from Command Prompt (cmd.exe) instead of PowerShell
   - Right-click and select "Run as administrator" if permission issues occur
3. **"Access denied" errors**: Disable antivirus temporarily or add project folder to antivirus exclusions