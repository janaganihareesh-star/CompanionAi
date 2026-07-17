const axios = require('axios');

// Using the same key rotation mechanism loosely, or just grab the first one for simplicity.
function getApiKey() {
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  if (!keysStr) throw new Error("No Gemini API keys found");
  const keys = keysStr.split(',');
  // Use a random key to distribute load
  return keys[Math.floor(Math.random() * keys.length)];
}

exports.generateEmbedding = async (text) => {
  if (!text) return null;
  const apiKey = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  
  try {
    const response = await axios.post(url, {
      model: 'models/text-embedding-004',
      content: {
        parts: [{ text }]
      }
    });

    if (response.data && response.data.embedding && response.data.embedding.values) {
      return response.data.embedding.values;
    }
    return null;
  } catch (error) {
    console.error('[Embedding Service] Failed to generate embedding:', error.response?.data || error.message);
    return null;
  }
};

exports.chunkText = (text, maxWords = 200) => {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];
  
  for (const word of words) {
    currentChunk.push(word);
    if (currentChunk.length >= maxWords) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  return chunks;
};
