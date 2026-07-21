const { Telegraf } = require('telegraf');
const Message = require('../models/Message');

const aiService = require('../services/aiService');

const setupTelegramBot = () => {
  console.log('[TelegramBot] setupTelegramBot called!');
  const token = process.env.TELEGRAM_BOT_TOKEN;

  const bot = new Telegraf(token);

  bot.start((ctx) => {
    ctx.reply('Welcome to CloserAI on Telegram! Send me a message and I will reply using the core brain.');
  });

  bot.on('text', async (ctx) => {
    try {
      const userText = ctx.message.text;
      const telegramChatId = `telegram-${ctx.chat.id}`;
      
      // Notify user that AI is thinking
      const thinkingMsg = await ctx.reply('🤖 Thinking...');

      // Save user message
      await Message.create({ sender: 'user', content: userText, conversationId: telegramChatId });
      
      // Process with AI
      const aiResponse = await aiService.processMessage(userText, telegramChatId);

      // Save AI response
      await Message.create({ sender: 'ai', content: aiResponse, conversationId: telegramChatId });

      // Edit thinking message with actual response
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        thinkingMsg.message_id,
        undefined,
        aiResponse
      );
      
    } catch (e) {
      console.error('[TelegramBot] Error handling message:', e);
      ctx.reply('Sorry, I encountered an error.');
    }
  });
  bot.catch((err, ctx) => {
    console.error(`[TelegramBot] Error for ${ctx?.updateType}:`, err.message);
  });

  console.log('[TelegramBot] Launching bot...');
  bot.launch({ dropPendingUpdates: true }).then(() => {
    console.log('🚀 [TelegramBot] CloserAI Bot is online and listening.');
  }).catch(e => {
    if (e.message.includes('409')) {
      console.warn('⚠️ [TelegramBot] Port/Webhook conflict detected. Another instance is likely running. Skipping Telegram bot for this dev cycle.');
    } else {
      console.error('🚀 [TelegramBot] Failed to launch:', e.message);
    }
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
  process.once('SIGUSR2', () => bot.stop('SIGUSR2'));
};

module.exports = { setupTelegramBot };
