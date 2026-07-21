const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const pluginService = require('./services/pluginService');
require('dotenv').config();

// Global Error Handlers for Stability
const originalExit = process.exit;
process.exit = function(code) {
  console.error('[DEBUG] process.exit called with code', code, new Error().stack);
  originalExit.call(process, code);
};

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
  // Do not exit, try to recover
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
  // Do not exit, try to recover
});

// Initialize dynamic plugins
pluginService.loadPlugins();

const { setupTelegramBot } = require('./bot/telegramBot');
// Start Telegram Bot Integration
setupTelegramBot();

// ─────────────────────────────────────────────────────────────────────────────
const connectDB = require('./config/db');
const { verifySMTP } = require('./config/mail');
const socketConfig = require('./config/socket');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const apiRoutes = require('./routes/index');

const app = express();
const server = http.createServer(app);

// Database and SMTP connections are validated in the startServer function at the bottom

// Initialize Socket.IO
socketConfig.init(server);

// Start scheduled wellness cron alerts
// Moved to worker.js for modular scaling

// Security & Logging Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disabled for ease of connection during development
}));

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL, 
      'http://localhost:5173',
      'https://companion-ai-khaki.vercel.app'
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    // or if the origin is in our allowed list, or if it's a Vercel deployment
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable Rate Limiting (Phase 4 Security)
// Enable Rate Limiting (Phase 4 Security)
app.use(generalLimiter);

// API Routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173/';
  res.send(`<h2>CloserAI Backend API is running successfully.</h2><p>Please use the frontend URL (e.g., <a href="${frontendUrl}">${frontendUrl}</a>) to access the application interface.</p>`);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Global Error Handler
app.use(errorHandler);

// Background services (Agenda/Cron) have been moved to worker.js

const startServer = async () => {
  try {
    await connectDB();
    await verifySMTP();
    
    // Background services (Agenda/Cron) have been moved to worker.js

    const PORT = process.env.PORT || 5000;
    
    // Auto-healing for Windows Nodemon Port Locks
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${PORT} is in use. Automatic self-healing initiated (Killing zombie process)...`);
        const { exec } = require('child_process');
        exec(`powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force"`, (err) => {
          setTimeout(() => {
            server.close();
            server.listen(PORT, '0.0.0.0');
          }, 2500); // Wait for OS to free the port
        });
      } else {
        console.error('Server error:', e);
      }
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Closer-AI v5.0 Server running on port ${PORT}`);
    });

    // ─────────────────────────────────────────────────────────────────────────────
  } catch (err) {
    console.error('Failed to start server:', err.stack || err);
    process.exit(1);
  }
};

startServer(); // Trigger clean restart

// Graceful Shutdown Handlers
const gracefulShutdown = () => {
  console.log('Initiating graceful shutdown...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.once('SIGUSR2', () => {
  server.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Triggered clean restart to fix port lock
// Reboot 3
// Reboot 4
// Reboot 5
// Reboot 6
// Reboot 7
// Reboot 8
// Reboot 9
// Reboot 10
