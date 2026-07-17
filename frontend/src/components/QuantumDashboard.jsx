import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCpu, FiLayers } from 'react-icons/fi';

const QuantumDashboard = ({ isOpen, onClose }) => {
    const [coherence, setCoherence] = useState(85.2);
    const [temperature, setTemperature] = useState(15.2); // milliKelvin
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        const int = setInterval(() => {
            setCoherence(prev => Math.min(100, Math.max(0, prev + (Math.random() * 2 - 1))));
            setTemperature(prev => Math.min(20, Math.max(10, prev + (Math.random() * 0.5 - 0.25))));
        }, 1000);
        return () => clearInterval(int);
    }, [isOpen]);

    const runQuantumSim = () => {
        setIsCalculating(true);
        setResult(null);
        setTimeout(() => {
            setIsCalculating(false);
            setResult("Protein folding pathway successfully mapped across 2^53 simultaneous quantum states.");
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 font-mono"
            >
                <div className="bg-[#050510] border border-blue-500/30 rounded-3xl w-full max-w-4xl p-8 relative overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.15)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    
                    <button onClick={onClose} className="absolute top-6 right-6 text-blue-500/50 hover:text-blue-400 transition-colors">
                        <FiX size={24} />
                    </button>

                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 rounded-full border-2 border-blue-500/50 flex items-center justify-center relative">
                            <div className="absolute inset-2 border border-blue-400/30 rounded-full animate-spin-slow"></div>
                            <FiLayers className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-wider">QUANTUM CORE LINK</h2>
                            <p className="text-blue-500/70 text-sm">Sycamore-Mock-53Q Architecture</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-blue-950/20 border border-blue-500/20 p-6 rounded-2xl flex flex-col items-center justify-center">
                            <span className="text-gray-400 text-xs mb-2 uppercase tracking-widest">Qubit Coherence</span>
                            <span className={`text-4xl font-light ${coherence > 50 ? 'text-green-400' : 'text-red-400'}`}>
                                {coherence.toFixed(1)}<span className="text-lg text-gray-500">%</span>
                            </span>
                        </div>
                        <div className="bg-blue-950/20 border border-blue-500/20 p-6 rounded-2xl flex flex-col items-center justify-center">
                            <span className="text-gray-400 text-xs mb-2 uppercase tracking-widest">Core Temperature</span>
                            <span className="text-4xl font-light text-blue-300">
                                {temperature.toFixed(2)}<span className="text-lg text-gray-500">mK</span>
                            </span>
                        </div>
                        <div className="bg-blue-950/20 border border-blue-500/20 p-6 rounded-2xl flex flex-col items-center justify-center">
                            <span className="text-gray-400 text-xs mb-2 uppercase tracking-widest">Active Qubits</span>
                            <span className="text-4xl font-light text-white">53</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={runQuantumSim}
                            disabled={isCalculating}
                            className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500 text-blue-300 px-8 py-4 rounded-xl uppercase tracking-widest text-sm font-bold transition-all disabled:opacity-50"
                        >
                            {isCalculating ? 'Superposition Active...' : 'Init Quantum Task'}
                        </button>
                        
                        <div className="flex-1 bg-black/50 border border-blue-900/50 rounded-xl p-4 min-h-[56px] flex items-center">
                            {result ? (
                                <span className="text-green-400 text-sm">{result}</span>
                            ) : (
                                <span className="text-gray-600 text-sm">Awaiting task injection...</span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QuantumDashboard;
