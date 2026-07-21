const cron = require('node-cron');
const CronTask = require('../models/CronTask');
const User = require('../models/User');
const RelationshipStats = require('../models/RelationshipStats');
const MemoryVault = require('../models/MemoryVault');
const aiService = require('./aiService');
const pushService = require('./pushService');

// Track active jobs in memory so we don't duplicate them
const activeJobs = new Map();

/**
 * Initializes all active cron jobs from the database.
 */
async function initScheduler() {
  try {
    const tasks = await CronTask.find({ isActive: true });
    console.log(`[Workflow OS] Initializing ${tasks.length} background tasks...`);

    for (const task of tasks) {
      scheduleTask(task);
    }

    // Task 4: Proactive Cron Job
    initProactiveCron();
  } catch (err) {
    console.error('[Workflow OS] Error initializing scheduler:', err.message);
  }
}

/**
 * Schedules a single task using node-cron.
 */
function scheduleTask(task) {
  if (activeJobs.has(task._id.toString())) {
    const existingJob = activeJobs.get(task._id.toString());
    existingJob.stop();
    activeJobs.delete(task._id.toString());
  }

  const job = cron.schedule(task.cronExpression, async () => {
    console.log(`[Workflow OS] Executing Task: ${task.taskName} (ID: ${task._id})`);
    
    try {
      // Create a simulated user message using the AI Prompt
      const messages = [{
        role: 'user',
        parts: [{ text: task.aiPrompt }]
      }];

      const systemPrompt = `You are CloserAI executing a background Workflow OS task.
Generate a comprehensive, beautiful response. Wrap it with CSS formatting and use [HISTORICAL], [CURRENT], and [FORECAST] tags if applicable.`;

      const response = await aiService.generateAIResponse({
        systemPrompt,
        messages,
        energyLevel: 'high',
        domains: ['current_affairs', 'business']
      });

      // Save the generated briefing into the Memory Vault as a Dashboard Alert
      await MemoryVault.create({
        userId: task.userId,
        category: 'knowledge', // Or we could add a new category 'Alert'
        memoryType: 'ShortTerm',
        memory: `[AUTOMATED BRIEFING: ${task.taskName}]\n${response.text}`,
        importanceScore: 10,
        source: 'auto'
      });

      // Update task last run
      task.lastRunAt = new Date();
      await task.save();

      // Trigger Web Push Notification to the user!
      await pushService.sendPushNotification(
        task.userId,
        `Workflow Completed: ${task.taskName}`,
        'Your automated background task has finished. The briefing is ready in your vault!'
      );

      console.log(`[Workflow OS] Task execution completed: ${task.taskName}`);
    } catch (err) {
      console.error(`[Workflow OS] Task execution failed: ${task.taskName}`, err.message);
    }
  });

  activeJobs.set(task._id.toString(), job);
}

/**
 * Adds a new task to the database and schedules it immediately.
 */
async function addNewTask(userId, taskName, cronExpression, aiPrompt) {
  const newTask = await CronTask.create({
    userId,
    taskName,
    cronExpression,
    aiPrompt,
    isActive: true
  });

  scheduleTask(newTask);
  return newTask;
}

module.exports = {
  initScheduler,
  scheduleTask,
  addNewTask
};

/**
 * Initialize system-level proactive cron jobs (Anniversaries, Check-ins)
 */
function initProactiveCron() {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[Workflow OS] Running Proactive Daily Check (9:00 AM)');
    try {
      const stats = await RelationshipStats.find({});
      for (const stat of stats) {
        // If lastInteractionDate is more than 3 days ago
        const lastInteraction = stat.lastInteractionDate || stat.friendshipStartDate;
        const daysSince = lastInteraction ? (Date.now() - lastInteraction.getTime()) / (1000 * 3600 * 24) : 0;
        
        if (daysSince >= 3) {
          const user = await User.findById(stat.userId);
          if (user) {
            console.log(`[Proactive Cron] User ${user.fullName} inactive for ${Math.round(daysSince)} days. Sending miss you ping.`);
            await pushService.sendPushNotification(
              stat.userId,
              `Miss you, ${user.fullName}!`,
              `Ra, ${Math.round(daysSince)} rojulu ayyindi matladi. Ela unnav? Oka sari app open cheyyi.`
            );
          }
        }
      }
    } catch (err) {
      console.error('[Proactive Cron] Error:', err.message);
    }
  });
}
