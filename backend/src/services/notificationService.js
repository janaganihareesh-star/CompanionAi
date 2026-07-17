const cron = require('node-cron');
const Notification = require('../models/Notification');
const User = require('../models/User');
const UserPreference = require('../models/UserPreference');
const Goal = require('../models/Goal');
const ImportantDate = require('../models/ImportantDate');
const WeeklyReflection = require('../models/WeeklyReflection');
const socketConfig = require('../config/socket');
const pushService = require('./pushService');

// Generate and dispatch individual alerts
async function createNotification({ userId, title, body, type = 'general' }) {
  try {
    const newNotification = await Notification.create({
      userId,
      title,
      body,
      type
    });

    // Send real-time notification to the user's socket room if online
    socketConfig.emitToUser(userId, 'notification', newNotification);
    
    // Trigger Web Push Notification if subscribed
    await pushService.sendPushNotification(userId, title, body);

    return newNotification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
}

// Initialize wellness scheduler cron jobs
function initCronJobs() {
  // 1. Daily 8:00 AM - Birthdays, Goal Deadlines, Inactivity reminders
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running 8:00 AM wellness alerts...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Important Date Checks
      const birthdaysToday = await ImportantDate.find({
        date: { $gte: today, $lt: tomorrow },
        reminderEnabled: true
      });
      for (const d of birthdaysToday) {
        await createNotification({
          userId: d.userId,
          title: `🗓️ Special Date Today: ${d.title}`,
          body: `Hey, don't forget to celebrate today's event: "${d.title}"!`,
          type: 'reminder'
        });
      }

      // Goals Deadline Checks
      const deadlinesToday = await Goal.find({
        targetDate: { $gte: today, $lt: tomorrow },
        isCompleted: false
      });
      for (const g of deadlinesToday) {
        await createNotification({
          userId: g.userId,
          title: `🎯 Goal Deadline Today: ${g.title}`,
          body: `Nanna, today is the deadline to complete your goal: "${g.title}". Let's finish it!`,
          type: 'reminder'
        });
      }

      // User Inactivity (3+ days offline)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const inactiveUsers = await User.find({
        lastLogin: { $lt: threeDaysAgo },
        isActive: true
      });
      for (const u of inactiveUsers) {
        await createNotification({
          userId: u._id,
          title: '🌸 Ela unnava?',
          body: 'Ninnu chala miss chesam ra! Emaindi? Message cheyyi once.',
          type: 'general'
        });
      }
    } catch (err) {
      console.error('[CRON 8:00 AM] Error:', err.message);
    }
  });

  // 2. Daily 1:00 PM - Lunch check for Family / Companion preferences (Anti-spam applied)
  cron.schedule('0 13 * * *', async () => {
    console.log('[CRON] Running 1:00 PM mealtime checks...');
    try {
      const targetPrefs = await UserPreference.find({
        relationshipType: { $in: ['family', 'companion'] }
      });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const pref of targetPrefs) {
        // Skip if already sent today
        const existing = await Notification.findOne({
          userId: pref.userId,
          title: '🍲 Lunch ayyinda?',
          createdAt: { $gte: today }
        });

        if (!existing) {
          await createNotification({
            userId: pref.userId,
            title: '🍲 Lunch ayyinda?',
            body: 'Lunch time ayyindi ra. Lunch ayyinda? Saraga tinnandi!',
            type: 'reminder'
          });
        }
      }
    } catch (err) {
      console.error('[CRON 1:00 PM] Error:', err.message);
    }
  });

  // 3. Daily 11:00 PM - Late active users sleep check
  cron.schedule('0 23 * * *', async () => {
    console.log('[CRON] Running 11:00 PM sleep check...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeUsersToday = await User.find({
        lastLogin: { $gte: today },
        isActive: true
      });

      for (const user of activeUsersToday) {
        await createNotification({
          userId: user._id,
          title: '😴 Rest teesuko ra!',
          body: 'Chaala late ayyindi. Rest teesuko! Phone pakkana petti nidrapo 😴',
          type: 'reminder'
        });
      }
    } catch (err) {
      console.error('[CRON 11:00 PM] Error:', err.message);
    }
  });

  // 4. Sunday 7:00 PM - Weekly reflection reminder
  cron.schedule('0 19 * * 0', async () => {
    console.log('[CRON] Running Sunday reflection alerts...');
    try {
      const activeUsers = await User.find({ isActive: true });

      // Generate ISO week (e.g. 2026-W24)
      const getISOWeek = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
      };

      const currentWeek = getISOWeek();

      for (const user of activeUsers) {
        const submitted = await WeeklyReflection.findOne({
          userId: user._id,
          week: currentWeek
        });

        if (!submitted) {
          await createNotification({
            userId: user._id,
            title: '📝 Weekly reflection time!',
            body: 'Weekly reflection time! Ee week ela ayyindi? Share your struggles and achievements with me 📝',
            type: 'reminder'
          });
        }
      }
    } catch (err) {
      console.error('[CRON Sunday 7:00 PM] Error:', err.message);
    }
  });
}

module.exports = {
  createNotification,
  initCronJobs
};
