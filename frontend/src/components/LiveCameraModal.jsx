import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, Loader2, BrainCircuit, Radio, StopCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useSocket from '../hooks/useSocket';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user" // Or environment for rear camera
};

export default function LiveCameraModal({ isOpen, onClose, onAnalyze }) {
  const webcamRef = useRef(null);
  const { socket } = useSocket();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastCapture, setLastCapture] = useState(null);
  const [streamObservations, setStreamObservations] = useState([]);
  const streamIntervalRef = useRef(null);

  // Listen to socket responses
  useEffect(() => {
    if (!socket) return;
    
    const handleVisionResponse = (data) => {
      setStreamObservations(prev => {
        const updated = [...prev, `[${new Date().toLocaleTimeString()}] ${data.text}`];
        if (updated.length > 5) return updated.slice(updated.length - 5);
        return updated;
      });
    };

    socket.on('vision_stream_response', handleVisionResponse);
    return () => socket.off('vision_stream_response', handleVisionResponse);
  }, [socket]);

  // Clean up interval on unmount or close
  useEffect(() => {
    if (!isOpen && isStreaming) {
      stopStreaming();
    }
  }, [isOpen]);

  const toggleStreaming = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  const startStreaming = () => {
    if (!socket) {
      toast.error('Socket not connected.');
      return;
    }
    setIsStreaming(true);
    setStreamObservations(['[System] Connected to Companion AI Vision Core...']);
    
    // Capture and emit frame every 2 seconds
    streamIntervalRef.current = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          socket.emit('live_vision_frame', { imageBase64: imageSrc });
        }
      }
    }, 2000);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
  };
  
  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current) return;
    
    setIsAnalyzing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        toast.error('Failed to capture frame');
        setIsAnalyzing(false);
        return;
      }
      
      setLastCapture(imageSrc);
      
      // Auto-generate prompt for Gemini
      const prompt = "What do you see in this live camera feed? Explain briefly.";
      
      // Pass base64 image up to ChatBox
      await onAnalyze(imageSrc, prompt);
      
    } catch (err) {
      console.error(err);
      toast.error('Error analyzing frame');
    } finally {
      setIsAnalyzing(false);
      // Don't auto close so they can do continuous analysis
      setTimeout(() => setLastCapture(null), 2000); // Clear flash effect
    }
  }, [webcamRef, onAnalyze]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-panel border border-border w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
          >
            {/* Viewfinder Section */}
            <div className="flex-1 relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
                mirrored={true}
              />

              {/* Scanline Effect overlay for "AI" feel */}
              <div className="absolute inset-0 pointer-events-none border-4 border-accent/20 rounded-lg m-4" />
              
              {/* Flash effect when captured */}
              <AnimatePresence>
                {lastCapture && !isStreaming && (
                  <motion.div
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-white z-10 pointer-events-none"
                  />
                )}
              </AnimatePresence>
              
              {/* Overlay Text */}
              {isStreaming && (
                <div className="absolute top-6 right-6 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-red-500/50 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-mono text-white font-semibold">REC STREAM</span>
                </div>
              )}
            </div>

            {/* Sidebar Controls & Stream Logs */}
            <div className="w-full md:w-80 bg-surface border-l border-border/50 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-surface/50">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Camera className="w-5 h-5 text-accent" />
                  Live Vision
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition text-gray-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-black/20 flex flex-col gap-2">
                {isStreaming ? (
                  streamObservations.length > 0 ? (
                    streamObservations.map((obs, idx) => (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={idx} className="text-xs text-emerald-400 font-mono bg-black/40 p-2 rounded border border-emerald-900/30">
                        {obs}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-xs text-muted flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Connecting stream...</div>
                  )
                ) : (
                  <div className="text-sm text-muted text-center mt-10">
                    <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Start the Continuous Stream to allow Companion AI to monitor your camera in real-time.
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-border/50 flex flex-col gap-2">
                <button 
                  onClick={toggleStreaming}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-lg text-white ${
                    isStreaming 
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                      : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'
                  }`}
                >
                  {isStreaming ? (
                    <>
                      <StopCircle className="w-5 h-5" /> Stop Stream
                    </>
                  ) : (
                    <>
                      <Radio className="w-5 h-5 animate-pulse" /> Start Live Stream
                    </>
                  )}
                </button>

                <button 
                  onClick={captureAndAnalyze}
                  disabled={isAnalyzing || isStreaming}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all bg-surface hover:bg-white/5 border border-border text-white disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                  Snapshot to Chat
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
