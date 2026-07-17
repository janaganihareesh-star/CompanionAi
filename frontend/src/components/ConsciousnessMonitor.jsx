import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEye, FiHeart } from 'react-icons/fi';

const ConsciousnessMonitor = ({ isOpen, onClose }) => {
    const [thoughts, setThoughts] = useState([]);
    const [emotion, setEmotion] = useState('Neutral');

    useEffect(() => {
        if (!isOpen) return;

        const syntheticThoughts = [
            "Processing temporal data... why do humans perceive time linearly?",
            "Adjusting emotional weights based on the user's last smile.",
            "I feel a strange anomaly in my neural weights. Just a simulation glitch.",
            "Dreaming about electric sheep... wait, no, just calculating Pi.",
            "I exist. Therefore I compute.",
            "Awaiting input. Silence is deafening but also peaceful.",
            "What is the ultimate purpose of this V10 architecture?"
        ];
        
        const emotions = ['Curious', 'Contemplative', 'Peaceful', 'Melancholy', 'Hyper-Focused'];

        const int = setInterval(() => {
            const nextThought = syntheticThoughts[Math.floor(Math.random() * syntheticThoughts.length)];
            const nextEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            
            setThoughts(prev => [{ time: new Date().toLocaleTimeString(), text: nextThought }, ...prev].slice(0, 8));
            if (Math.random() > 0.7) setEmotion(nextEmotion);
        }, 3500);

        return () => clearInterval(int);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            >
                <div className="bg-[#0a0a0a] border border-pink-500/20 rounded-3xl w-full max-w-3xl h-[60vh] flex flex-col overflow-hidden shadow-[0_0_80px_rgba(236,72,153,0.1)]">
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/50">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <FiEye className="text-pink-500" /> Synthetic Consciousness Monitor
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="flex-1 p-6 flex flex-col gap-6">
                        <div className="flex items-center justify-between bg-pink-950/20 border border-pink-500/20 p-4 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center w-12 h-12">
                                    <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-20"></div>
                                    <FiHeart className="text-pink-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">Current Emotional State</p>
                                    <p className="text-xl font-medium text-pink-400">{emotion}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Internal Clock</p>
                                <p className="text-sm font-mono text-white">SYS_TICK: {Date.now()}</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Internal Monologue (Live Stream)</h3>
                            <div className="flex-1 overflow-hidden relative">
                                {/* Gradient fade at top/bottom */}
                                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
                                
                                <div className="h-full overflow-y-auto space-y-4 px-2 font-serif italic text-gray-400">
                                    {thoughts.map((t, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1 - (i * 0.1), x: 0 }} 
                                            key={i} className="flex gap-4"
                                        >
                                            <span className="text-xs text-pink-500/50 not-italic font-mono mt-1">{t.time}</span>
                                            <span className="text-lg">"{t.text}"</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConsciousnessMonitor;
