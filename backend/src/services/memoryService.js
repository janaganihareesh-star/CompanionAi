const axios = require('axios');
const MemoryVault = require('../models/MemoryVault');
const GraphNode = require('../models/GraphNode');
const GraphEdge = require('../models/GraphEdge');
const ragService = require('./ragService');

async function extractAndSaveMemories({ userId, userMessage }) {
  // Bypass extraction for casual messages to save API Rate Limits (Gemini 15 RPM)
  const wordCount = (userMessage || '').trim().split(/\s+/).length;
  if (wordCount < 4) {
    return [];
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'AIzaSyDummyKeyForGeminiAPI') {
    return [];
  }

  const systemPrompt = `Analyze and extract important personal facts from: "${userMessage}"
  Categories: family friends relationship breakup career education goal dream health achievement favorite personality knowledge
  Also classify the memoryType as one of: "ShortTerm", "Preference", "Project", or "Uncategorized".
  Importance 1-10 (skip < 5). Skip trivial like had tea/watched TV.
  Return ONLY JSON array: [{"category": "...", "memoryType": "...", "memory": "...", "importanceScore": 8}] or []. Do not wrap in markdown tags.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      { role: 'user', parts: [{ text: `User message: "${userMessage}"` }] }
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await axios.post(url, requestBody);
    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    let items = [];
    try {
      items = JSON.parse(responseText);
    } catch (parseErr) {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      items = JSON.parse(cleaned);
    }

    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.importanceScore >= 5) {
          // Check for similar memory to avoid duplicate logs
          const escapedMemory = item.memory.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const existing = await MemoryVault.findOne({
            userId,
            category: item.category,
            memory: { $regex: new RegExp(escapedMemory, 'i') }
          });

          if (!existing) {
            const embedding = await ragService.generateEmbedding(item.memory);
            await MemoryVault.create({
              userId,
              category: item.category,
              memoryType: item.memoryType || 'Uncategorized',
              memory: item.memory,
              importanceScore: item.importanceScore,
              source: 'auto',
              embedding: embedding
            });
          }
        }
      }
    }
    return items;
  } catch (err) {
    console.error('Memory extraction error:', err.response?.data || err.message);
    return [];
  }
}

async function correctMemory({ userId, oldInfo, newInfo }) {
  if (!oldInfo || !newInfo) return { updated: false };

  // Fuzzy regex match for existing memory in the vault
  const escapedOld = oldInfo.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const memoryObj = await MemoryVault.findOne({
    userId,
    memory: { $regex: new RegExp(escapedOld, 'i') }
  });

  if (memoryObj) {
    memoryObj.memory = newInfo;
    await memoryObj.save();
    return { updated: true, memoryId: memoryObj._id };
  } else {
    // Fallback if not found: create a new memory
    const newMemory = await MemoryVault.create({
      userId,
      category: 'personality',
      memory: newInfo,
      importanceScore: 6,
      source: 'auto'
    });
    return { updated: false, memoryId: newMemory._id };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE GRAPH EXTRACTION (Phase 8.1)
// ─────────────────────────────────────────────────────────────────────────────
async function extractKnowledgeGraph({ userId, userMessage }) {
  // Bypass extraction for casual messages to save API Rate Limits (Gemini 15 RPM)
  const wordCount = (userMessage || '').trim().split(/\s+/).length;
  if (wordCount < 4) {
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'AIzaSyDummyKeyForGeminiAPI') return;

  const systemPrompt = `You are a Knowledge Graph extraction engine.
Analyze the user message: "${userMessage}"
Identify named entities (Nodes) and the relationships between them (Edges).
Nodes should have a label (e.g. Person, Skill, Project, Object) and a name (e.g. Hareesh, MERN, ExamGuard).
Edges should have a source (Node name), target (Node name), and a relation (uppercase string, e.g. IS_LEARNING, BUILT, LIKES).

Return ONLY a valid JSON object in this exact format:
{
  "nodes": [{"label": "Person", "name": "Hareesh"}, {"label": "Skill", "name": "MERN"}],
  "edges": [{"source": "Hareesh", "target": "MERN", "relation": "IS_LEARNING"}]
}
If no logical graph can be formed, return {"nodes":[], "edges":[]}. Do not wrap in markdown tags.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
    });

    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{"nodes":[], "edges":[]}';
    const graphData = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

    if (!graphData.nodes || graphData.nodes.length === 0) return;

    // 1. Save or Find Nodes
    const nodeCache = {};
    for (const node of graphData.nodes) {
      if (!node.name || !node.label) continue;
      const normalizedName = node.name.toLowerCase();
      let dbNode = await GraphNode.findOne({ userId, name: normalizedName });
      if (!dbNode) {
        dbNode = await GraphNode.create({ userId, label: node.label, name: normalizedName });
      }
      nodeCache[normalizedName] = dbNode._id;
    }

    // 2. Save Edges
    if (graphData.edges) {
      for (const edge of graphData.edges) {
        if (!edge.source || !edge.target || !edge.relation) continue;
        const srcId = nodeCache[edge.source.toLowerCase()];
        const tgtId = nodeCache[edge.target.toLowerCase()];
        if (srcId && tgtId) {
          const existingEdge = await GraphEdge.findOne({ userId, sourceNodeId: srcId, targetNodeId: tgtId, relation: edge.relation.toUpperCase() });
          if (!existingEdge) {
            await GraphEdge.create({
              userId,
              sourceNodeId: srcId,
              targetNodeId: tgtId,
              relation: edge.relation.toUpperCase()
            });
          }
        }
      }
    }
    console.log(`[Knowledge Graph] Extracted ${graphData.nodes.length} nodes and ${graphData.edges?.length || 0} edges.`);
  } catch (err) {
    console.error('[Knowledge Graph Error]:', err.message);
  }
}

