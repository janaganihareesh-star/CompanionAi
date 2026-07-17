const mongoose = require('mongoose');

const pluginSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pluginName: { type: String, required: true }, // e.g., 'Google Calendar', 'Weather', 'Slack'
  isEnabled: { type: Boolean, default: false },
  config: { type: mongoose.Schema.Types.Mixed }, // API keys, tokens, etc.
  installedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plugin', pluginSchema);
