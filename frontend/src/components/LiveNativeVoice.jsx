import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import useSocket from '../hooks/useSocket';

export default function LiveNativeVoice({ companionName }) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('DORMANT');
  const [serverText, setServerText] = useState('');
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const { socket } = useSocket();
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('realtime_ready', () => {
      setStatus('CONNECTED');
    });

    socket.on('realtime_text_chunk', (payload) => {
      setServerText((prev) => prev + payload.text);
    });

    socket.on('realtime_audio_chunk', async (payload) => {
      // payload.data is base64 PCM 16kHz
      const binaryString = window.atob(payload.data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBuffer = await decodePcmToAudioBuffer(bytes.buffer);
      if (audioBuffer) {
        audioQueueRef.current.push(audioBuffer);
        playNextAudio();
      }
    });

    socket.on('realtime_error', (payload) => {
      console.error('Realtime error:', payload.message);
      setStatus('ERROR');
      stopAudio();
    });

    return () => {
      socket.off('realtime_ready');
      socket.off('realtime_text_chunk');
      socket.off('realtime_audio_chunk');
      socket.off('realtime_error');
    };
  }, [socket]);

  const decodePcmToAudioBuffer = async (arrayBuffer) => {
    if (!audioContextRef.current) return null;
    const view = new Int16Array(arrayBuffer);
    const audioBuffer = audioContextRef.current.createBuffer(1, view.length, 16000);
    const channel = audioBuffer.getChannelData(0);
    for (let i = 0; i < view.length; i++) {
      channel[i] = view[i] / 32768; // Convert int16 to float32
    }
    return audioBuffer;
  };

  const playNextAudio = () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) return;
    
    isPlayingRef.current = true;
    const audioBuffer = audioQueueRef.current.shift();
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      isPlayingRef.current = false;
      playNextAudio();
    };
    source.start();
  };

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      // Create script processor to capture raw PCM
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Send raw binary buffer over Socket.io instead of freezing the UI thread converting to base64
        if (socket) {
          socket.emit('realtime_client_audio', pcmData.buffer); // Emit raw ArrayBuffer
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      socket.emit('start_realtime_audio', {});
      setIsActive(true);
      setStatus('CONNECTING...');
    } catch (e) {
      console.error('Failed to start native audio:', e);
    }
  };

  const stopAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsActive(false);
    setStatus('DORMANT');
    socket.emit('stop_realtime_audio');
    setServerText('');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative">
      <div className="absolute top-4 right-4 z-50">
        <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider shadow-[0_0_15px_rgba(0,0,0,0.5)] ${status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-gray-800 text-gray-400'}`}>
          NATIVE AUDIO: {status}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center relative w-full overflow-hidden">
        {isActive && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 m-auto w-64 h-64 rounded-full bg-accent/20 blur-3xl"
          />
        )}
        
        <button 
          onClick={isActive ? stopAudio : startAudio}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isActive ? 'bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'bg-surface border-2 border-accent shadow-[0_0_20px_rgba(139,92,246,0.2)]'}`}
        >
          {isActive ? <Mic className="w-12 h-12 text-rose-500" /> : <MicOff className="w-12 h-12 text-accent" />}
        </button>
      </div>

      <div className="h-32 w-full max-w-2xl px-6 pb-8 flex flex-col justify-end text-center">
        <AnimatePresence>
          {serverText && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-lg md:text-2xl font-outfit text-text bg-clip-text text-transparent bg-gradient-to-r from-text to-muted tracking-wide leading-relaxed font-medium"
            >
              "{serverText}"
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
