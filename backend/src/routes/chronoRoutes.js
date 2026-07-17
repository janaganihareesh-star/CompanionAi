const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const modelRouter = require('../services/modelRouter');

// Stable Cinematic BGM tracks (Actual Music, not ambient noise)
const TELUGU_BGM_TRACKS = {
    mother_sentiment: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Kevin_MacLeod_-_Symmetry.ogg', // Soft, emotional music
    hero_elevation: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Kevin_MacLeod_-_Volatile_Reaction.ogg', // Action, fast paced
    love_romantic: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Kevin_MacLeod_-_Ario.ogg', // Romantic, beautiful melody
    sad_emotional: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Kevin_MacLeod_-_Grief_and_Despair.ogg', // Sad, dark piano
    suspense_thriller: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Kevin_MacLeod_-_The_Complex.ogg', // Suspenseful music
    divine_devotional: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Kevin_MacLeod_-_Meditation_Impromptu_01.ogg', // Divine, peaceful flute/synth
    happy_celebration: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Kevin_MacLeod_-_Life_of_Riley.ogg' // Happy, upbeat music
};

const videoGenerationService = require('../services/videoGenerationService');

router.post('/generate', auth, async (req, res) => {
    try {
        const { date, incident } = req.body;
        
        if (!date || !incident) {
            return res.status(400).json({ success: false, message: 'Date and incident are required.' });
        }

        // 1. Generate Deep Cinematic Video Prompt & Vibe & Language Search Keyword using LLM
        const sysPrompt = `You are an elite historical cinematic director. 
The user wants to travel to the exact date: ${date} to witness: "${incident}".

Your job is to vividly expand this short incident into an extremely detailed, photorealistic cinematic image description. 
CRITICAL RULES:
1. TRANSLATION: The user's incident might be in a regional language (e.g. Telugu "nenu puttanu"). FIRST, internally translate it to English to understand its true literal meaning (e.g. "I was born"). Do NOT mistake it for a movie title. Describe the actual event (e.g. a dramatic birth scene, a hospital, or a mother holding a baby).
2. The visual style, color grading, clothes, and atmosphere MUST perfectly match the literal meaning of the incident AND the DATE provided. 
3. If the date is ancient (e.g., 0050), describe ancient, realistic, natural, rustic, or mythological environments. NO modern tech, NO sci-fi, NO VR goggles.
4. If it's a dark/evil prompt (e.g., "devil was born"), describe a terrifying, dark, fiery, realistic underworld or demonic scene.

1. Write this highly detailed cinematic image generation prompt (English). Include specific camera angles, color grading (e.g., sepia, high contrast, dark fantasy, natural light), and 8k photorealistic quality tags.
2. Determine the exact emotional vibe for the Background Music from this exact list: [mother_sentiment, hero_elevation, love_romantic, sad_emotional, suspense_thriller, divine_devotional, happy_celebration].
3. Generate an exact Apple Music / iTunes search phrase to find a song that fits this vibe IN THE USER'S LANGUAGE. CRITICAL: iTunes search relies on Artist names or exact titles, NOT generic words. Your search phrase MUST include the language name AND a famous composer/singer from that language known for this vibe. Examples: If Telugu and sad: "Telugu Sid Sriram" or "Telugu Ilaiyaraaja". If Telugu and mass/hero: "Telugu Thaman S" or "Telugu Anirudh". If Hindi and romantic: "Hindi Arijit Singh". If English and suspense: "Hans Zimmer".

Format strictly as JSON: {"prompt": "...", "vibe": "...", "search_keyword": "..."}`;
        
        const llmResponse = await modelRouter.routeQuery(sysPrompt, 'high');
        let parsed;
        try {
            parsed = JSON.parse(llmResponse.match(/\{[\s\S]*\}/)[0]);
        } catch(e) {
            parsed = { prompt: incident + ", highly detailed cinematic, photorealistic, perfectly matching the historical era", vibe: 'suspense_thriller', search_keyword: 'cinematic epic bgm' };
        }

        // 2. Generate Real AI Visual via Pollinations (100% Free, Zero 402 errors)
        console.log(`[Chrono-Slip] Requesting Free AI Visual generation for: ${parsed.prompt}`);
        const encodedPrompt = encodeURIComponent(parsed.prompt + ", masterpiece, award-winning photography, hyper-realistic, 8k resolution, highly detailed, sharp focus, real life"); 
        const mediaUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1920&height=1080&nologo=true&model=flux&enhance=true`;
        
        // 3. Dynamically Fetch Real Song from iTunes API based on User Language & Vibe
        const axios = require('axios');
        let audioUrl = 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Kevin_MacLeod_-_Volatile_Reaction.ogg'; // Fallback
        
        const searchTerm = parsed.search_keyword || 'cinematic epic bgm';
        try {
            console.log(`[Chrono-Slip] Fetching real song for vibe using keyword: ${searchTerm}`);
            const itunesRes = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&limit=15`);
            const tracks = itunesRes.data.results.filter(t => t.previewUrl);
            if (tracks.length > 0) {
                // Pick a random track to keep it fresh
                audioUrl = tracks[Math.floor(Math.random() * tracks.length)].previewUrl;
                console.log(`[Chrono-Slip] Found Telugu Audio: ${audioUrl}`);
            }
        } catch (e) {
            console.error('[Chrono-Slip] iTunes API failed:', e.message);
        }

        res.json({
            success: true,
            mediaUrl,
            audioUrl,
            message: `Temporal link established. Simulating "${incident}" on ${date}.`
        });

    } catch (err) {
        console.error('Chrono-slip error:', err);
        res.status(500).json({ success: false, message: 'Temporal linkage failed.' });
    }
});

module.exports = router;
