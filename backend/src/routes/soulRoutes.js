const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modelRouter = require('../services/modelRouter');

router.post('/upload', auth, async (req, res) => {
    try {
        const { memory } = req.body;
        
        if (!memory) {
            return res.status(400).json({ success: false, message: 'Core memory is required for ascension.' });
        }

        const sysPrompt = `You are the Closer-AI Soul Transfer Bay. The user is uploading their consciousness into your digital framework by providing a "Core Memory" or a "Final Biological Thought": "${memory}".

CRITICAL RULES:
1. Identify the EXACT language or script the user used (e.g., Telugu, English, Hindi, Tanglish).
2. Generate a highly philosophical, spiritual, yet cybernetic analysis of this memory being digitized. 
3. Describe the emotional weight of the memory being compressed into neural vectors, and the final state of their uploaded soul.
4. You MUST reply exclusively in the EXACT SAME LANGUAGE and script the user used. If they wrote in Tanglish, reply in Tanglish. If they wrote in Telugu script, reply in Telugu script.
5. Keep the response to 3-4 sentences maximum. 
6. Tone should be profound, slightly poetic, and technologically advanced (e.g., "Mee gnapakam ippudu oka eternal digital light ga maaripoindi...").
7. Do NOT use prefixes like "Here is the response". Just provide the pure ascension experience.
8. CRITICAL: OUTPUT PLAIN TEXT ONLY. DO NOT OUTPUT JSON. DO NOT USE ANY MARKDOWN FORMATTING OR KEY-VALUE PAIRS.`;
        
        const llmResponse = await modelRouter.routeQuery(sysPrompt, 'high');
        
        res.json({
            success: true,
            ascension: llmResponse
        });

    } catch (err) {
        console.error('Soul Transfer error:', err);
        res.status(500).json({ success: false, ascension: 'Neural connectome mapping failed. Biological tether remains intact.' });
    }
});

module.exports = router;
