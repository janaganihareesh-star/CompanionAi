const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

class MessageService {
  async createConversation(userId, title = 'New Chat') {
    return await Conversation.create({
      userId,
      title: title.substring(0, 30),
      type: 'chat'
    });
  }

  async getMessages(conversationId, userId, page = 1, limit = 30) {
    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) return []; // Return empty array instead of 404 for new uninitialized chats

    const messages = await Message.find({ conversationId, isDeleted: { $ne: true } })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    return messages.reverse();
  }

  async saveUserMessage(data) {
    return await Message.create({
      conversationId: data.conversationId,
      userId: data.userId,
      sender: 'user',
      content: data.message,
      mood: data.mood || 'neutral',
      embedding: data.embedding,
      imageBase64: data.imageBase64,
      attachments: data.attachments || []
    });
  }

  async saveAIMessage(data) {
    return await Message.create({
      conversationId: data.conversationId,
      userId: data.userId,
      sender: 'ai',
      content: data.content,
      mood: data.mood || 'neutral',
      confidenceScore: data.confidenceScore,
      sources: data.sources,
      embedding: data.embedding
    });
  }
}

module.exports = new MessageService();
