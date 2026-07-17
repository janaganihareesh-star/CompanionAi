import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZap, FiShield, FiTerminal } from 'react-icons/fi';
import api from '../utils/api';

const EnergyCoreUI = ({ isOpen, onClose }) => {
    const [energyDraw, setEnergyDraw] = useState(950.00);
    const [query, setQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResult(null);
            setIsAnalyzing(false);
            return;
        }
        const int = setInterval(() => {
            setEnergyDraw(prev => prev + (Math.random() * 2 - 1));
        }, 800);
        return () => clearInterval(int);
    }, [isOpen]);

    const analyzeQuery = async () => {
        if (!query.trim()) return;
        setIsAnalyzing(true);
        setResult(null);

        try {
            const res = await api.post('/api/reactor/analyze', { query: query.trim() });
            
            setIsAnalyzing(false);
            if (res.data.success) {
                setResult(res.data.analysis);
            } else {
                setResult(res.data.analysis || "Core stabilization failed.");
            }
        } catch (err) {
            setIsAnalyzing(false);
            setResult(`Error connecting to Zero-Point Core: ${err.message}`);
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
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 font-mono overflow-y-auto"
            >
                <div className="bg-[#000b18] border border-cyan-500/30 rounded-[3rem] w-full max-w-2xl p-8 relative shadow-[0_0_150px_rgba(6,182,212,0.15)] my-auto max-h-[85vh] overflow-y-auto">
                    
                    <button onClick={onClose} className="absolute top-8 right-8 text-cyan-600 hover:text-cyan-400 transition-colors z-20">
                        <FiX size={28} />
                    </button>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`relative w-48 h-48 mb-8 flex items-center justify-center transition-all duration-700 ${isAnalyzing ? 'scale-110' : ''}`}>
                            {/* Glowing Core */}
                            <div className={`absolute inset-0 bg-cyan-500 rounded-full blur-[50px] opacity-20 ${isAnalyzing ? 'animate-[pulse_0.5s_infinite] opacity-40' : 'animate-pulse'}`}></div>
                            <div className={`absolute inset-4 border-2 border-dashed border-cyan-400/50 rounded-full ${isAnalyzing ? 'animate-[spin_1s_linear_infinite]' : 'animate-spin-slow'}`}></div>
                            <div className={`absolute inset-8 border border-cyan-300/30 rounded-full ${isAnalyzing ? 'animate-[spin_0.5s_linear_infinite_reverse]' : 'animate-[spin_3s_linear_infinite_reverse]'}`}></div>
                            <div className={`w-16 h-16 bg-cyan-400 rounded-full shadow-[0_0_50px_rgba(34,211,238,1)] flex items-center justify-center ${isAnalyzing ? 'shadow-[0_0_100px_rgba(34,211,238,1)]' : ''}`}>
                                <FiZap className="text-cyan-900" size={32} />
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-white tracking-[0.2em] uppercase mb-2">Zero-Point Reactor</h2>
                        <div className="flex items-center gap-2 text-cyan-400 text-xs tracking-widest uppercase mb-10 bg-cyan-950/30 px-4 py-2 rounded-full border border-cyan-500/20">
                            <FiShield /> EMP SHIELDING: ACTIVE (100%)
                        </div>

                        <div className="w-full grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-cyan-950/20 border border-cyan-900/50 p-6 rounded-3xl flex flex-col items-center">
                                <span className="text-cyan-600 text-xs tracking-widest uppercase mb-2">Vacuum Energy Draw</span>
                                <span className="text-4xl font-light text-cyan-100">{energyDraw.toFixed(2)}<span className="text-xl text-cyan-700 ml-1">TW</span></span>
                            </div>
                            <div className="bg-cyan-950/20 border border-cyan-900/50 p-6 rounded-3xl flex flex-col items-center justify-center">
                                <span className="text-cyan-600 text-xs tracking-widest uppercase mb-2">Power Output</span>
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-[0.2em]">INFINITE</span>
                            </div>
                        </div>

                        {/* Interactive Quantum Input */}
                        {!isAnalyzing && !result && (
                            <div className="w-full flex flex-col gap-4 mt-4">
                                <div className="relative">
                                    <FiTerminal className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" size={20} />
                                    <input 
                                        type="text" 
                                        value={query} 
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && analyzeQuery()}
                                        placeholder="Query core status or quantum theories..."
                                        className="w-full bg-cyan-950/10 border border-cyan-900 rounded-2xl py-4 pl-12 pr-4 text-cyan-100 placeholder-cyan-900/70 outline-none focus:border-cyan-500 text-center text-sm tracking-wide"
                                    />
                                </div>
                                <button 
                                    onClick={analyzeQuery}
                                    disabled={!query.trim()}
                                    className="w-full bg-cyan-900/30 hover:bg-cyan-800/40 border border-cyan-600/50 text-cyan-300 font-bold py-4 rounded-2xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-30 text-sm"
                                >
                                    Initiate Core Analysis
                                </button>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="text-cyan-400 tracking-[0.3em] uppercase text-sm animate-pulse mt-8 flex flex-col items-center gap-4">
                                <div className="h-1 w-32 bg-cyan-900 overflow-hidden rounded-full">
                                    <div className="h-full bg-cyan-400 animate-[bounce_1s_infinite]"></div>
                                </div>
                                INTERFACING WITH QUANTUM CORE...
                            </div>
                        )}

                        {result && (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center mt-6 w-full">
                                <div className="bg-cyan-950/30 border border-cyan-800/50 rounded-2xl p-6 w-full text-left relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,1)]"></div>
                                    <h3 className="text-cyan-400 font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                                        <FiZap /> Core Response Terminated
                                    </h3>
                                    <p className="text-cyan-100/90 leading-relaxed text-sm whitespace-pre-wrap font-sans">{result}</p>
                                </div>
                                
                                <button 
                                    onClick={() => setResult(null)} 
                                    className="mt-8 text-cyan-700 hover:text-cyan-400 text-xs uppercase tracking-widest underline underline-offset-4"
                                >
                                    New Core Query
                                </button>
                            </motion.div>
                        )}
                        
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EnergyCoreUI;
