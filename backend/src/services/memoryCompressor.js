const aiService = require('./aiService');
const Message = require('../models/Message');

/**
 * Compresses chat history into a dense summary to save token costs.
 * It reads the conversation, generates a summary, and flags old messages as 'compressed'.
 */
exports.compressMemory = async (conversationId) => {
  try {
    // 1. Fetch uncompressed messages older than the last 4 (we always keep the very recent ones intact)
    const messagesToCompress = await Message.find({ 
      conversationId,
      isCompressed: { $ne: true }
    }).sort({ timestamp: 1 });

    // If there aren't enough messages to compress, skip it
    if (messagesToCompress.length < 10) {
      return false;
    }

    // Leave the last 4 messages alone so immediate context is perfect
    const messagesToSummarize = messagesToCompress.slice(0, -4);
    
    if (messagesToSummarize.length < 6) return false;

    // 2. Build transcript
    const transcript = messagesToSummarize.map(m => `${m.sender.toUpperCase()}: ${m.content}`).join('\n');

    // 3. Ask AI to summarize densely while PRESERVING CODE
    const prompt = `You are an advanced Memory Compressor for an AI Developer. 
Compress the following conversation transcript into a dense, highly factual summary (2-3 sentences max).
CRITICAL RULE: You MUST preserve and extract any \`\`\`code blocks\`\`\` or file paths exactly as they are. Do not summarize code. Append the preserved code at the bottom of the summary.
Exclude pleasantries.

Transcript:
${transcript}`;
    
    let summary = '';
    await aiService.generateAIResponse({
      messages: [{ role: 'user', parts: [{ text: prompt }] }],
      systemPrompt: 'You are a highly efficient memory compression algorithm.',
      onChunk: (chunk) => { summary += chunk; }
    });

    // 4. Save the summary as a new 'system' memory message and mark old ones as compressed
    const summaryMessage = new Message({
      conversationId,
      sender: 'system',
      content: `[COMPRESSED MEMORY]: ${summary}`,
      timestamp: new Date()
    });
    await summaryMessage.save();

    // Mark as compressed so we don't query them in the main context window anymore
    await Message.updateMany(
      { _id: { $in: messagesToSummarize.map(m => m._id) } },
      { $set: { isCompressed: true } }
    );

    console.log(`[Memory Compressor] Compressed ${messagesToSummarize.length} messages into a dense summary for conversation ${conversationId}`);
    return true;

  } catch (error) {
    console.error('[Memory Compressor Error]:', error);
    return false;
  }
};
