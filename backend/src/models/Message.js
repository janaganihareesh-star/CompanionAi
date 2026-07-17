const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    default: 'neutral'
  },
  imageBase64: {
    type: String
  },
  attachments: [{
    name: String,
    data: String,
    type: { type: String, default: 'document' }
  }],
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  sources: {
    type: [String],
    default: []
  },
  feedbackText: {
    type: String
  },
  rating: {
    type: Number, // 1 for Like, -1 for Dislike, 0 for None
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  embedding: {
    type: [Number], // Used for Cosine Similarity RAG Memory
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient loading of messages within a conversation chronologically
MessageSchema.index({ conversationId: 1, timestamp: 1 });

// Text index for fast search queries
MessageSchema.index({ content: 'text' });

// Filtering index for retrieving user's active messages
MessageSchema.index({ userId: 1, isDeleted: 1, timestamp: -1 });

module.exports = mongoose.model('Message', MessageSchema);