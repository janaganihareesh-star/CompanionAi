const mongoose = require('mongoose');

const customAgentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  systemPromptOverride: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🤖'
  },
  traits: {
    type: [String],
    default: []
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CustomAgent', customAgentSchema);
