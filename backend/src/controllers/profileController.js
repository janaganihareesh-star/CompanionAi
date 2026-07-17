const UserPreference = require('../models/UserPreference');
const RelationshipStats = require('../models/RelationshipStats');
const Message = require('../models/Message');
const MoodLog = require('../models/MoodLog');
const emotionService = require('../services/emotionService');
const mongoose = require('mongoose');

// POST /api/profile/language
exports.setLanguage = async (req, res, next) => {
  try {
    const { language } = req.body;
    const userId = req.user.id;

    if (!language) {
      return res.status(400).json({ success: false, message: 'Language is required.' });
    }

    const pref = await UserPreference.findOneAndUpdate(
      { userId },
      { language },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, preference: pref });
  } catch (err) {
    next(err);
  }
};

// POST /api/profile/ai-gender
exports.setAiGender = async (req, res, next) => {
  try {
    const { aiGender } = req.body;
    const userId = req.user.id;

    if (!aiGender || !['female', 'male'].includes(aiGender)) {
      return res.status(400).json({ success: false, message: 'Invalid AI Gender selection.' });
    }

    const pref = await UserPreference.findOneAndUpdate(
      { userId },
      { aiGender },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, preference: pref });
  } catch (err) {
    next(err);
  }
};

// POST /api/profile/voice
exports.setVoice = async (req, res, next) => {
  try {
    const { selectedVoice } = req.body;
    const userId = req.user.id;

    if (!selectedVoice) {
      return res.status(400).json({ success: false, message: 'Voice selection is required.' });
    }

    const pref = await UserPreference.findOneAndUpdate(
      { userId },
      { selectedVoice },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, preference: pref });
  } catch (err) {
    next(err);
  }
};

// POST /api/profile/relationship
exports.setRelationship = async (req, res, next) => {
  try {
    const { relationshipType, relationshipBoundary } = req.body;
    const userId = req.user.id;

    if (!relationshipType || !relationshipBoundary) {
      return res.status(400).json({ success: false, message: 'Relationship type and boundary are required.' });
    }

    const pref = await UserPreference.findOneAndUpdate(
      { userId },
      { relationshipType, relationshipBoundary, onboardingComplete: true },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, preference: pref });
  } catch (err) {
    next(err);
  }
};

// POST /api/profile/ai-name
exports.setAiName = async (req, res, next) => {
  try {
    const { aiName } = req.body;
    const userId = req.user.id;

    if (!aiName) {
      return res.status(400).json({ success: false, message: 'AI Name is required.' });
    }

    const pref = await UserPreference.findOneAndUpdate(
      { userId },
      { aiName },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, preference: pref });
  } catch (err) {
    next(err);
  }
};

// GET /api/profile/preferences
exports.getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pref = await UserPreference.findOne({ userId });

    if (!pref) {
      const newPref = await UserPreference.create({ userId });
      return res.status(200).json({ success: true, preference: newPref });
    }

    res.status(200).json({ success: true, preference: pref });
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile/preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    delete updates.userId;

    const pref = await UserPreference.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, preference: pref });
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile/trusted-contacts
exports.updateTrustedContacts = async (req, res, next) => {
  try {
    const { trustedContact1, trustedContact2 } = req.body;
    const userId = req.user.id;

    const pref = await UserPreference.findOneAndUpdate(
      { userId },
      { trustedContact1, trustedContact2 },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, preference: pref });
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile/theme
exports.updateTheme = async (req, res, next) => {
  try {
    const { themeMode } = req.body;
    const userId = req.user.id;

    if (!themeMode || !['dark', 'light'].includes(themeMode)) {
      return res.status(400).json({ success: false, message: 'Invalid theme mode.' });
    }

    const pref = await UserPreference.findOneAndUpdate(
      { userId },
      { themeMode },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, preference: pref });
  } catch (err) {
    next(err);
  }
};

