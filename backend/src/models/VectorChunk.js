const mongoose = require('mongoose');

const vectorChunkSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
  text: { type: String, required: true },
  embedding: { type: [Number] }, // For MongoDB Atlas Vector Search
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VectorChunk', vectorChunkSchema);
