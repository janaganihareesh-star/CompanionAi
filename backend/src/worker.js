require('dotenv').config();
const connectDB = require('./config/db');
const { verifySMTP } = require('./config/mail');
const { initAgenda } = require('./config/agenda');
const { initScheduler } = require('./services/schedulerService');
const { startProactiveAgents, startMorningReportCron } = require('./services/cronService');

const startWorker = async () => {
  try {
    console.log('🚀 Starting Closer-AI Background Worker Process...');
    
    // Validate core connections
    await connectDB();
    await verifySMTP();
    
    // Initialize Persistent Background Jobs (Agenda)
    await initAgenda();

    // Initialize Workflow OS Scheduler
    await initScheduler();

    // Start proactive cron jobs
    startProactiveAgents();
    startMorningReportCron();

    console.log('✅ Worker initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to start worker:', err.stack || err);
    process.exit(1);
  }
};

startWorker();
