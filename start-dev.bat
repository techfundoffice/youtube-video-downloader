@echo off
REM YouTube Downloader - Development Startup Script for Windows

echo Starting YouTube Video Downloader...

REM Check if virtual environment exists
if not exist "backend\venv\" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    cd ..
)

REM Activate virtual environment and install backend dependencies
echo Installing backend dependencies...
cd backend
call venv\Scripts\activate.bat
pip install -r requirements.txt >nul 2>&1
cd ..

REM Install frontend dependencies if needed
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Start backend in new window
echo Starting Flask backend on port 5000...
start "YouTube Downloader - Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python app.py"

REM Wait for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend in new window
echo Starting React frontend on port 5173...
start "YouTube Downloader - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo YouTube Downloader is running!
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo Close the terminal windows to stop the servers.
pause
