let io;

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    const { createAdapter } = require('@socket.io/cluster-adapter');
    const { setupWorker } = require('@socket.io/sticky');

    io = new Server(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL,
          'http://localhost:5173',
          'https://companion-ai-khaki.vercel.app'
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
      }
    });

    // Phase 6: Enterprise Horizontal Scalability
    try {
      if (process.env.REDIS_URL) {
        const { createAdapter } = require('@socket.io/redis-adapter');
        const { createClient } = require('redis');
        const pubClient = createClient({ url: process.env.REDIS_URL });
        const subClient = pubClient.duplicate();
        
        Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
          io.adapter(createAdapter(pubClient, subClient));
          console.log('🔗 Redis Pub/Sub Adapter connected successfully for Socket.io Horizontal Scaling.');
        });
      } else {
        console.warn('⚠️ REDIS_URL not provided. Socket.io running in single-node mode.');
      }
    } catch (e) {
      console.warn("Socket Redis adapter could not be initialized:", e.message);
    }

    // Initialize Persistent Terminal Service
    try {
      const terminalService = require('../services/terminalService');
      terminalService.initTerminal(io);
    } catch (err) {
      console.warn("Terminal Service failed to start (Platform might not support pseudo-terminal):", err.message);
    }

    io.on('connection', (socket) => {
      // Authenticate socket using token if available in handshake query
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      let userId;

      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          userId = decoded.userId || decoded.id;
          if (userId) {
            socket.join(`user_${userId}`);
            console.log(`Authenticated user ${userId} joined room user_${userId}`);
          }
        } catch (err) {
          console.error('Socket authentication failed:', err.message);
        }
      }

      socket.on('join', (roomUserId) => {
        socket.join(`user_${roomUserId}`);
        console.log(`Socket ${socket.id} joined room user_${roomUserId}`);
      });

      socket.on('join-room', (conversationId) => {
        if (conversationId) {
          socket.join(`chat_${conversationId}`);
          console.log(`Socket ${socket.id} joined chat room chat_${conversationId}`);
        }
      });

      socket.on('leave-room', (conversationId) => {
        if (conversationId) {
          socket.leave(`chat_${conversationId}`);
          console.log(`Socket ${socket.id} left chat room chat_${conversationId}`);
        }
      });


      // Initialize Phase 5: True Native Audio Bidi WebSocket
      const liveAudioService = require('../services/liveAudioService');
      liveAudioService.initializeRealtimeAudio(socket);

      socket.on('typing', (data) => {
        // data contains: conversationId, recipientId, typing (boolean)
        if (data.recipientId) {
          io.to(`user_${data.recipientId}`).emit('typing', {
            conversationId: data.conversationId,
            typing: data.typing
          });
        }
      });

      // VOICE OS: Duplex WebSocket Streaming
      socket.on('voice_stream_chunk', async (data) => {
        const { text, audioBase64, userId, conversationId } = data;
        if (!text && !audioBase64) return;

        try {
          const aiService = require('../services/aiService');
          const promptBuilder = require('../services/promptBuilder');
          const emotionService = require('../services/emotionService');
          const Conversation = require('../models/Conversation');
          const Message = require('../models/Message');
          
          let activeConvId = conversationId;
          
          // Fast path compilation for Voice OS
          const [emotionResult, promptData] = await Promise.all([
            emotionService.detectEmotion({ userId, text: text || 'Voice Input' }),
            promptBuilder.buildPrompt({ userId, currentMessage: text || 'Voice Input', conversationId: activeConvId })
          ]);

          const parts = [{ text: text || 'Native Audio Provided' }];
          if (audioBase64) {
            try {
              const matches = audioBase64.match(/^data:(audio\/[a-zA-Z0-9.-]+);base64,(.+)$/);
              if (matches && matches.length === 3) {
                parts.push({
                  inlineData: { mimeType: matches[1], data: matches[2] }
                });
              }
            } catch (e) {
              console.error("Failed to parse audioBase64", e);
            }
          }

          // Create or find Conversation
          let conversation;
          if (activeConvId) {
            conversation = await Conversation.findOne({ _id: activeConvId, participants: userId });
          }
          if (!conversation) {
            conversation = await Conversation.create({
              participants: [userId],
              title: text ? text.substring(0, 30) + '...' : 'Voice Conversation',
              isGroup: false,
              lastMessageAt: new Date()
            });
            activeConvId = conversation._id;
          }

          // Save User Message
          const userMessageText = text ? text.replace(/^\[AudioEmotion Detected:.*?\]\s*/, '') : 'Voice Input';
          await Message.create({
            conversationId: activeConvId,
            sender: 'user',
            senderId: userId,
            content: userMessageText,
            timestamp: new Date()
          });

          // Inject specific Voice OS system prompt rules BEFORE sending to AI
          const voiceRules = `\n\n[VOICE OS MODE ACTIVATED]
CRITICAL RULES FOR VOICE MODE:
1. Speak exactly in the language the user is speaking to you. If they ask a question in Telugu, reply in Telugu.
2. Match the user's emotion/mood in your response.
3. If the user asks you to write code, provide the code block using markdown as normal, BUT in your spoken conversational text, explicitly say: "I have provided the code in our chat history, please check it there." (Translate this phrase to their language). Do not attempt to read raw code syntax out loud.`;
          
          if (promptData.systemPrompt) {
            promptData.systemPrompt += voiceRules;
          } else {
            promptData.systemPrompt = voiceRules;
          }

          promptData.messages.push({ role: 'user', parts });

          const aiResult = await aiService.generateAIResponse({
            ...promptData,
            energyLevel: emotionResult.energyLevel || 'medium',
            domain: promptData.domain,
            domains: promptData.domains || []
          });

          // Save AI Message
          await Message.create({
            conversationId: activeConvId,
            sender: 'ai',
            content: aiResult.text,
            timestamp: new Date()
          });

          // Update Conversation
          conversation.lastMessageAt = new Date();
          await conversation.save();

          // Simulate Duplex Stream to Frontend TTS
          const words = aiResult.text.split(' ');
          let chunk = '';
          for (let i = 0; i < words.length; i++) {
            chunk += words[i] + ' ';
            // Emit every 5 words to trigger TTS immediately
            if (i % 5 === 0 || i === words.length - 1) {
              socket.emit('ai_voice_stream_response', { chunk: chunk.trim() });
              chunk = '';
              await new Promise(resolve => setTimeout(resolve, 50)); // Simulating chunked network delay
            }
          }
          
          socket.emit('ai_voice_stream_end', { fullText: aiResult.text });
        } catch (err) {
          console.error("Voice stream error:", err);
          socket.emit('ai_voice_stream_error', { error: 'Voice OS Failed' });
        }
      });

      // Closer V3: TRUE NATIVE AUDIO (Speech-to-Speech)
      socket.on('native_voice_stream', async (data) => {
        const { audioBase64, userId, conversationId } = data;
        if (!audioBase64) return;

        try {
          const aiService = require('../services/aiService');
          const Conversation = require('../models/Conversation');
          const Message = require('../models/Message');

          const matches = audioBase64.match(/^data:(audio\/[a-zA-Z0-9.-]+);base64,(.+)$/);
          if (!matches || matches.length !== 3) {
            console.error("Invalid audio format");
            return;
          }

          let activeConvId = conversationId;
          let conversation;
          if (activeConvId) {
            conversation = await Conversation.findOne({ _id: activeConvId, participants: userId });
          }
          if (!conversation) {
            conversation = await Conversation.create({
              participants: [userId],
              title: 'Native Voice Chat',
              type: 'chat',
              isGroup: false
            });
            activeConvId = conversation._id;
          }

          // We don't have text for the user's message since we bypassed STT!
          // We just save a placeholder to keep chat history intact.
          await Message.create({
            conversationId: activeConvId,
            sender: 'user',
            senderId: userId,
            content: "🎤 [Native Audio Sent]",
            timestamp: new Date()
          });

          const parts = [
            { text: "You are Companion AI operating in True Native Voice Mode. Listen to this audio carefully. Detect the user's emotion from their voice tone, and respond directly to what they said in a conversational manner. If they speak Telugu, reply in Telugu." },
            { inlineData: { mimeType: matches[1], data: matches[2] } }
          ];

          const aiResult = await aiService.generateAIResponse({
            systemPrompt: "You are an advanced voice assistant. Analyze the audio input directly.",
            messages: [{ role: 'user', parts }],
            energyLevel: 'high',
            domain: 'general'
          });

          await Message.create({
            conversationId: activeConvId,
            sender: 'ai',
            content: aiResult.text,
            timestamp: new Date()
          });

          conversation.lastMessageAt = new Date();
          await conversation.save();

          // Stream the text back to the frontend for msedge-tts synthesis
          const words = aiResult.text.split(' ');
          let chunk = '';
          for (let i = 0; i < words.length; i++) {
            chunk += words[i] + ' ';
            if (i % 5 === 0 || i === words.length - 1) {
              socket.emit('ai_voice_stream_response', { chunk: chunk.trim() });
              chunk = '';
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          socket.emit('ai_voice_stream_end', { fullText: aiResult.text });
        } catch (err) {
          console.error("Native Voice OS error:", err);
          socket.emit('ai_voice_stream_error', { error: 'Native Voice OS Failed' });
        }
      });

      // Closer V2: Continuous Live Video (Vision Latency)
      socket.on('live_vision_frame', async (data) => {
        const { imageBase64, prompt } = data;
        if (!imageBase64) return;

        try {
          const aiService = require('../services/aiService');
          const matches = imageBase64.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,(.+)$/);
          if (!matches || matches.length !== 3) return;

          const parts = [
            { text: prompt || "You are looking through my camera right now. Keep your observations very brief, like a continuous stream of consciousness. What do you see changing?" },
            { inlineData: { mimeType: matches[1], data: matches[2] } }
          ];

          // Call Gemini directly for a fast observation
          const aiResult = await aiService.generateAIResponse({
            systemPrompt: "You are Companion AI's real-time vision core. The user is streaming video frames to you. Provide extremely brief (1 sentence) updates on what is happening. Do not use markdown.",
            messages: [{ role: 'user', parts }],
            energyLevel: 'high',
            domain: 'live_news' // bypassing heavy RAG
          });

          // Stream the observation back to the frontend
          socket.emit('vision_stream_response', { text: aiResult.text });
        } catch (err) {
          console.error("Live Vision frame processing failed:", err.message);
        }
      });

      // Closer V2: Voice Conversation Interruption
      socket.on('interrupt_ai', () => {
        console.log(`[Socket] Client ${socket.id} interrupted AI generation.`);
        // In a more complex architecture, we would emit an abort signal to axios/gemini here.
        // For now, the frontend will halt TTS, and we acknowledge the interrupt.
        socket.emit('ai_interrupted_ack');
      });

      socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  emitToUser: (userId, event, data) => {
    if (io) {
      io.to(`user_${userId}`).emit(event, data);
    }
  },
  emitToRoom: (roomId, event, data) => {
    if (io) {
      io.to(`chat_${roomId}`).emit(event, data);
    }
  }
};