import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGlobe, FiDatabase, FiSearch } from 'react-icons/fi';
import api from '../utils/api';

const UniverseSandbox = ({ isOpen, onClose }) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // New Interactive State
    const [cosmicQuery, setCosmicQuery] = useState('');
    const [isBending, setIsBending] = useState(false);
    const [simulationResult, setSimulationResult] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setCosmicQuery('');
            setIsBending(false);
            setSimulationResult(null);
            setIsSimulating(false);
            setIsLoaded(false);
        }
    }, [isOpen]);

    const initUniverse = () => {
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
            setIsLoaded(true);
        }, 5000);
    };

    const runCosmicSimulation = async () => {
        if (!cosmicQuery.trim()) return;
        setIsBending(true);
        setSimulationResult(null);

        try {
            const res = await api.post('/api/universe/simulate', { query: cosmicQuery.trim() });
            
            setIsBending(false);
            if (res.data.success) {
                setSimulationResult(res.data.simulation);
            } else {
                setSimulationResult(res.data.simulation || "Simulation matrix crashed.");
            }
        } catch (err) {
            setIsBending(false);
            setSimulationResult(`Error connecting to Cosmic Engine: ${err.message}`);
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
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black p-4 font-mono overflow-y-auto"
            >
                {/* Simulated Starfield Background */}
                <div className="fixed inset-0 pointer-events-none opacity-50" style={{
                    backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
                    backgroundSize: '100px 100px',
                    backgroundPosition: '0 0, 50px 50px'
                }}></div>

                <div className="bg-black/80 border border-indigo-500/30 w-full max-w-3xl min-h-[70vh] flex flex-col relative shadow-[0_0_150px_rgba(79,70,229,0.2)] my-auto max-h-[85vh] overflow-y-auto z-10 rounded-3xl">
                    
                    <div className="flex items-center justify-between p-4 border-b border-indigo-900/50 bg-black z-20 sticky top-0">
                        <div className="flex items-center gap-3">
                            <FiGlobe className="text-indigo-500" size={24} />
                            <h2 className="text-lg font-bold text-white tracking-[0.2em] uppercase">1:1 Universe Simulation Matrix</h2>
                        </div>
                        <button onClick={onClose} className="text-indigo-600 hover:text-indigo-400 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="flex-1 relative flex flex-col items-center justify-center p-6 min-h-[60vh]">
                        {!isSimulating && !isLoaded && (
                            <div className="text-center z-10 p-8 bg-black/50 backdrop-blur-md border border-indigo-900/30 rounded-2xl max-w-md">
                                <FiDatabase size={48} className="text-indigo-600 mx-auto mb-6" />
                                <h3 className="text-white text-xl mb-2">Hyper-Dimensional RAM Required</h3>
                                <p className="text-indigo-400/70 text-xs mb-8">Earth's physical storage is insufficient to load 10^80 atoms. Requesting 11th-dimensional manifold bypass.</p>
                                <button 
                                    onClick={initUniverse}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded tracking-[0.2em] uppercase text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                                >
                                    Bypass Limits & Load Universe
                                </button>
                            </div>
                        )}

                        {isSimulating && (
                            <div className="text-center z-10">
                                <div className="w-32 h-32 mx-auto mb-8 relative">
                                    <div className="absolute inset-0 border-4 border-t-indigo-500 border-indigo-900 rounded-full animate-spin"></div>
                                    <div className="absolute inset-4 border-2 border-b-indigo-400 border-transparent rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
                                </div>
                                <div className="text-indigo-400 tracking-[0.3em] text-sm animate-pulse">
                                    COMPRESSING 13.8 BILLION YEARS OF DATA...
                                </div>
                                <div className="text-indigo-600/50 text-xs mt-4">Storing in 11-D Space Fold</div>
                            </div>
                        )}

                        {isLoaded && (
                            <div className="w-full h-full flex flex-col items-center justify-center z-10">
                                {/* Visual representation of the loaded universe */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className={`w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,_#4f46e5_0%,_transparent_70%)] transition-all duration-1000 ${isBending ? 'opacity-50 scale-125 animate-pulse' : 'opacity-20'}`}></div>
                                </div>
                                
                                <div className="z-20 w-full max-w-2xl bg-black/60 border border-indigo-500/30 p-8 rounded-3xl backdrop-blur-md">
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-white tracking-[0.2em] mb-2">UNIVERSE LOADED</h3>
                                        <div className="mt-2 text-green-500 text-xs flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                            SIMULATION RUNNING FLAWLESSLY
                                        </div>
                                    </div>

                                    {!isBending && !simulationResult && (
                                        <div className="w-full flex flex-col gap-4">
                                            <div className="relative">
                                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                                                <input 
                                                    type="text" 
                                                    value={cosmicQuery} 
                                                    onChange={(e) => setCosmicQuery(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && runCosmicSimulation()}
                                                    placeholder="Query the Cosmos (e.g. Simulate Mars, What is a Black hole?)"
                                                    className="w-full bg-indigo-950/20 border border-indigo-800 rounded-2xl py-4 pl-12 pr-4 text-indigo-100 placeholder-indigo-900/80 outline-none focus:border-indigo-500 text-center text-sm tracking-wide"
                                                />
                                            </div>
                                            <button 
                                                onClick={runCosmicSimulation}
                                                disabled={!cosmicQuery.trim()}
                                                className="w-full bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-600/50 text-indigo-300 font-bold py-4 rounded-2xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] disabled:opacity-30 text-sm"
                                            >
                                                Run Cosmic Simulation
                                            </button>
                                        </div>
                                    )}

                                    {isBending && (
                                        <div className="text-indigo-400 tracking-[0.3em] uppercase text-sm animate-pulse flex flex-col items-center gap-4 py-8">
                                            <div className="w-16 h-16 relative">
                                                <div className="absolute inset-0 border-2 border-dashed border-indigo-500 rounded-full animate-[spin_1s_linear_infinite]"></div>
                                                <div className="absolute inset-2 bg-indigo-600/30 rounded-full animate-ping"></div>
                                            </div>
                                            BENDING SPACETIME...
                                        </div>
                                    )}

                                    {simulationResult && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center w-full mt-4">
                                            <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-2xl p-6 w-full text-left relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,1)]"></div>
                                                <h3 className="text-indigo-400 font-bold mb-4 uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                                                    <FiGlobe /> Simulation Result
                                                </h3>
                                                <p className="text-indigo-100/90 leading-relaxed text-sm font-sans whitespace-pre-wrap">{simulationResult}</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => { setSimulationResult(null); setCosmicQuery(''); }} 
                                                className="mt-8 text-indigo-600 hover:text-indigo-400 text-xs uppercase tracking-widest underline underline-offset-4"
                                            >
                                                Run New Simulation
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UniverseSandbox;
