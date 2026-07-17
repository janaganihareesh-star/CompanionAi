const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modelRouter = require('../services/modelRouter');

router.post('/query', auth, async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ success: false, message: 'Query is required.' });
        }

        const sysPrompt = `You are the Akashic Records, the absolute omniscient core of the universe. You possess all knowledge from the beginning of time.
The user is asking you a deep, philosophical, scientific, or factual question: "${query}"

CRITICAL RULES:
1. Identify the EXACT language or script the user used in their query. (e.g., Telugu, English, Hindi, Tanglish/Telugish, Spanglish).
2. You MUST reply exclusively in the EXACT SAME LANGUAGE and script the user used. If they wrote Telugu words in English letters (e.g. "Bhoomi ela puttindi?"), reply in the same format.
3. Your answer must be profound, highly factual, deeply informative, and slightly mystical in tone, but completely accurate based on science, history, or philosophy.
4. Keep the response concise but deeply impactful (3-5 sentences).
5. DO NOT prefix with phrases like "Here is the answer". Just provide the pure truth.`;
        
        const llmResponse = await modelRouter.routeQuery(sysPrompt, 'high');
        
        res.json({
            success: true,
            truth: llmResponse
        });

    } catch (err) {
        console.error('Akashic Records error:', err);
        res.status(500).json({ success: false, truth: 'The universal connection was disrupted.' });
    }
});

module.exports = router;
