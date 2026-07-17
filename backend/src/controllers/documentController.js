/**
 * documentController.js — Engines 35 + 36
 * Document Generation (35) + Document Intelligence (36)
 */

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const docGenService = require('../services/documentGenerationService');
const docIntelService = require('../services/documentIntelligenceService');
const UserPreference = require('../models/UserPreference');

// ─── Multer upload config ──────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../uploads/docs');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv', 'image/jpeg', 'image/png'];

exports.uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type.'), false);
  }
}).single('file');

async function getLanguage(userId) {
  const pref = await UserPreference.findOne({ userId }).select('language').lean();
  return pref?.language || 'English';
}

// In-memory document history (per user session — production should use MongoDB)
const docHistory = new Map();

function saveToHistory(userId, doc) {
  if (!docHistory.has(userId)) docHistory.set(userId, []);
  const history = docHistory.get(userId);
  history.unshift({ id: uuidv4(), ...doc, createdAt: new Date().toISOString() });
  if (history.length > 20) history.splice(20);
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE 35 — DOCUMENT GENERATION
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/document/generate
exports.generateDocument = async (req, res, next) => {
  try {
    const { type, userDetails, template, exportFormat } = req.body;
    const language = await getLanguage(req.user.id);

    if (!type) return res.status(400).json({ success: false, message: 'Document type is required.' });
    if (!docGenService.SUPPORTED_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `Supported types: ${docGenService.SUPPORTED_TYPES.join(', ')}` });
    }

    const doc = await docGenService.generateDocument({ type, userDetails: userDetails || {}, language, template });
    saveToHistory(req.user.id, { type, template, title: doc.title });

    res.status(200).json({ success: true, document: doc, exportFormats: ['pdf', 'docx', 'txt', 'md'] });
  } catch (err) { next(err); }
};

// POST /api/document/export
exports.exportDocument = async (req, res, next) => {
  try {
    const { document: doc, format = 'txt', filename = 'document' } = req.body;
    if (!doc) return res.status(400).json({ success: false, message: 'document is required.' });

    let buffer, contentType, ext;

    switch (format) {
      case 'pdf':
        buffer = await docGenService.toPdf(doc);
        contentType = 'application/pdf';
        ext = 'pdf';
        break;
      case 'docx':
        buffer = await docGenService.toDocx(doc);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        ext = 'docx';
        break;
      case 'md':
        buffer = Buffer.from(docGenService.toMarkdown(doc));
        contentType = 'text/markdown';
        ext = 'md';
        break;
      default: // txt
        buffer = Buffer.from(docGenService.toTxt(doc));
        contentType = 'text/plain';
        ext = 'txt';
    }

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}.${ext}"`,
      'Content-Length': buffer.length
    });
    res.send(buffer);
  } catch (err) { next(err); }
};

// GET /api/document/history
exports.getHistory = (req, res) => {
  const history = docHistory.get(req.user.id) || [];
  res.status(200).json({ success: true, history });
};

