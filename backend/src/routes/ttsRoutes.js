const express = require('express');
const router = express.Router();
const axios = require('axios');

// Ultra-Realistic TTS API Integration (ElevenLabs)
router.get('/stream', async (req, res) => {
  const { text, lang } = req.query;
  
  if (!text) {
    return res.status(400).send('Text is required');
  }

  try {
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) throw new Error('No ElevenLabs API Key found');
    
    // Choose voice based on language (using default ElevenLabs Voice IDs)
    // Adam (English) or Rachel (English). ElevenLabs Multilingual v2 handles Telugu automatically.
    const voiceId = lang === 'te' ? 'EXAVITQu4vr4xnSDxMaL' : 'pNInz6obpgDQGcFmaJgB';

    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      data: {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      },
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked'
    });
    
    response.data.pipe(res);
  } catch (error) {
    console.error('TTS Error:', error.message);
    res.status(500).send('TTS Generation Failed');
  }
});

module.exports = router;
