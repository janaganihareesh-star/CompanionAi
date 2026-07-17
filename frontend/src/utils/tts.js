// frontend/src/utils/tts.js

class TTSManager {
  constructor() {
    this.audioQueue = [];
    this.isPlaying = false;
    this.currentAudio = null;
    this.onEndCallbacks = [];
  }

  speak(text, lang = 'te') {
    // Edge TTS via backend handles large texts perfectly without chunking limits
    this.audioQueue.push({ text: text.trim(), lang });

    if (!this.isPlaying) {
      this._playNext();
    }
  }

  _playNext() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.currentAudio = null;
      this.onEndCallbacks.forEach(cb => cb());
      return;
    }
    const { text, lang } = this.audioQueue.shift();

    // Check for native speech synthesis support to reduce latency
    if (window.speechSynthesis && !text.includes('```')) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'te' ? 'te-IN' : 'en-US';
      utterance.onend = () => this._playNext();
      utterance.onerror = () => this._playNext();
      
      this.isPlaying = true;
      window.speechSynthesis.speak(utterance);
      return;
    }

    this.isPlaying = true;
    
    // Fallback to backend TTS
    const url = `/api/tts/stream?text=${encodeURIComponent(text)}&lang=${lang}`;
    this.currentAudio = new Audio(url);
    
    this.currentAudio.onended = () => {
      this._playNext();
    };
    
    this.currentAudio.onerror = () => {
      console.error("Audio playback error");
      this._playNext();
    };
    
    this.currentAudio.play().catch(e => {
      console.error("Audio play blocked", e);
      this._playNext();
    });
  }

  cancel() {
    this.audioQueue = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    this.isPlaying = false;
    this.onEndCallbacks.forEach(cb => cb());
  }

  onEnd(cb) {
    this.onEndCallbacks.push(cb);
  }
}

export const googleTTS = new TTSManager();