// DELETE /api/document/:id
exports.deleteDocument = (req, res) => {
  const history = docHistory.get(req.user.id) || [];
  const filtered = history.filter(d => d.id !== req.params.id);
  docHistory.set(req.user.id, filtered);
  res.status(200).json({ success: true, message: 'Removed from history.' });
};

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE 36 — DOCUMENT INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/document/upload
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const extractedText = await docIntelService.extractText(req.file.path, req.file.mimetype);
    const preview = extractedText.substring(0, 300);
    const wordCount = extractedText.trim().split(/\s+/).length;

    // V2 Scale & Context Windows (Infinite Memory RAG)
    if (wordCount > 1000) {
      console.log(`[Document Intelligence] Large document detected (${wordCount} words). Chunking into Vector Search RAG...`);
      const embeddingService = require('../services/embeddingService');
      const MemoryVault = require('../models/MemoryVault');
      
      const chunks = embeddingService.chunkText(extractedText, 500); // 500 words per chunk
      
      // Hierarchical Retrieval (Claude-Level Context) - Add a root metadata chunk
      const rootEmbedding = await embeddingService.generateEmbedding(`Document: ${req.file.originalname}`);
      if (rootEmbedding) {
         await MemoryVault.create({
            userId: req.user.id,
            memory: `[Document Metadata: ${req.file.originalname}] Uploaded document with ${wordCount} words. To answer questions about this, rely on the detailed chunks.`,
            type: 'fact',
            embedding: rootEmbedding
         });
      }

      for (const chunk of chunks) {
        const embedding = await embeddingService.generateEmbedding(chunk);
        if (embedding) {
          await MemoryVault.create({
            userId: req.user.id,
            memory: `[Document: ${req.file.originalname}] ${chunk}`,
            type: 'fact',
            embedding
          });
        }
      }
      console.log(`[Document Intelligence] Inserted ${chunks.length} vectorized chunks into MemoryVault.`);
    }

    res.status(200).json({
      success: true,
      fileId: path.basename(req.file.path),
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      extractedText,
      preview,
      wordCount,
      characterCount: extractedText.length
    });
  } catch (err) { next(err); }
};

async function getTextFromBody(req) {
  const { text, extractedText } = req.body;
  return text || extractedText || '';
}

// POST /api/document/summarize
exports.summarizeDoc = async (req, res, next) => {
  try {
    const text = await getTextFromBody(req);
    if (!text) return res.status(400).json({ success: false, message: 'text or extractedText is required.' });
    const language = await getLanguage(req.user.id);
    const result = await docIntelService.summarizeDocument({ text, language, length: req.body.length });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

// POST /api/document/explain
exports.explainDoc = async (req, res, next) => {
  try {
    const text = await getTextFromBody(req);
    if (!text) return res.status(400).json({ success: false, message: 'text is required.' });
    const language = await getLanguage(req.user.id);
    const result = await docIntelService.explainDocument({ text, language, level: req.body.level });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

// POST /api/document/translate
exports.translateDoc = async (req, res, next) => {
  try {
    const { targetLanguage } = req.body;
    if (!targetLanguage) return res.status(400).json({ success: false, message: 'targetLanguage is required.' });
    const text = await getTextFromBody(req);
    if (!text) return res.status(400).json({ success: false, message: 'text is required.' });
    const result = await docIntelService.translateDocument({ documentText: text, targetLanguage });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

// POST /api/document/mcq
exports.generateMCQs = async (req, res, next) => {
  try {
    const text = await getTextFromBody(req);
    if (!text) return res.status(400).json({ success: false, message: 'text is required.' });
    const language = await getLanguage(req.user.id);
    const result = await docIntelService.generateMCQs({
      text, language,
      count: req.body.count || 10,
      difficulty: req.body.difficulty || 'medium'
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

// POST /api/document/interview-questions
exports.generateInterviewQs = async (req, res, next) => {
  try {
    const text = await getTextFromBody(req);
    if (!text) return res.status(400).json({ success: false, message: 'text is required.' });
    const language = await getLanguage(req.user.id);
    const result = await docIntelService.generateInterviewQuestions({
      text, language,
      role: req.body.role,
      count: req.body.count || 10
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

// POST /api/document/notes
exports.generateNotes = async (req, res, next) => {
  try {
    const text = await getTextFromBody(req);
    if (!text) return res.status(400).json({ success: false, message: 'text is required.' });
    const language = await getLanguage(req.user.id);
    const result = await docIntelService.generateNotes({ text, language, style: req.body.style });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

// POST /api/document/extract-tables
exports.extractTables = async (req, res, next) => {
  try {
    const text = await getTextFromBody(req);
    if (!text) return res.status(400).json({ success: false, message: 'text is required.' });
    const result = await docIntelService.extractTables({ text });
    res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};
