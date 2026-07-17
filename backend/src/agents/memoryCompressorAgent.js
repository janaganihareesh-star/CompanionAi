const Chat = require('../models/Chat');
const aiService = require('../services/aiService');

class MemoryCompressorAgent {
  constructor() {
    this.compressionThreshold = 500; // Compress when memory items exceed this
  }

  async compressUserMemory(userId) {
    try {
      console.log(`[MemoryCompressor] Starting memory compression for User: ${userId}`);
      
      const chat = await Chat.findOne({ userId });
      if (!chat || !chat.memories || chat.memories.length < this.compressionThreshold) {
        console.log(`[MemoryCompressor] No compression needed for User: ${userId}`);
        return;
      }

      const rawMemories = chat.memories.slice(0, chat.memories.length - 50); // Keep last 50 raw
      const memoriesToCompress = rawMemories.map(m => m.content).join('\n');

      const systemPrompt = "You are a memory compression agent. Analyze the following raw conversational memories between a user and an AI. Extract the core facts, emotional states, user preferences, and pivotal relationship moments into a highly dense, bulleted summary. Discard irrelevant small talk.";
      
      const compressedSummary = await aiService.generateChat(memoriesToCompress, systemPrompt);

      // Create a compressed memory object
      const newCompressedMemory = {
        type: 'core_belief_summary',
        content: compressedSummary,
        timestamp: new Date()
      };

      // Keep only the new compressed memory and the last 50 raw memories
      chat.memories = [newCompressedMemory, ...chat.memories.slice(chat.memories.length - 50)];
      
      await chat.save();
      console.log(`[MemoryCompressor] Successfully compressed memory for User: ${userId}`);
    } catch (err) {
      console.error(`[MemoryCompressor] Failed to compress memory for User: ${userId}`, err);
    }
  }

  // Ideally this would be triggered by a Cron job at 3 AM
  async runNightlyCompressionJob() {
    console.log('[MemoryCompressor] Running nightly batch memory compression...');
    // Logic to iterate over all active users and run compressUserMemory()
  }
}

module.exports = new MemoryCompressorAgent();
