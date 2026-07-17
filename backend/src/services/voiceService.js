const axios = require('axios');
const cloudinary = require('../config/cloudinary');

const langCodeMap = {
  'English': 'en',
  'Telugu': 'te',
  'Hindi': 'hi',
  'Tamil': 'ta',
  'Kannada': 'kn',
  'Malayalam': 'ml',
  'Bengali': 'bn',
  'Marathi': 'mr',
  'Gujarati': 'gu',
  'Odia': 'or',
  'Punjabi': 'pa',
  'Urdu': 'ur',
  'Sanskrit': 'sa',
  'Kashmiri': 'ks',
  'Konkani': 'kok',
  'Nepali': 'ne',
  'Manipuri': 'mni',
  'Sindhi': 'sd'
};

async function textToSpeech(text, language = 'English', voiceId = 'EXAVITQu4vr4xnSDxMaL') {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const cleanText = text.replace(/[*_#`~[\]]/g, '').substring(0, 500);

    if (apiKey && apiKey !== 'your_elevenlabs_key_here') {
      const response = await axios({
        method: 'post',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        data: {
          text: cleanText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        responseType: 'arraybuffer'
      });

      // Instead of uploading to Cloudinary, return the raw audio buffer as a Base64 Data URI
      // This eliminates the Cloudinary latency (which was adding ~2-4 seconds).
      const base64Audio = Buffer.from(response.data).toString('base64');
      return `data:audio/mpeg;base64,${base64Audio}`;
    }

    // Fallback to Google TTS
    const langCode = langCodeMap[language] || 'en';
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(cleanText)}&tl=${langCode}`;
  } catch (err) {
    console.error('Error generating TTS:', err.message);
    const langCode = langCodeMap[language] || 'en';
    const cleanText = text.replace(/[*_#`~[\]]/g, '').substring(0, 200);
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(cleanText)}&tl=${langCode}`;
  }
}

module.exports = {
  textToSpeech
};
