const axios = require('axios');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const MemoryVault = require('../models/MemoryVault');
const GraphNode = require('../models/GraphNode');
const GraphEdge = require('../models/GraphEdge');

// Fallback Local Vector Store for Documents (Memory)
const VECTOR_STORE_PATH = path.join(__dirname, '../../data/vector_store.json');
let memoryVectorStore = new Map(); // Map<conversationId, Array<{text, embedding}>>

// Load persistent vectors on boot
try {
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    const raw = fs.readFileSync(VECTOR_STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryVectorStore = new Map(Object.entries(parsed));
    console.log(`[RAG] Loaded ${memoryVectorStore.size} vector conversations from disk.`);
  } else {
    // Ensure data dir exists
    if (!fs.existsSync(path.dirname(VECTOR_STORE_PATH))) {
      fs.mkdirSync(path.dirname(VECTOR_STORE_PATH), { recursive: true });
    }
  }
} catch (err) {
  console.error('[RAG] Failed to load local vector store from disk:', err);
}

const CHROMA_DB_URL = process.env.CHROMA_DB_URL || 'http://localhost:8000';
let chromaCollection = null;

// Initialize ChromaDB Scalable Vector Database
async function initChromaDB() {
  if (process.env.USE_CHROMADB === 'true') {
    try {
      // Create or get collection in Chroma
      const res = await axios.post(`${CHROMA_DB_URL}/api/v1/collections`, {
        name: "closer_ai_vectors",
        get_or_create: true
      });
      chromaCollection = res.data.id;
      console.log(`[RAG] Connected to Scalable Vector DB (ChromaDB) successfully.`);
    } catch (err) {
      console.error('[RAG] ChromaDB connection failed. Ensure Chroma is running via Docker:', err.message);
    }
  }
}
initChromaDB();

function saveVectorStore() {
  if (process.env.USE_CHROMADB === 'true' && chromaCollection) {
    // If using ChromaDB, vectors are persisted automatically by the DB instance.
    return;
  }
  try {
    const obj = Object.fromEntries(memoryVectorStore);
    fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify(obj), 'utf-8');
  } catch (err) {
    console.error('[RAG] Failed to save local vector store to disk:', err);
  }
}

/**
 * Generates vector embeddings for a given text using Gemini's embedding model.
 *
 * NOTE (fix): 'text-embedding-004' was retired by Google and now returns
 * 404 NOT_FOUND on v1beta. The current model is 'gemini-embedding-001'.
 * It defaults to 3072 dimensions, so we pass outputDimensionality: 768
 * to keep the vector size compatible with the existing MongoDB Atlas
 * Vector Search index (which was built for 768-dim vectors).
 */
async function generateEmbedding(text) {
  const keys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
    .split(',').map(k => k.trim()).filter(Boolean);
  
  if (keys.length === 0 || keys[0] === 'AIzaSyDummyKeyForGeminiAPI') {
    return new Array(768).fill(0.1); // Mock embedding for testing without real key
  }
  
  // Pick a random key from the pool to avoid rate limits
  const apiKey = keys[Math.floor(Math.random() * keys.length)];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      model: 'models/gemini-embedding-001',
      content: {
        parts: [{ text }]
      },
      outputDimensionality: 768
    });

    let values = response.data?.embedding?.values || [];

    // gemini-embedding-001 only auto-normalizes the default 3072-dim output.
    // Truncated outputs (e.g. 768) must be manually re-normalized to unit
    // length, otherwise cosine-similarity / Atlas Vector Search scores
    // will be skewed. See: https://ai.google.dev/gemini-api/docs/embeddings
    if (values.length > 0) {
      const norm = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0));
      if (norm > 0) {
        values = values.map((v) => v / norm);
      }
    }

    return values;
  } catch (err) {
    console.error('Failed to generate embedding:', err.response?.data || err.message);
    return [];
  }
}

/**
 * Searches the MemoryVault using MongoDB Atlas Vector Search.
 * Note: Requires an Atlas Vector Search index named 'vector_index' on the 'embedding' field.
 */
