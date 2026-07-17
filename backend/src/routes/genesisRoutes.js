const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modelRouter = require('../services/modelRouter');

router.post('/synthesize', auth, async (req, res) => {
    try {
        const { organism } = req.body;
        
        if (!organism) {
            return res.status(400).json({ success: false, message: 'Organism name is required.' });
        }

        const sysPrompt = `You are the Genesis Pod Biological AI. The user is asking you to synthesize a new organism or biological entity: "${organism}".

CRITICAL RULES:
1. Identify the EXACT language or script the user used (e.g., Telugu, English, Hindi, Tanglish).
2. Generate a highly scientific, fascinating biological description of this creature (its DNA, habitat, special abilities, and behavior). This description MUST be strictly in the EXACT SAME LANGUAGE and script the user used.
3. Generate a highly detailed, photorealistic 8K cinematic image generation prompt for this creature. This prompt MUST be strictly in ENGLISH.

Format your output STRICTLY as valid JSON:
{
    "description": "Your biological description in the user's language/script...",
    "image_prompt": "Highly detailed 8K photorealistic English prompt of the creature in its natural habitat..."
}`;
        
        const llmResponse = await modelRouter.routeQuery(sysPrompt, 'high');
        
        let parsed;
        try {
            parsed = JSON.parse(llmResponse.match(/\{[\s\S]*\}/)[0]);
        } catch(e) {
            parsed = { 
                description: `Entity "${organism}" successfully synthesized. Consciousness verified.`,
                image_prompt: `A highly detailed, cinematic 8k photorealistic image of ${organism}`
            };
        }

        const encodedPrompt = encodeURIComponent(parsed.image_prompt + ", masterpiece, award-winning photography, hyper-realistic, 8k resolution, highly detailed, sharp focus, real life");
        const mediaUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux&enhance=false`;

        res.json({
            success: true,
            description: parsed.description,
            mediaUrl
        });

    } catch (err) {
        console.error('Genesis Pod error:', err);
        res.status(500).json({ success: false, description: 'Biological synthesis failed.' });
    }
});

module.exports = router;
