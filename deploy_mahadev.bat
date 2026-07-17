@echo off
echo ========================================================
echo        CLOSER AI - PHOENIX UNIFIED DEPLOYMENT SCRIPT
echo ========================================================
echo.

echo [1/5] Checking Node.js and PM2...
call npm install -g pm2
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install PM2. Please ensure Node.js is installed.
    exit /b 1
)

echo [2/5] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend npm install failed!
    exit /b 1
)

echo [3/5] Installing Frontend Dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend npm install failed!
    exit /b 1
)

echo [4/5] Starting Backend Microservices via PM2...
cd ../backend
call pm2 start src/server.js --name "closer-backend"
call pm2 start src/microservices/rag-service/server.js --name "rag-service"
call pm2 start src/microservices/vision-service/server.js --name "vision-service"

echo [5/5] Building and Starting Frontend...
cd ../frontend
start cmd /k "npm run dev"

echo.
echo ========================================================
echo Deployment Complete!
echo Backend is running via PM2 (run 'pm2 status' to view)
echo Frontend is running on http://localhost:5173
echo ========================================================
pause