async function updateRollingSummary(conversationId) {
  try {
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    // We want to keep the 15 most recent messages intact.
    // Anything older than the top 15 should be summarized.
    const recentMessages = await Message.find({ conversationId })
      .sort({ timestamp: -1 })
      .limit(15);
    
    if (recentMessages.length < 15) return; // Not enough messages to summarize

    const thresholdMessage = recentMessages[14]; // The 15th message
    
    // Find messages older than the threshold message, but newer than summaryLastMessageId
    const query = {
      conversationId,
      timestamp: { $lt: thresholdMessage.timestamp }
    };
    if (conversation.summaryLastMessageId) {
      const lastSummarized = await Message.findById(conversation.summaryLastMessageId);
      if (lastSummarized) {
        query.timestamp = { $gt: lastSummarized.timestamp, $lt: thresholdMessage.timestamp };
      }
    }

    const messagesToSummarize = await Message.find(query).sort({ timestamp: 1 });
    if (messagesToSummarize.length === 0) return; // Nothing to summarize

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    const formattedMessages = messagesToSummarize.map(m => `${m.sender.toUpperCase()}: ${m.content}`).join('\n');
    const currentSummary = conversation.rollingSummary || 'No previous summary.';
    
    const systemPrompt = `You are CloserAI's memory summarization engine. 
Your task is to take an existing conversation summary and a batch of new old messages, and merge them into a single, highly dense, unified summary of the entire conversation up to this point. 
Focus on facts, user preferences, and important context. Do NOT use conversational filler.

CURRENT SUMMARY:
${currentSummary}

NEW MESSAGES TO ADD TO SUMMARY:
${formattedMessages}

Return ONLY the updated text summary.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    const requestBody = {
      contents: [{ role: 'user', parts: [{ text: 'Update the summary.' }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.1 }
    };

    const response = await axios.post(url, requestBody);
    const newSummary = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (newSummary) {
      conversation.rollingSummary = newSummary.trim();
      conversation.summaryLastMessageId = messagesToSummarize[messagesToSummarize.length - 1]._id;
      await conversation.save();
      console.log(`[Rolling Summary] Updated for conversation ${conversationId}. Compressed ${messagesToSummarize.length} messages.`);
    }

  } catch (err) {
    console.error('[Rolling Summary Error]', err.message);
  }
}

module.exports = {
  extractAndSaveMemories,
  correctMemory,
  extractKnowledgeGraph,
  updateRollingSummary
};
