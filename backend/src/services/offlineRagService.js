const fs = require('fs');
const path = require('path');

// This is a stub for a fully offline Local Vector RAG database.
// In a production environment, this would use 'faiss-node' or 'chromadb' running locally
// without any cloud API requests (unlike Pinecone).

class OfflineRagService {
  constructor() {
    this.storagePath = path.join(__dirname, '../../data/offline_vectors.json');
    this.index = [];
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(path.dirname(this.storagePath))) {
        fs.mkdirSync(path.dirname(this.storagePath), { recursive: true });
      }
      if (fs.existsSync(this.storagePath)) {
        this.index = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
        console.log(`[Offline RAG] Loaded ${this.index.length} vectors from local storage.`);
      } else {
        console.log('[Offline RAG] No local vector DB found. Initializing empty offline index.');
      }
    } catch (e) {
      console.error('[Offline RAG] Failed to initialize:', e);
    }
  }

  async addDocument(text, metadata = {}) {
    // Simulated Local Embedding Generation (e.g., using Ollama / HuggingFace local models)
    const mockVector = new Array(384).fill(0).map(() => Math.random());
    
    this.index.push({
      id: Date.now().toString(),
      text,
      metadata,
      vector: mockVector
    });

    this.save();
    return true;
  }

  async search(queryText, topK = 3) {
    // Simulated cosine similarity search on local vectors
    console.log(`[Offline RAG] Searching local DB for: "${queryText}"`);
    
    if (this.index.length === 0) return [];
    
    // Return top 3 mock matches
    return this.index.slice(0, topK).map(doc => ({
      text: doc.text,
      metadata: doc.metadata,
      score: Math.random() // Mock similarity score
    }));
  }

  save() {
    try {
      fs.writeFileSync(this.storagePath, JSON.stringify(this.index));
    } catch (e) {
      console.error('[Offline RAG] Failed to save DB:', e);
    }
  }
}

module.exports = new OfflineRagService();
