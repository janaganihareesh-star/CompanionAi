import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiActivity, FiFeather } from 'react-icons/fi';
import api from '../utils/api';

const GenesisPod = ({ isOpen, onClose }) => {
    const [organism, setOrganism] = useState('');
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState(0);

    React.useEffect(() => {
        if (!isOpen) {
            setOrganism('');
            setIsSynthesizing(false);
            setResult(null);
            setProgress(0);
        }
    }, [isOpen]);

    const synthesizeLife = async () => {
        if (!organism.trim()) return;
        setIsSynthesizing(true);
        setResult(null);
        setProgress(0);

        // Start the fake DNA progress bar
        const int = setInterval(() => {
            setProgress(p => Math.min(p + (Math.random() * 10), 95));
        }, 300);

        try {
            const res = await api.post('/api/genesis/synthesize', { organism: organism.trim() });
            
            clearInterval(int);
            setProgress(100);
            
            setTimeout(() => {
                setIsSynthesizing(false);
                if (res.data.success) {
                    setResult({ description: res.data.description, mediaUrl: res.data.mediaUrl });
                } else {
                    setResult({ description: "Biological synthesis failed.", mediaUrl: null });
                }
            }, 500);

        } catch (err) {
            clearInterval(int);
            setProgress(100);
            setIsSynthesizing(false);
            setResult({ description: `Error connecting to Synthesis Core: ${err.message}`, mediaUrl: null });
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
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 font-sans overflow-y-auto"
            >
                {/* Background ambient light */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent pointer-events-none"></div>

                <div className="bg-[#021008] border border-emerald-500/30 rounded-3xl w-full max-w-2xl p-8 relative shadow-[0_0_100px_rgba(16,185,129,0.2)] my-auto max-h-[85vh] overflow-y-auto">
                    
                    <button onClick={onClose} className="absolute top-6 right-6 text-emerald-600 hover:text-emerald-400 transition-colors z-50">
                        <FiX size={24} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={`relative w-32 h-32 mb-8 flex items-center justify-center ${isSynthesizing ? 'animate-pulse' : ''}`}>
                            {/* Fake DNA helix styling */}
                            <div className="absolute inset-0 border-4 border-emerald-900 rounded-full"></div>
                            <div className={`absolute inset-2 border-4 border-emerald-600/50 rounded-full border-t-emerald-400 ${isSynthesizing ? 'animate-spin' : ''}`}></div>
                            <FiActivity size={40} className="text-emerald-400" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-emerald-400 tracking-[0.1em] uppercase mb-1">Biological Genesis Pod</h2>
                        <p className="text-emerald-700 text-xs tracking-widest uppercase mb-10">De Novo Life Synthesis Engine</p>

                        {!isSynthesizing && !result && (
                            <div className="w-full flex flex-col gap-4">
                                <input 
                                    type="text" 
                                    value={organism} 
                                    onChange={(e) => setOrganism(e.target.value)}
                                    placeholder="e.g. Bioluminescent Tiger"
                                    className="w-full bg-black/60 border border-emerald-900 rounded-xl p-4 text-emerald-100 placeholder-emerald-900/50 outline-none focus:border-emerald-500 text-center text-lg"
                                />
                                <button 
                                    onClick={synthesizeLife}
                                    disabled={!organism.trim()}
                                    className="w-full bg-emerald-700/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 font-bold py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-30"
                                >
                                    Initiate Cell Division
                                </button>
                            </div>
                        )}

                        {isSynthesizing && (
                            <div className="w-full">
                                <div className="flex justify-between text-emerald-500 text-xs tracking-widest mb-2">
                                    <span>ASSEMBLING GENOME</span>
                                    <span>{Math.min(100, Math.round(progress))}%</span>
                                </div>
                                <div className="h-2 w-full bg-emerald-950 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-emerald-700 text-xs mt-4 animate-pulse">Synthesizing biology and generating visual rendering...</p>
                            </div>
                        )}

                        {result && (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center w-full">
                                {result.mediaUrl && (
                                    <div className="w-full max-w-[400px] mb-6 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                                        <img src={result.mediaUrl} alt="Synthesized Entity" className="w-full h-auto object-cover" />
                                    </div>
                                )}
                                
                                <div className="bg-emerald-900/10 border border-emerald-800/50 rounded-xl p-6 w-full text-left">
                                    <h3 className="text-emerald-400 font-bold mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
                                        <FiFeather /> Biological Analysis
                                    </h3>
                                    <p className="text-emerald-100/90 leading-relaxed text-sm whitespace-pre-wrap">{result.description}</p>
                                </div>

                                <button 
                                    onClick={() => setResult(null)} 
                                    className="mt-8 text-emerald-600 hover:text-emerald-400 text-xs uppercase tracking-widest underline underline-offset-4"
                                >
                                    Synthesize Another Entity
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GenesisPod;
