class EmotionSSMLInjector {
  constructor() {
    this.sentimentRules = {
      joy: '<prosody rate="fast" pitch="high">',
      sadness: '<prosody rate="slow" pitch="low" volume="soft">',
      anger: '<prosody rate="fast" pitch="high" volume="loud">',
      whisper: '<amazon:effect name="whispered">',
      default: '<prosody rate="medium" pitch="medium">'
    };
  }

  // A highly advanced text parser that attempts to detect the emotional tone
  // of the sentence and wraps it in SSML tags for the TTS engine.
  injectSSML(text, detectedEmotion = 'default') {
    if (!text || text.trim() === '') return '';

    // If the TTS engine (like ElevenLabs) supports native emotion mapping, 
    // we can use explicit SSML. Otherwise, this serves as a parser for standard AWS/GCP TTS.
    
    // Auto-detect basic emotions if not provided
    if (detectedEmotion === 'default') {
      if (text.includes('😭') || text.toLowerCase().includes('i am so sad')) detectedEmotion = 'sadness';
      else if (text.includes('😡') || text.includes('!')) detectedEmotion = 'anger';
      else if (text.includes('😂') || text.toLowerCase().includes('haha')) detectedEmotion = 'joy';
      else if (text.toLowerCase().includes('*whispers*')) detectedEmotion = 'whisper';
    }

    const openingTag = this.sentimentRules[detectedEmotion] || this.sentimentRules.default;
    
    // Some tags like Amazon whispered require specific closing tags,
    // but standard SSML prosody requires </prosody>
    const closingTag = openingTag.includes('amazon:effect') ? '</amazon:effect>' : '</prosody>';

    // Remove asterisks used for action descriptions before speech synthesis
    const cleanText = text.replace(/\*[^*]+\*/g, '').trim();

    return `<speak>${openingTag}${cleanText}${closingTag}</speak>`;
  }
}

module.exports = new EmotionSSMLInjector();
