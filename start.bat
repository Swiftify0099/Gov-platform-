@echo off
echo ===================================================
echo Starting GovExam Prep Platform
echo ===================================================

echo [2/4] Checking and starting backend (FastAPI)...
cd backend

REM Check for a valid venv. If activate.bat is missing, recreate it.
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment is missing or incomplete. Recreating...
    if exist venv (
        echo Deleting existing broken venv directory...
        rmdir /s /q venv
    )
    python -m venv venv
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to create Python virtual environment.
        echo Please ensure Python 3.11+ is installed and in your PATH.
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing backend packages (inside venv)...
venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel
venv\Scripts\python.exe -m pip install --no-cache-dir --only-binary=pillow,pandas,asyncpg,pydantic-core pillow pandas asyncpg pydantic pydantic-settings
venv\Scripts\python.exe -m pip install --no-cache-dir -r requirements.txt

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install Python dependencies. The script will now exit.
    echo Please check the errors above, check your internet connection, and try again.
    pause
    exit /b 1
)

echo Starting backend server...
start "FastAPI Backend" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --port 8000"

cd ..

echo [3/4] Checking and starting frontend-web (React)...
cd frontend-web

if not exist node_modules (
    echo Installing frontend-web packages...
    call npm install
)

start "React Frontend Web" cmd /k "npm run dev"

cd ..

echo [4/4] Checking and starting frontend-mobile (React Native)...
cd frontend-mobile

if not exist node_modules (
    echo Installing frontend-mobile packages...
    call npm install
)

start "React Native Mobile" cmd /k "npx expo start"

cd ..

echo ===================================================
echo Done! Servers are starting up in separate windows.
echo - Web Frontend: http://localhost:5173
echo - Mobile Expo: http://localhost:8081
echo - Backend API: http://localhost:8000
echo ===================================================