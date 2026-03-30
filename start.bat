@echo off
echo ===================================================
echo Starting GovExam Prep Platform
echo ===================================================

echo [1/4] Starting Database and Redis via Docker...
docker-compose up -d postgres redis

echo [2/4] Installing and starting backend (FastAPI)...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
start "FastAPI Backend" cmd /k "echo Starting Backend on port 8000... && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"
cd ..

echo [3/4] Installing and starting frontend-web (React)...
cd frontend-web
call npm install
start "React Frontend Web" cmd /k "echo Starting Frontend Web... && npm run dev"
cd ..

echo [4/4] Installing and starting frontend-mobile (React Native)...
cd frontend-mobile
call npm install
start "React Native Mobile" cmd /k "echo Starting Mobile Frontend... && npx expo start"
cd ..

echo ===================================================
echo Done! Servers are starting up in separate windows.
echo - Web Frontend: http://localhost:5173
echo - Mobile Expo: http://localhost:8081
echo - Backend API: http://localhost:8000
echo ===================================================
