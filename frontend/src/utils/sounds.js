// Premium UI Sound Synthesis using Web Audio API

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (frequency, type, duration, volume) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Fade out to avoid clicks
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore if audio is disabled
  }
};

export const playSound = {
  messageSent: () => {
    // Subtle pop up
    playTone(600, 'sine', 0.1, 0.05);
    setTimeout(() => playTone(800, 'sine', 0.1, 0.05), 50);
  },
  messageReceived: () => {
    // Soft marimba-like double ping
    playTone(800, 'sine', 0.15, 0.05);
    setTimeout(() => playTone(1200, 'sine', 0.2, 0.05), 100);
  },
  success: () => {
    // Satisfying chord
    playTone(440, 'sine', 0.3, 0.03); // A4
    playTone(554.37, 'sine', 0.3, 0.03); // C#5
    playTone(659.25, 'sine', 0.4, 0.03); // E5
  },
  error: () => {
    // Deep thud
    playTone(150, 'square', 0.2, 0.05);
    setTimeout(() => playTone(100, 'square', 0.2, 0.05), 100);
  },
  click: () => {
    // Very subtle tick
    playTone(1000, 'triangle', 0.02, 0.01);
  }
};
