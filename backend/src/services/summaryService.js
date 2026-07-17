const axios = require('axios');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * Phase 3: Token Limit Management (Auto-Compression)
 * If a conversation exceeds N messages, we compress the oldest chunk into a single "Summary Message"
 * to save token context window while retaining semantic memory.
 */
async function compressConversation(conversationId, threshold = 30) {
  try {
    const msgCount = await Message.countDocuments({ conversationId });
    if (msgCount <= threshold) return; // No need to compress yet

    console.log(`[Token Compressor] Conversation ${conversationId} exceeded ${threshold} messages. Starting compression...`);
    
    // Fetch the oldest messages (leave the 10 most recent ones untouched)
    const messagesToCompress = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .limit(msgCount - 10);

    if (messagesToCompress.length < 5) return; // Too few to bother compressing

    // Combine them into a text blob
    let conversationBlob = messagesToCompress.map(m => `${m.sender.toUpperCase()}: ${m.content}`).join('\n');
    
    const keys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
      .split(',').map(k => k.trim()).filter(Boolean);
    const apiKey = keys[0];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `Compress the following conversation history into a highly dense, factual summary. 
Retain all important entities, decisions, user preferences, and context. Omit conversational fluff (greetings, confirmations). 
Format it as a concise paragraph.
\n\nHistory to compress:\n${conversationBlob}`;

    const response = await axios.post(url, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 }
    });

    const summaryText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (summaryText) {
      // 1. Delete old messages
      const idsToDelete = messagesToCompress.map(m => m._id);
      await Message.deleteMany({ _id: { $in: idsToDelete } });

      // 2. Insert summary message at the top
      await Message.create({
        conversationId,
        sender: 'system',
        content: `[HISTORICAL SUMMARY]: ${summaryText}`,
        timestamp: new Date(messagesToCompress[messagesToCompress.length - 1].timestamp.getTime() + 1000)
      });
      
      console.log(`[Token Compressor] Successfully compressed ${messagesToCompress.length} messages into 1 summary block.`);
    }
  } catch (err) {
    console.error('[Token Compressor] Failed to compress conversation:', err.message);
  }
}

module.exports = {
  compressConversation
};
