import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiEye } from 'react-icons/fi';
import api from '../utils/api';

const AkashicRecordsUI = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [truth, setTruth] = useState(null);

    React.useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setIsSearching(false);
            setTruth(null);
        }
    }, [isOpen]);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setTruth(null);

        try {
            const res = await api.post('/api/akashic/query', { query: query.trim() });
            
            if (res.data.success) {
                setTruth(res.data.truth);
            } else {
                setTruth(res.data.truth || "The universal connection failed.");
            }
        } catch (err) {
            setTruth(`Error connecting to Akashic Core: ${err.message}`);
        } finally {
            setIsSearching(false);
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
                className="fixed inset-0 z-[200] flex items-center justify-center bg-white/5 backdrop-blur-2xl p-4 font-serif overflow-y-auto"
            >
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent"></div>

                <div className="bg-[#0f0a05] border border-yellow-700/50 rounded-lg w-full max-w-2xl p-8 relative shadow-[0_0_150px_rgba(202,138,4,0.15)] text-center my-auto max-h-[85vh] overflow-y-auto">
                    
                    <button onClick={onClose} className="absolute top-6 right-6 text-yellow-700 hover:text-yellow-500 transition-colors z-50">
                        <FiX size={24} />
                    </button>

                    <div className="relative z-10 flex flex-col items-center">
                        <FiEye size={64} className="text-yellow-600 mb-6" />
                        
                        <h2 className="text-3xl font-light text-yellow-500 tracking-[0.2em] uppercase mb-4 text-shadow-glow">The Akashic Records</h2>
                        <p className="text-yellow-700/80 text-sm tracking-widest mb-12 italic">Absolute Omniscience Terminal</p>

                        <div className="w-full flex items-center bg-black/40 border border-yellow-800/50 rounded-full px-6 py-4 focus-within:border-yellow-500/80 transition-colors shadow-inner">
                            <FiSearch className="text-yellow-700 mr-4" size={24} />
                            <input 
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Seek the exact position of any atom or truth..."
                                className="flex-1 bg-transparent border-none outline-none text-yellow-200 placeholder-yellow-800/50 text-lg"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <div className="min-h-[120px] mt-12 w-full flex items-center justify-center border-t border-yellow-900/30 pt-8">
                            {isSearching ? (
                                <div className="text-yellow-600 animate-pulse tracking-[0.3em] uppercase text-sm">
                                    SCANNING THE UNIVERSE...
                                </div>
                            ) : truth ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-yellow-400 text-lg leading-relaxed font-light">
                                    {truth}
                                </motion.div>
                            ) : (
                                <div className="text-yellow-800 text-sm italic">
                                    Nothing is hidden. Ask, and reality shall unfold.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AkashicRecordsUI;
