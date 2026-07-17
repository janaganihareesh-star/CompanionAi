const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modelRouter = require('../services/modelRouter');

router.post('/simulate', auth, async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ success: false, message: 'Cosmic query is required.' });
        }

        const sysPrompt = `You are the Universe Sandbox Engine, a hyper-advanced AI capable of simulating and explaining the entire cosmos in real-time.
The user is asking you to simulate or explain a cosmic entity, planet, or phenomenon: "${query}".

CRITICAL RULES:
1. Identify the EXACT language or script the user used (e.g., Telugu, English, Hindi, Tanglish).
2. Generate a highly vivid, scientifically accurate, yet mind-bending cinematic description of this cosmic element. 
3. Include fascinating astrophysics facts (scale, gravity, temperature, or age) but frame it as if you are currently running a live simulation.
4. You MUST reply exclusively in the EXACT SAME LANGUAGE and script the user used. If they wrote in Tanglish, reply in Tanglish. If they wrote in Telugu script, reply in Telugu script.
5. Keep the response to 3-5 sentences maximum.
6. Tone should be awe-inspiring, cosmic, and deeply factual.
7. CRITICAL: OUTPUT PLAIN TEXT ONLY. DO NOT OUTPUT JSON. DO NOT USE ANY MARKDOWN FORMATTING OR KEY-VALUE PAIRS.`;
        
        const llmResponse = await modelRouter.routeQuery(sysPrompt, 'high');
        
        res.json({
            success: true,
            simulation: llmResponse
        });

    } catch (err) {
        console.error('Universe Sandbox error:', err);
        res.status(500).json({ success: false, simulation: 'Hyper-Dimensional RAM overflow. Simulation crashed.' });
    }
});

module.exports = router;
