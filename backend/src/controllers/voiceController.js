const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');
const Conversation = require('../models/Conversation');
const VoiceMessage = require('../models/VoiceMessage');
const RelationshipStats = require('../models/RelationshipStats');
const promptBuilder = require('../services/promptBuilder');
const aiService = require('../services/aiService');
const voiceService = require('../services/voiceService');
const emotionService = require('../services/emotionService');
const safetyService = require('../services/safetyService');
const memoryService = require('../services/memoryService');

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('audio');

// Middleware wrapper for multer upload
exports.audioUploadMiddleware = upload;

// POST /api/voice/upload
exports.uploadVoice = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Audio file is required.' });
    }

    // 1. Upload to Cloudinary audio folder
    // Audio is uploaded under the video category in Cloudinary
    const base64Audio = req.file.buffer.toString('base64');
    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'closer_voice_uploads',
          format: 'webm'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const audioUrl = uploadRes.secure_url;

    // 2. Transcribe via Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    let transcript = 'Transcribe sample audio.';

    if (apiKey && apiKey !== 'AIzaSyDummyKeyForGeminiAPI') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: [
          {
            parts: [
              { text: 'Transcribe this audio exactly. Return only the transcript text. Do not add comments.' },
              {
                inlineData: {
                  mimeType: req.file.mimetype || 'audio/webm',
                  data: base64Audio
                }
              }
            ]
          }
        ]
      };

      try {
        const geminiRes = await axios.post(url, requestBody);
        transcript = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        transcript = transcript.trim();
      } catch (geminiErr) {
        console.error('Gemini transcription failed, falling back:', geminiErr.message);
        transcript = 'Hello companion.';
      }
    } else {
      console.log('[DEV MODE] Gemini API key missing, returning mock transcription.');
      transcript = 'Ela unnav nanna, dinner ayyinda?';
    }

    res.status(200).json({ success: true, audioUrl, transcript });
  } catch (err) {
    next(err);
  }
};

// POST /api/voice/send
exports.sendVoice = async (req, res, next) => {
  try {
    const { transcript, audioUrl, duration } = req.body;
    let { conversationId } = req.body;
    const userId = req.user.id;

    if (!transcript || !audioUrl) {
      return res.status(400).json({ success: false, message: 'Transcript and audioUrl are required.' });
    }

    const voiceDuration = parseFloat(duration) || 0;

    // 1. Create or use voice conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        title: transcript.substring(0, 30) + (transcript.length > 30 ? '...' : ''),
        type: 'voice'
      });
      conversationId = conversation._id;
    }

    // 2. Save user VoiceMessage
    const userVoiceMsg = await VoiceMessage.create({
      conversationId,
      userId,
      sender: 'user',
      audioUrl,
      transcript,
      duration: voiceDuration,
      mood: 'neutral'
    });

    // 3. Safety check + emotion detection
    const safetyOverride = await safetyService.checkSafetyTriggers(transcript);
    let aiResponseText = '';
    let finalMood = 'neutral';

    if (safetyOverride) {
      aiResponseText = safetyOverride.reply;
    } else {
      const emotionResult = await emotionService.detectEmotion({ userId, text: transcript });
      finalMood = emotionResult.mood;

      // Update user message mood
      userVoiceMsg.mood = finalMood;
      await userVoiceMsg.save();

      // 4. Build prompt
      const promptData = await promptBuilder.buildPrompt({
        userId,
        currentMessage: transcript,
        conversationId
      });

      promptData.messages.push({
        role: 'user',
        parts: [{ text: transcript }]
      });

      // 5. Generate AI text response
      const aiResult = await aiService.generateAIResponse(promptData);
      aiResponseText = aiResult.text;

      // 6. Extract memories from transcript in background
      memoryService.extractAndSaveMemories({ userId, userMessage: transcript });
    }

    // 7. Convert text response to speech
    const customVoiceId = promptData?.elevenLabsVoiceId || 'EXAVITQu4vr4xnSDxMaL';
    const ttsUrl = await voiceService.textToSpeech(aiResponseText, promptData?.language || 'English', customVoiceId);

    // 8. Skip Cloudinary upload to reduce latency, use Data URI directly
    let aiAudioUrl = ttsUrl;


    // 9. Save AI VoiceMessage
    const aiVoiceMsg = await VoiceMessage.create({
      conversationId,
      userId,
      sender: 'ai',
      audioUrl: aiAudioUrl,
      transcript: aiResponseText,
      duration: Math.round(aiResponseText.length * 0.1), // rough estimate of speech duration
      mood: finalMood
    });

    // 10. Update Conversation details
    conversation.lastMessage = aiResponseText;
    conversation.lastMessageAt = new Date();
    conversation.messageCount += 2;
    await conversation.save();

    // 11. Update RelationshipStats
    const stats = await RelationshipStats.findOne({ userId });
    if (stats) {
      stats.totalVoiceChats += 1;
      stats.totalVoiceMinutes += Math.round((voiceDuration + aiVoiceMsg.duration) / 60);
      stats.updateBondLevel();
      stats.lastInteractionDate = new Date();
      await stats.save();

      await milestoneService.checkAndTrigger(userId);
    }

    res.status(200).json({
      success: true,
      conversationId,
      userAudio: userVoiceMsg,
      aiAudio: aiVoiceMsg,
      mood: finalMood
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/voice/history
exports.getVoiceHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const conversations = await Conversation.find({ 
      userId, 
      type: 'voice', 
      isDeleted: { $ne: true } 
    })
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/voice/:id
exports.deleteVoiceConversation = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId, type: 'voice' },
      { isArchived: true },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Voice conversation not found.' });
    }

    res.status(200).json({ success: true, message: 'Voice conversation archived successfully.' });
  } catch (err) {
    next(err);
  }
};