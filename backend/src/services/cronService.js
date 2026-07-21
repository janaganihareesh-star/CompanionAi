const Message = require('../models/Message');
const UserPreference = require('../models/UserPreference');
const aiService = require('./aiService');
const promptBuilder = require('./promptBuilder');
const { getIO } = require('../config/socket');
const nodemailer = require('nodemailer');
const { getAgenda } = require('../config/agenda');

async function startProactiveAgents() {
  const agenda = getAgenda();
  if (!agenda) {
    console.warn('[CronService] Agenda not available for proactive agents.');
    return;
  }

  agenda.define('runProactiveAgents', async (job) => {
    try {
      console.log('[CronService] Running proactive goal checks via Agenda...');
      
      const currentHour = new Date().getHours();
      if (currentHour < 7 || currentHour > 22) return;

      const users = await UserPreference.find({}).select('userId aiName relationshipType offlineMode');
      
      for (const userPref of users) {
        const { userId, aiName } = userPref;
        const Conversation = require('../models/Conversation');
        const recentConv = await Conversation.findOne({ userId }).sort({ updatedAt: -1 });
        if (!recentConv) continue;

        const lastMsg = await Message.findOne({ conversationId: recentConv._id }).sort({ timestamp: -1 });
        if (lastMsg && lastMsg.sender === 'ai') continue;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const alreadySentToday = await Message.findOne({
          conversationId: recentConv._id,
          sender: 'ai',
          sources: { $in: ['Proactive Agent'] },
          timestamp: { $gte: startOfDay }
        });
        if (alreadySentToday) continue;

        const promptData = await promptBuilder.buildPrompt({
          userId,
          currentMessage: '[SYSTEM_TRIGGER: PROACTIVE_CHECK_IN]',
          conversationId: recentConv._id
        });

        promptData.messages.push({
          role: 'user',
          parts: [{
            text: "Generate a proactive, caring message to check in on the user based on their active goals. If they have an exam, wish them luck. If they had a long day yesterday, ask how they are today. KEEP IT BRIEF (1-2 sentences). Return ONLY the message."
          }]
        });

        const aiResult = await aiService.generateAIResponse({
          ...promptData,
          energyLevel: 'high',
          domain: 'general conversation'
        });

        const proactiveMsg = aiResult.text;

        const savedMsg = await Message.create({
          conversationId: recentConv._id,
          userId,
          sender: 'ai',
          content: proactiveMsg,
          mood: 'happy',
          confidenceScore: 100,
          sources: ['Proactive Agent']
        });

        recentConv.lastMessage = proactiveMsg;
        recentConv.lastMessageAt = new Date();
        await recentConv.save();

        try {
          const io = getIO();
          io.to(`user_${userId}`).emit('new_message', {
            conversationId: recentConv._id,
            message: savedMsg
          });
          io.to(`user_${userId}`).emit('proactive_notification', {
            title: `Message from ${aiName || 'Closer'}`,
            body: proactiveMsg
          });
        } catch (socketErr) {}
      }
    } catch (err) {
      console.error('[CronService] Proactive agent error:', err.message);
    }
  });

  // Schedule to run every hour
  await agenda.every('1 hour', 'runProactiveAgents');
  console.log('[CronService] Proactive Agents scheduled in Agenda.');
}

async function startMorningReportCron() {
  const agenda = getAgenda();
  if (!agenda) {
    console.warn('[CronService] Agenda not available for morning report.');
    return;
  }
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'test@gmail.com',
      pass: process.env.EMAIL_PASS || 'pass'
    }
  });

  agenda.define('runMorningReport', async (job) => {
    console.log('[CronService] Starting Autonomous Morning Report generation via Agenda...');
    try {
      const preferences = await UserPreference.find({ morningReportEnabled: true }).populate('userId');
      
      for (const pref of preferences) {
        if (!pref.userId || !pref.userId.email) continue;

        console.log(`[CronService] Generating report for user: ${pref.userId.email}`);
        const prompt = `You are Companion AI, an autonomous intelligence agent. 
Create a concise morning intelligence brief for ${pref.userId.fullName}.
Include:
1. A highly motivating good morning message.
2. 3 key global tech/news headlines of today.
3. A quick motivational quote or stoic thought for the day.
Keep it under 300 words. Format beautifully in HTML.`;

        const result = await aiService.generateAIResponse({
          systemPrompt: "You are a professional morning briefing assistant.",
          messages: [{ role: 'user', parts: [{ text: prompt }] }],
          energyLevel: 'high'
        });

        const mailOptions = {
          from: process.env.EMAIL_USER || 'test@gmail.com',
          to: pref.userId.email,
          subject: '☀️ Your Companion AI Morning Intelligence Brief',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #0d9488;">Good Morning, ${pref.userId.fullName}!</h2>
              ${result.text}
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888; text-align: center;">
                Sent autonomously by Companion AI via Agenda
              </p>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`[CronService] Report sent to ${pref.userId.email}`);
        } catch (e) {
          console.error(`[CronService] Failed to send email to ${pref.userId.email}`, e.message);
        }
      }
    } catch (err) {
      console.error('[CronService] Morning Report Error:', err);
    }
  });

  // Schedule to run every day at 7:00 AM
  await agenda.every('0 7 * * *', 'runMorningReport', {}, { timezone: 'Asia/Kolkata' });
  console.log('[CronService] Morning Report scheduled in Agenda.');
}

module.exports = {
  startProactiveAgents,
  startMorningReportCron
};
