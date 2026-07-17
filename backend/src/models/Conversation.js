const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  title: {
    type: String,
    default: 'New Chat'
  },
  type: {
    type: String,
    enum: ['chat', 'voice'],
    default: 'chat'
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  },
  crisisCount: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  folder: {
    type: String,
    default: 'General'
  },
  tags: {
    type: [String],
    default: []
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  rollingSummary: {
    type: String,
    default: ''
  },
  summaryLastMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Compound index on userId and lastMessageAt for fast paginated listing
ConversationSchema.index({ userId: 1, lastMessageAt: -1 });

// Index for filtering by type and archive status
ConversationSchema.index({ userId: 1, type: 1, isArchived: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);