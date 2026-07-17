import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Camera } from 'lucide-react';

export default function LiveVision({ onFrameCaptured, isActive, setIsActive }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isFacingUser, setIsFacingUser] = useState(true);

  // Auto-capture interval for live video context
  useEffect(() => {
    let intervalId;
    if (isActive && stream) {
      intervalId = setInterval(() => {
        captureFrame();
      }, 1500); // capture every 1.5s for backend context
    }
    return () => clearInterval(intervalId);
  }, [isActive, stream]);

  // Start or Stop Camera
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isActive, isFacingUser]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isFacingUser ? 'user' : 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Compress and get base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.6);
    if (onFrameCaptured) {
      onFrameCaptured(base64Image);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 left-4 w-48 h-64 bg-black rounded-xl overflow-hidden shadow-2xl border border-border/50 z-50 flex flex-col"
          >
            <div className="bg-black/50 absolute top-0 w-full p-2 flex justify-between items-center z-10 backdrop-blur-sm">
              <span className="text-xs text-white font-bold flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> Live Vision
              </span>
              <button 
                onClick={() => setIsFacingUser(!isFacingUser)}
                className="text-white/80 hover:text-white p-1"
                title="Switch Camera"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${isFacingUser ? 'scale-x-[-1]' : ''}`}
            />
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={() => setIsActive(!isActive)}
        className={`p-2 flex-shrink-0 cursor-pointer rounded-full transition ${isActive ? 'bg-rose-500/20 text-rose-500' : 'text-muted hover:text-accent'}`}
        title={isActive ? "Stop Live Vision" : "Start Live Vision"}
      >
        {isActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </motion.button>
    </>
  );
}
