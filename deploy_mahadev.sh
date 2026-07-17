#!/bin/bash
echo "========================================================"
echo "       CLOSER AI - PHOENIX UNIFIED DEPLOYMENT SCRIPT"
echo "========================================================"
echo ""

echo "[1/5] Checking Node.js and PM2..."
npm install -g pm2
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install PM2. Please ensure Node.js is installed."
    exit 1
fi

echo "[2/5] Installing Backend Dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Backend npm install failed!"
    exit 1
fi

echo "[3/5] Installing Frontend Dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Frontend npm install failed!"
    exit 1
fi

echo "[4/5] Starting Backend Microservices via PM2..."
cd ../backend
pm2 start src/server.js --name "closer-backend"
pm2 start src/microservices/rag-service/server.js --name "rag-service"
pm2 start src/microservices/vision-service/server.js --name "vision-service"

echo "[5/5] Building and Starting Frontend..."
cd ../frontend
# Run frontend in background for unix systems
npm run dev &

echo ""
echo "========================================================"
echo "Deployment Complete!"
echo "Backend is running via PM2 (run 'pm2 status' to view)"
echo "Frontend is running on http://localhost:5173"
echo "========================================================"
