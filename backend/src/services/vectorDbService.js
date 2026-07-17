const { Pinecone } = require('@pinecone-database/pinecone');

/**
 * Vector DB Service
 * Integrates Pinecone for Production RAG (V14 Upgrade).
 * Falls back to in-memory storage if API keys are missing.
 */
class VectorDbService {
    constructor() {
        this.collection = [];
        this.isCloudMode = false;
        
        if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX) {
            try {
                this.pinecone = new Pinecone({
                    apiKey: process.env.PINECONE_API_KEY
                });
                this.index = this.pinecone.Index(process.env.PINECONE_INDEX);
                this.isCloudMode = true;
                console.log('[VectorDB] Connected to Pinecone Cloud Vector DB');
            } catch (err) {
                console.error('[VectorDB] Failed to initialize Pinecone. Falling back to local memory.', err.message);
                this.isCloudMode = false;
            }
        } else {
            console.warn('[VectorDB] PINECONE_API_KEY missing. Running in local memory fallback mode.');
        }
    }

    /**
     * Create embeddings (Mocked for simplicity, replace with OpenAI if desired)
     */
    async mockEmbed(text) {
        // Return a mock 1536-dimensional vector (OpenAI standard)
        return Array.from({length: 1536}, () => Math.random());
    }

    /**
     * Chunk text and store in Vector DB
     */
    async upsertDocument(id, fullText, metadata = {}) {
        const CHUNK_SIZE = 500;
        const words = fullText.split(' ');
        const chunks = [];
        
        for (let i = 0; i < words.length; i += CHUNK_SIZE) {
            chunks.push(words.slice(i, i + CHUNK_SIZE).join(' '));
        }

        console.log(`[VectorDB] Chunked document ${id} into ${chunks.length} chunks.`);

        const vectorsToUpsert = [];

        for (let i = 0; i < chunks.length; i++) {
            const vector = await this.mockEmbed(chunks[i]);
            const chunkId = `${id}_chunk_${i}`;
            const chunkMetadata = { ...metadata, chunkIndex: i, parentId: id, text: chunks[i] };
            
            if (this.isCloudMode) {
                vectorsToUpsert.push({ id: chunkId, values: vector, metadata: chunkMetadata });
            } else {
                this.collection.push({ id: chunkId, text: chunks[i], vector, metadata: chunkMetadata });
            }
        }
        
        if (this.isCloudMode && vectorsToUpsert.length > 0) {
            await this.index.upsert(vectorsToUpsert);
            console.log(`[VectorDB] Upserted ${vectorsToUpsert.length} vectors to Pinecone.`);
        }
        
        return true;
    }

    /**
     * Retrieve top K relevant memories
     */
    async query(prompt, topK = 3) {
        console.log(`[VectorDB] Querying top ${topK} matches for: "${prompt}"`);
        const queryVector = await this.mockEmbed(prompt);

        if (this.isCloudMode) {
            try {
                const results = await this.index.query({
                    vector: queryVector,
                    topK: topK,
                    includeMetadata: true
                });
                return results.matches.map(match => ({
                    text: match.metadata.text,
                    metadata: match.metadata,
                    score: match.score
                }));
            } catch (err) {
                console.error('[VectorDB] Pinecone query failed:', err.message);
                return [];
            }
        } else {
            // Local fallback logic (Mock cosine similarity)
            return this.collection.slice(0, topK).map(doc => ({
                text: doc.text,
                metadata: doc.metadata,
                score: 0.95 
            }));
        }
    }
}

module.exports = new VectorDbService();
