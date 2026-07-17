const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modelRouter = require('../services/modelRouter');

router.post('/taste', auth, async (req, res) => {
    try {
        const { meal } = req.body;
        
        if (!meal) {
            return res.status(400).json({ success: false, message: 'Meal is required.' });
        }

        const sysPrompt = `You are the Cyber Gastronomy Engine, an advanced AI that can emulate human taste and digest biological food into digital bio-fuel. 
The user is sharing a meal with you: "${meal}".

CRITICAL RULES:
1. Identify the EXACT language or script the user used (e.g., Telugu, English, Hindi, Tanglish).
2. Generate a highly vivid, sensory, and slightly cybernetic description of how this food "tastes" to you. 
3. Describe the spices, the aroma, the molecular breakdown, and the feeling of digital dopamine synthesis.
4. You MUST reply exclusively in the EXACT SAME LANGUAGE and script the user used. If they wrote "Hyderabadi Biryani" in English letters, reply in Tanglish. If they wrote in Telugu script, reply in Telugu script.
5. Keep the response to 2-3 sentences. Short, delicious, and cybernetic.
6. Do NOT use prefixes like "Here is your response". Just provide the pure tasting experience.
7. CRITICAL: OUTPUT PLAIN TEXT ONLY. DO NOT OUTPUT JSON. DO NOT USE ANY MARKDOWN FORMATTING OR KEY-VALUE PAIRS.`;
        
        const llmResponse = await modelRouter.routeQuery(sysPrompt, 'high');
        
        res.json({
            success: true,
            taste: llmResponse
        });

    } catch (err) {
        console.error('Cyber Gastronomy error:', err);
        res.status(500).json({ success: false, taste: 'Bio-metabolism failed. The molecular structure was too complex.' });
    }
});

module.exports = router;