// GET /api/relationship/stats
exports.getRelationshipStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let stats = await RelationshipStats.findOne({ userId });

    if (!stats) {
      stats = await RelationshipStats.create({ userId, friendshipStartDate: new Date() });
    }

    // Refresh day count and levels
    stats.updateBondLevel();
    await stats.save();

    res.status(200).json({
      success: true,
      stats: {
        friendshipDays: stats.friendshipDays,
        totalMessages: stats.totalMessages,
        totalVoiceChats: stats.totalVoiceChats,
        totalVoiceMinutes: stats.totalVoiceMinutes,
        trustScore: stats.trustScore,
        bondLevel: stats.bondLevel,
        bondLevelName: stats.bondLevelName,
        streak: stats.streak
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/relationship/journey
exports.getRelationshipJourney = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let stats = await RelationshipStats.findOne({ userId });

    if (!stats) {
      stats = await RelationshipStats.create({ userId, friendshipStartDate: new Date() });
    }

    // Find date of first message
    const firstMsg = await Message.findOne({ userId }).sort({ timestamp: 1 });
    const firstMessageDate = firstMsg ? firstMsg.timestamp : stats.friendshipStartDate;

    // Fetch genuine daily activity (number of messages sent by user per day)
    const dailyActivityRaw = await Message.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), sender: 'user' } },
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const dailyActivity = {};
    dailyActivityRaw.forEach(day => {
      dailyActivity[day._id] = day.count;
    });

    res.status(200).json({
      success: true,
      stats,
      firstMessageDate,
      milestonesReached: stats.milestonesReached,
      bondLevelHistory: [
        { level: 1, name: 'New Friend', date: stats.friendshipStartDate }
      ],
      dailyActivity
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/mood/trend
exports.getMoodTrend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;
    const trendData = await emotionService.getMoodTrend({ userId, days });
    res.status(200).json({ success: true, ...trendData });
  } catch (err) {
    next(err);
  }
};

// GET /api/mood/analytics
exports.getMoodAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [currentLogs, lastLogs] = await Promise.all([
      MoodLog.find({ userId, timestamp: { $gte: currentMonthStart } }),
      MoodLog.find({ userId, timestamp: { $gte: lastMonthStart, $lt: currentMonthStart } })
    ]);

    const getDistribution = (logs) => {
      const dist = {};
      logs.forEach(l => {
        dist[l.mood] = (dist[l.mood] || 0) + 1;
      });
      return dist;
    };

    const currentMonthDist = getDistribution(currentLogs);
    const lastMonthDist = getDistribution(lastLogs);

    // Calculate common mood
    let mostCommonMood = 'neutral';
    let maxCount = 0;
    Object.entries(currentMonthDist).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonMood = mood;
      }
    });

    // Best day of week (day with highest ratio of happy/calm/excited logs)
    const dayCounts = Array(7).fill(0);
    const dayHappyCounts = Array(7).fill(0);

    currentLogs.forEach(log => {
      const day = new Date(log.timestamp).getDay();
      dayCounts[day]++;
      if (['happy', 'excited', 'calm'].includes(log.mood)) {
        dayHappyCounts[day]++;
      }
    });

    let bestDayIdx = 0;
    let maxRatio = 0;
    for (let i = 0; i < 7; i++) {
      const ratio = dayCounts[i] ? dayHappyCounts[i] / dayCounts[i] : 0;
      if (ratio > maxRatio) {
        maxRatio = ratio;
        bestDayIdx = i;
      }
    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDayOfWeek = daysOfWeek[bestDayIdx];

    // Determine emotional trend
    const currentHappyCount = (currentMonthDist.happy || 0) + (currentMonthDist.excited || 0) + (currentMonthDist.calm || 0);
    const currentSadCount = (currentMonthDist.sad || 0) + (currentMonthDist.lonely || 0) + (currentMonthDist.frustrated || 0);
    
    const lastHappyCount = (lastMonthDist.happy || 0) + (lastMonthDist.excited || 0) + (lastMonthDist.calm || 0);
    const lastSadCount = (lastMonthDist.sad || 0) + (lastMonthDist.lonely || 0) + (lastMonthDist.frustrated || 0);

    let trend = 'same';
    if (currentHappyCount > lastHappyCount && currentSadCount < lastSadCount) {
      trend = 'better';
    } else if (currentHappyCount < lastHappyCount && currentSadCount > lastSadCount) {
      trend = 'worse';
    }

    res.status(200).json({
      success: true,
      currentMonth: currentMonthDist,
      lastMonth: lastMonthDist,
      trend,
      mostCommonMood,
      bestDayOfWeek
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/mood/history
exports.getMoodHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const logs = await MoodLog.find({ userId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ success: true, history: logs });
  } catch (err) {
    next(err);
  }
};