import React, { useState, useEffect, useRef } from 'react';
import { Monitor, MonitorOff } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScreenUnderstanding() {
  const [isSharing, setIsSharing] = useState(false);
  const [insight, setInsight] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const { socket } = useSocket();

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsSharing(true);

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      // Capture frame every 3 seconds and send to backend for Live Vision
      intervalRef.current = setInterval(() => {
        if (videoRef.current && canvasRef.current && socket) {
          const context = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Compress heavily for speed
          const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.5);
          socket.emit('live_vision_frame', {
            imageBase64: base64Image,
            prompt: "What is currently happening on my screen? Be brief."
          });
        }
      }, 3000);

    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsSharing(false);
    setInsight('');
  };

  useEffect(() => {
    if (socket) {
      socket.on('vision_stream_response', (data) => {
        setInsight(data.text);
      });
    }
    return () => {
      if (socket) socket.off('vision_stream_response');
    };
  }, [socket]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isSharing ? stopScreenShare : startScreenShare}
        className={`p-2 rounded-full transition-colors flex items-center justify-center ${
          isSharing ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' : 'bg-surface border border-border/50 text-muted hover:text-accent hover:border-accent'
        }`}
        title={isSharing ? "Stop Screen AI" : "Share Screen with AI"}
      >
        {isSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
      </button>
      
      {/* Hidden elements for capture */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Floating Insight Overlay */}
      <AnimatePresence>
        {isSharing && insight && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-md bg-black/80 backdrop-blur border border-accent/30 text-white p-3 rounded-xl shadow-2xl text-xs font-mono text-center"
          >
            <span className="text-accent font-bold mr-2">SCREEN AI:</span>
            {insight}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
