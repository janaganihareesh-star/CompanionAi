import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiActivity, FiWifi } from 'react-icons/fi';

const NeuralLinkOverlay = ({ isOpen, onClose }) => {
    const [thought, setThought] = useState('');
    const [waveData, setWaveData] = useState(Array(20).fill(50));
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let interval;
        if (isOpen) {
            // Simulate connection
            setTimeout(() => setIsConnected(true), 2000);
            
            // Simulate brainwaves
            interval = setInterval(() => {
                setWaveData(prev => [...prev.slice(1), 50 + (Math.random() * 40 - 20)]);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isOpen]);

    const decodeThought = () => {
        setThought('Processing neural spikes...');
        setTimeout(() => {
            setThought('I want to deploy the V10 upgrades to production.');
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4"
            >
                <div className="absolute top-6 right-6">
                    <button onClick={onClose} className="text-white/50 hover:text-white bg-white/10 p-3 rounded-full transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="text-center max-w-2xl w-full">
                    <div className="flex items-center justify-center mb-8 relative">
                        <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${isConnected ? 'bg-cyan-500' : 'bg-red-500'} transition-colors duration-1000`}></div>
                        <FiActivity size={64} className={`${isConnected ? 'text-cyan-400' : 'text-red-500 animate-pulse'}`} />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2 tracking-widest uppercase">Direct Neural Interface</h2>
                    <p className={`text-sm tracking-widest uppercase mb-8 flex items-center justify-center gap-2 ${isConnected ? 'text-cyan-400' : 'text-red-500'}`}>
                        <FiWifi /> {isConnected ? 'LINK ESTABLISHED - BANDWIDTH: 4.2 Gbps' : 'SEARCHING FOR CORTICAL IMPLANT...'}
                    </p>

                    {/* Brainwave Visualization */}
                    <div className="h-32 w-full bg-cyan-950/20 border border-cyan-500/20 rounded-xl mb-8 flex items-end overflow-hidden p-2 gap-1 relative">
                        {/* Scanline overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
                        {waveData.map((val, i) => (
                            <div key={i} className="flex-1 bg-cyan-500/50 rounded-t-sm transition-all duration-75" style={{ height: `${val}%` }}></div>
                        ))}
                    </div>

                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 min-h-[120px] flex items-center justify-center shadow-inner">
                        {thought ? (
                            <p className="text-xl font-mono text-white typing-effect">{thought}</p>
                        ) : (
                            <p className="text-gray-500 font-mono">Awaiting conscious intent...</p>
                        )}
                    </div>

                    <button 
                        onClick={decodeThought}
                        disabled={!isConnected}
                        className="mt-8 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-full tracking-widest uppercase text-sm shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all"
                    >
                        Force Manual Decode
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NeuralLinkOverlay;