async function searchSimilarMemories(userId, queryText, limit = 5) {
  // Bypass RAG for extremely short/casual messages to save API limits (Gemini 15 RPM)
  const wordCount = queryText.trim().split(/\s+/).length;
  if (wordCount < 4) {
    return [];
  }

  const queryEmbedding = await generateEmbedding(queryText);
  if (!queryEmbedding || queryEmbedding.length === 0) return [];
  
  let results = [];

  try {
    // 1. Try Pinecone Vector DB
    if (process.env.PINECONE_API_KEY) {
      console.log('[Vector DB] Searching Pinecone...');
      const { Pinecone } = require('@pinecone-database/pinecone');
      const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
      const index = pc.index(process.env.PINECONE_INDEX || 'closer-memories');
      
      const queryResponse = await index.namespace(userId).query({
        vector: queryEmbedding,
        topK: 25,
        includeMetadata: true
      });
      
      results = queryResponse.matches.map(match => ({
        memory: match.metadata.memory,
        category: match.metadata.category,
        score: match.score
      }));
    } else {
      // 2. Try MongoDB Atlas Vector Search
      console.log('[Vector DB] Searching MongoDB Atlas...');
      const pipeline = [
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit: 25,
            filter: { userId: userId }
          }
        },
        {
          $project: {
            embedding: 0,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ];
      results = await MemoryVault.aggregate(pipeline);
    }
  } catch (err) {
    console.warn('[Vector DB] Atlas/Pinecone failed, falling back to Local JS Cosine Similarity:', err.message);
    
    // 3. Fallback: Local In-Memory Cosine Similarity
    const allMemories = await MemoryVault.find({ userId }).select('-__v');
    const dotProduct = (a, b) => a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitude = (v) => Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    const cosineSimilarity = (a, b) => dotProduct(a, b) / (magnitude(a) * magnitude(b));
    
    results = allMemories
      .filter(m => m.embedding && m.embedding.length > 0)
      .map(m => {
        return {
          ...m.toObject(),
          score: cosineSimilarity(queryEmbedding, m.embedding)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);
  }

    // COHERE RE-RANKING INTEGRATION (Phase 3.2)
    const cohereKey = process.env.COHERE_API_KEY;
    if (cohereKey && results.length > 0) {
      try {
        console.log(`[Cognitive Memory] Re-ranking ${results.length} memories using Cohere...`);
        const documents = results.map(r => r.memory);
        const rerankRes = await axios.post('https://api.cohere.ai/v1/rerank', {
          model: 'rerank-english-v3.0',
          query: queryText,
          documents: documents,
          top_n: limit
        }, {
          headers: {
            'Authorization': `Bearer ${cohereKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (rerankRes.data && rerankRes.data.results) {
          // Map the re-ranked indices back to our original results
          const rerankedResults = rerankRes.data.results.map(r => results[r.index]);
          return rerankedResults;
        }
      } catch (rerankErr) {
        console.error('[Cognitive Memory] Cohere Re-rank failed, returning original vector results:', rerankErr.message);
      }
    }
    
    // Task 2.1: Context Fragmentation (Full File Injection)
    const workspaceScanner = require('./workspaceScanner');
    let finalResults = results.slice(0, limit);
    
    for (let result of finalResults) {
      if (result.score && result.score > 0.75) {
        // Look for common file path indicators in the memory chunk
        const pathMatch = result.memory.match(/(?:File|Path):\s*([a-zA-Z0-9_\-\.\/\\]+\.[a-zA-Z0-9]+)/i);
        if (pathMatch) {
          const filePath = pathMatch[1].trim();
          console.log(`[RAG Auto-Inject] High confidence match for file ${filePath}, injecting full context...`);
          const fileData = await workspaceScanner.readWorkspaceFile(filePath, undefined, queryText);
          if (fileData.success) {
            result.memory += `\n\n[Full File Context Auto-Injected by RAG for ${filePath}]\n\`\`\`\n${fileData.content}\n\`\`\``;
          }
        }
      }
    }
    
    return finalResults;

}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE GRAPH TRAVERSAL (Phase 8.1)
// ─────────────────────────────────────────────────────────────────────────────
async function searchKnowledgeGraph(userId, queryText) {
  try {
    // 1. Extract potential entity names from the query (simple keyword matching)
    const words = queryText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 3);
    if (words.length === 0) return [];
    // 2. Find matching nodes
    const nodes = await GraphNode.find({
      userId,
      name: { $in: words }
    });
    if (nodes.length === 0) return [];
    const nodeIds = nodes.map(n => n._id);
    // 3. Traverse edges (Find relationships where these nodes are source or target)
    const edges = await GraphEdge.find({
      userId,
      $or: [{ sourceNodeId: { $in: nodeIds } }, { targetNodeId: { $in: nodeIds } }]
    }).populate('sourceNodeId targetNodeId');
    // 4. Format into readable facts
    const graphFacts = edges.map(edge => {
      const src = edge.sourceNodeId?.name;
      const tgt = edge.targetNodeId?.name;
      const rel = edge.relation;
      if (src && tgt) {
        return `Graph Fact: ${src} ${rel} ${tgt}`;
      }
      return null;
    }).filter(Boolean);
    return [...new Set(graphFacts)]; // Return unique facts
  } catch (err) {
    console.error('[Knowledge Graph Search Error]:', err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INFINITE MEMORY ENGINE (Math Cosine Similarity)
// ─────────────────────────────────────────────────────────────────────────────
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function searchGlobalMessageHistory(userId, queryText, currentConversationId, limit = 3) {
  // Bypass RAG for very short queries to save embedding API limits
  const wordCount = queryText.trim().split(/\s+/).length;
  if (wordCount < 3) return [];

  const queryEmbedding = await generateEmbedding(queryText);
  if (!queryEmbedding || queryEmbedding.length === 0) return [];
  
  try {
    const Message = require('../models/Message');
    
    // Atlas Vector Search Pipeline for messages collection
    // Note: This requires an Atlas Vector Search index named 'vector_index' on the 'embedding' field in the 'messages' collection.
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: limit * 2, // fetch extra for filtering
          filter: { 
            userId: userId, 
            conversationId: { $ne: currentConversationId },
            isDeleted: { $ne: true }
          }
        }
      },
      {
        $project: {
          content: 1,
          timestamp: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ];

    const scoredMessages = await Message.aggregate(pipeline);
    
    let finalMessages = scoredMessages.filter(m => m.score > 0.75).slice(0, limit);
    
    // Cohere Re-ranking
    const cohereKey = process.env.COHERE_API_KEY;
    if (cohereKey && finalMessages.length > 0) {
      try {
        const documents = finalMessages.map(m => m.content);
        const rerankRes = await axios.post('https://api.cohere.ai/v1/rerank', {
          model: 'rerank-english-v3.0',
          query: queryText,
          documents: documents,
          top_n: limit
        }, {
          headers: {
            'Authorization': `Bearer ${cohereKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (rerankRes.data && rerankRes.data.results) {
          finalMessages = rerankRes.data.results.map(r => finalMessages[r.index]);
        }
      } catch (rerankErr) {
        console.error('[Infinite Memory] Cohere Re-rank failed, returning original vector results:', rerankErr.message);
      }
    }
    
    return finalMessages;
  } catch (err) {
    console.error('[Infinite Memory RAG Error]:', err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT RAG ENGINE (Phase 4 Setup)
// ─────────────────────────────────────────────────────────────────────────────
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

async function processDocument(conversationId, fileBuffer) {
  try {
    const data = await pdfParse(fileBuffer);
    const rawText = data.text;
    const chunks = chunkText(rawText);
    
    const vectors = [];
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      if (embedding && embedding.length > 0) {
        vectors.push({ text: chunk, embedding });
      }
    }
    
    if (process.env.USE_CHROMADB === 'true' && chromaCollection) {
      try {
        const ids = vectors.map((_, i) => `${conversationId}_chunk_${i}_${Date.now()}`);
        const embeddings = vectors.map(v => v.embedding);
        const documents = vectors.map(v => v.text);
        const metadatas = vectors.map(v => ({ conversationId }));
        
        await axios.post(`${CHROMA_DB_URL}/api/v1/collections/${chromaCollection}/add`, {
          ids,
          embeddings,
          documents,
          metadatas
        });
        console.log(`[RAG] Stored ${vectors.length} chunks in ChromaDB.`);
      } catch (err) {
        console.error('[RAG] ChromaDB insert failed:', err.message);
      }
    } else {
      const existing = memoryVectorStore.get(conversationId) || [];
      memoryVectorStore.set(conversationId, [...existing, ...vectors]);
      saveVectorStore(); // Persist to disk
    }
    
    return { success: true, chunksProcessed: vectors.length };
  } catch (error) {
    console.error('Error processing document for RAG:', error);
    return { success: false, error: error.message };
  }
}

async function queryDocument(conversationId, queryText, topK = 3) {
  const queryEmbedding = await generateEmbedding(queryText);
  if (!queryEmbedding || queryEmbedding.length === 0) return '';
  
  if (process.env.USE_CHROMADB === 'true' && chromaCollection) {
    try {
      const res = await axios.post(`${CHROMA_DB_URL}/api/v1/collections/${chromaCollection}/query`, {
        query_embeddings: [queryEmbedding],
        n_results: topK,
        where: { conversationId }
      });
      if (res.data && res.data.documents && res.data.documents[0]) {
        return res.data.documents[0].join('\n\n');
      }
    } catch (err) {
      console.error('[RAG] ChromaDB query failed, falling back to local Memory store.', err.message);
    }
  }

  const vectors = memoryVectorStore.get(conversationId);
  if (!vectors || vectors.length === 0) return null;
  
  const scoredChunks = vectors.map(vec => ({
    text: vec.text,
    score: cosineSimilarity(queryEmbedding, vec.embedding)
  }));
  
  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.slice(0, topK).map(c => c.text);
  
  return topChunks.join('\n\n---\n\n');
}

// Graph Memory Pruning (RAG Scaling)
// Runs every Sunday at midnight to prevent DB bloat and reduce hallucinations
const cron = require('node-cron');
cron.schedule('0 0 * * 0', async () => {
  console.log('[RAG Scalability] Starting Memory Pruning job...');
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // 1. Prune old short-term MemoryVault items (keep high importance)
    const deletedVault = await MemoryVault.deleteMany({
      timestamp: { $lt: oneMonthAgo },
      importance: { $lt: 0.7 } // Keep important memories
    });
    
    // 2. Prune old graph edges that are weak
    const deletedEdges = await GraphEdge.deleteMany({
      weight: { $lt: 0.3 }
    });
    
    console.log(`[RAG Scalability] Pruned ${deletedVault.deletedCount} old low-importance memories and ${deletedEdges.deletedCount} weak graph edges.`);
  } catch (err) {
    console.error('[RAG Scalability] Memory Pruning failed:', err);
  }
});

module.exports = {
  generateEmbedding,
  searchSimilarMemories,
  searchKnowledgeGraph,
  searchGlobalMessageHistory,
  processDocument,
  queryDocument
};
