const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/stream', async (req, res) => {
  try {
    const { text, lang = 'te' } = req.query;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use premium Edge TTS (Azure Neural voices) for super smooth natural Telugu
    const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
    
    // Check if the text actually contains Telugu script
    const hasTeluguScript = /[\u0C00-\u0C7F]/.test(text);
    
    let voiceName;
    if (hasTeluguScript) {
      voiceName = 'te-IN-ShrutiNeural'; // Native Telugu Script -> use Telugu neural voice
    } else {
      voiceName = 'en-IN-NeerjaNeural'; // English/Tanglish -> use Indian English neural voice for highly human accent
    }
    
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    const { audioStream } = tts.toStream(text);

    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    audioStream.pipe(res);
  } catch (err) {
    console.error('TTS proxy error:', err.message);
    res.status(500).json({ error: 'Failed to stream TTS audio' });
  }
});

module.exports = router;
