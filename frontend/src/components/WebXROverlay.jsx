import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMonitor } from 'react-icons/fi';

const WebXROverlay = ({ isOpen, onClose }) => {
    const [isXREnabled, setIsXREnabled] = useState(false);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
            >
                <div className="absolute top-6 right-6">
                    <button onClick={onClose} className="text-white/50 hover:text-white bg-white/10 p-3 rounded-full transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="text-center flex flex-col items-center">
                    <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/50 mb-8 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                        <FiMonitor size={48} className="text-blue-400" />
                    </div>
                    
                    <h1 className="text-4xl font-bold text-white mb-4">Spatial Computing Ready</h1>
                    <p className="text-xl text-gray-400 max-w-lg mb-8">
                        Closer-AI supports WebXR. Connect your Meta Quest, Apple Vision Pro, or compatible AR glasses to experience your AI companion in 3D space.
                    </p>

                    <button 
                        onClick={() => setIsXREnabled(true)}
                        className="bg-white text-black font-semibold text-lg px-8 py-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
                    >
                        {isXREnabled ? 'Looking for Headset...' : 'Enter Immersive Mode'}
                    </button>

                    {isXREnabled && (
                        <p className="text-blue-400 mt-6 animate-pulse">
                            Awaiting WebXR device connection on <strong>navigator.xr</strong>...
                        </p>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WebXROverlay;
