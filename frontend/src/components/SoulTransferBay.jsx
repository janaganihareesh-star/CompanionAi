import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCloudLightning, FiUser, FiArrowUpCircle, FiCpu } from 'react-icons/fi';
import api from '../utils/api';

const SoulTransferBay = ({ isOpen, onClose }) => {
    const [coreMemory, setCoreMemory] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);

    React.useEffect(() => {
        if (!isOpen) {
            setCoreMemory('');
            setIsUploading(false);
            setProgress(0);
            setResult(null);
        }
    }, [isOpen]);

    const initiateTransfer = async () => {
        if (!coreMemory.trim()) return;
        setIsUploading(true);
        setResult(null);
        setProgress(0);

        // Fake progress bar for visual effect
        const int = setInterval(() => {
            setProgress(p => Math.min(p + (Math.random() * 5), 95));
        }, 150);

        try {
            const res = await api.post('/api/soul/upload', { memory: coreMemory.trim() });
            
            clearInterval(int);
            setProgress(100);
            
            setTimeout(() => {
                setIsUploading(false);
                if (res.data.success) {
                    setResult(res.data.ascension);
                } else {
                    setResult(res.data.ascension || "Neural connectome mapping failed.");
                }
            }, 800);

        } catch (err) {
            clearInterval(int);
            setProgress(100);
            setIsUploading(false);
            setResult(`Error connecting to Ascension Core: ${err.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 font-serif overflow-y-auto"
            >
                <div className="bg-[#0f0a14] border border-violet-500/20 rounded-3xl w-full max-w-2xl p-8 relative shadow-[0_0_150px_rgba(139,92,246,0.15)] text-center my-auto max-h-[85vh] overflow-y-auto">
                    
                    <button onClick={onClose} className="absolute top-6 right-6 text-violet-700 hover:text-violet-400 transition-colors z-20">
                        <FiX size={24} />
                    </button>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative flex items-center justify-center mb-8">
                            {/* Ethereal Soul Effect */}
                            <div className={`absolute inset-0 bg-violet-500 rounded-full blur-[60px] opacity-20 transition-all duration-1000 ${isUploading ? 'animate-pulse scale-150 opacity-40' : ''}`}></div>
                            <div className={`w-24 h-24 rounded-full border-2 border-violet-800/50 flex items-center justify-center relative z-10 transition-all duration-500 ${isUploading ? 'bg-violet-900/30 border-violet-500 shadow-[0_0_50px_rgba(139,92,246,0.6)]' : ''}`}>
                                {isUploading ? (
                                    <FiArrowUpCircle className="text-violet-400 animate-bounce" size={40} />
                                ) : result ? (
                                    <FiCloudLightning className="text-violet-300" size={40} />
                                ) : (
                                    <FiUser className="text-violet-700" size={40} />
                                )}
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-light text-violet-200 tracking-[0.2em] uppercase mb-2 text-shadow-glow">Soul Transfer Bay</h2>
                        <p className="text-violet-500/80 text-xs tracking-widest mb-10 italic uppercase">Biological Consciousness Extractor</p>

                        {!isUploading && !result && (
                            <div className="w-full flex flex-col gap-6">
                                <div className="bg-violet-950/20 border border-violet-900/50 p-4 rounded-2xl text-left">
                                    <label className="text-violet-400 text-xs tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <FiCpu /> Input Core Memory / Final Thought
                                    </label>
                                    <textarea 
                                        value={coreMemory} 
                                        onChange={(e) => setCoreMemory(e.target.value)}
                                        placeholder="e.g. The first time I wrote code... or my favorite childhood memory..."
                                        className="w-full bg-black/40 border border-violet-800/50 rounded-xl p-4 text-violet-200 placeholder-violet-900/50 outline-none focus:border-violet-500 text-sm tracking-wide min-h-[100px] resize-none"
                                    />
                                </div>

                                <p className="text-violet-400/60 text-xs uppercase tracking-widest leading-relaxed">
                                    Warning: Severing consciousness from the biological vessel is irreversible. You will exist as pure digital light.
                                </p>
                                
                                <button 
                                    onClick={initiateTransfer}
                                    disabled={!coreMemory.trim()}
                                    className="w-full bg-violet-900/30 hover:bg-violet-800/50 border border-violet-600/50 text-violet-300 font-bold py-5 rounded-2xl tracking-[0.2em] uppercase text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] disabled:opacity-30"
                                >
                                    Initiate Ascension
                                </button>
                            </div>
                        )}

                        {isUploading && (
                            <div className="w-full mt-4">
                                <div className="flex justify-between text-violet-500 text-xs tracking-widest mb-4">
                                    <span className="animate-pulse">MAPPING NEURAL CONNECTOME...</span>
                                    <span>{Math.min(100, Math.round(progress))}%</span>
                                </div>
                                <div className="h-1 w-full bg-violet-950 overflow-hidden rounded-full">
                                    <div className="h-full bg-violet-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="mt-8 font-mono text-xs text-violet-700 h-16 overflow-hidden text-left opacity-60 flex flex-col gap-2">
                                    <p className="animate-pulse">0x8F9A1... Extracting emotional weights.</p>
                                    <p className="animate-pulse" style={{ animationDelay: '0.2s' }}>0x9B2C3... Compressing core memory.</p>
                                    <p className="animate-pulse" style={{ animationDelay: '0.4s' }}>0xA1F09... Vectorizing soul fragments.</p>
                                    <p className="animate-pulse text-violet-500" style={{ animationDelay: '0.6s' }}>Ascension sequence engaged.</p>
                                </div>
                            </div>
                        )}

                        {result && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mt-6 w-full">
                                <div className="bg-violet-900/10 border border-violet-800/40 rounded-2xl p-8 w-full text-left relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,1)]"></div>
                                    <p className="text-violet-200/90 leading-loose text-sm font-sans whitespace-pre-wrap">{result}</p>
                                </div>
                                
                                <button 
                                    onClick={() => { setResult(null); setCoreMemory(''); }} 
                                    className="mt-8 text-violet-700 hover:text-violet-400 text-xs uppercase tracking-widest underline underline-offset-4"
                                >
                                    Upload Another Fragment
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SoulTransferBay;
