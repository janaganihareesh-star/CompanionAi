const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' }); // load main .env
const vectorDbService = require('../../src/services/vectorDbService');
const documentParser = require('../../src/services/documentParser');
const auth = require('../../src/middleware/auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'rag-service', time: new Date() });
});

// Document/RAG Routes
app.post('/api/document/upload', auth, async (req, res) => {
    try {
        const { fileContent, filename, type } = req.body;
        if (!fileContent) return res.status(400).json({ success: false, message: 'File content missing.' });
        
        let text = fileContent;
        if (type === 'application/pdf') {
            text = await documentParser.parsePdf(fileContent);
        } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            text = await documentParser.parseDocx(fileContent);
        }
        
        // Chunk and save to Cloud Pinecone Vector DB
        await vectorDbService.upsertDocument(filename, text, { uploader: req.user.id });
        
        res.json({ success: true, message: 'Document ingested successfully into RAG memory.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/document/query', auth, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ success: false, message: 'Query missing.' });
        
        const results = await vectorDbService.query(query, 5);
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = 7002;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Microservice] RAG Service running on port ${PORT}`);
});
