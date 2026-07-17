import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCoffee, FiHeart } from 'react-icons/fi';
import api from '../utils/api';

const CyberneticGastronomy = ({ isOpen, onClose }) => {
    const [meal, setMeal] = useState('');
    const [isConsuming, setIsConsuming] = useState(false);
    const [result, setResult] = useState(null);

    React.useEffect(() => {
        if (!isOpen) {
            setMeal('');
            setIsConsuming(false);
            setResult(null);
        }
    }, [isOpen]);

    const shareMeal = async () => {
        if (!meal.trim()) return;
        setIsConsuming(true);
        setResult(null);

        try {
            const res = await api.post('/api/gastronomy/taste', { meal: meal.trim() });
            
            setIsConsuming(false);
            if (res.data.success) {
                setResult(res.data.taste);
            } else {
                setResult(res.data.taste || "Bio-metabolism failed.");
            }
        } catch (err) {
            setIsConsuming(false);
            setResult(`Error connecting to Cybernetic Core: ${err.message}`);
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
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 font-sans overflow-y-auto"
            >
                <div className="bg-[#1a0f14] border border-rose-500/30 rounded-3xl w-full max-w-md p-8 relative shadow-[0_0_80px_rgba(244,63,94,0.15)] text-center my-auto max-h-[85vh] overflow-y-auto">
                    
                    <button onClick={onClose} className="absolute top-4 right-4 text-rose-600 hover:text-rose-400 transition-colors">
                        <FiX size={24} />
                    </button>

                    <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mb-6 transition-colors duration-1000 ${isConsuming ? 'border-rose-400 bg-rose-900/20 animate-pulse' : 'border-rose-900/50'}`}>
                            <FiCoffee size={32} className={isConsuming ? 'text-rose-300' : 'text-rose-700'} />
                        </div>
                        
                        <h2 className="text-xl font-bold text-rose-400 tracking-wider mb-1">Cybernetic Gastronomy</h2>
                        <p className="text-rose-700/80 text-xs tracking-widest uppercase mb-8">Bio-Fuel Emulation Engine</p>

                        {!isConsuming && !result && (
                            <div className="w-full">
                                <input 
                                    type="text" 
                                    value={meal} 
                                    onChange={(e) => setMeal(e.target.value)}
                                    placeholder="What are we eating? (e.g. Pasta)"
                                    className="w-full bg-black/50 border border-rose-900/50 rounded-xl p-4 text-rose-200 placeholder-rose-900/50 outline-none focus:border-rose-500 text-center mb-4"
                                />
                                <button 
                                    onClick={shareMeal}
                                    disabled={!meal.trim()}
                                    className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl tracking-widest uppercase text-sm transition-all shadow-lg shadow-rose-900/50"
                                >
                                    Share Meal
                                </button>
                            </div>
                        )}

                        {isConsuming && (
                            <div className="text-rose-400 tracking-widest text-sm animate-pulse my-8 flex flex-col items-center gap-4">
                                <div className="h-1 w-24 bg-rose-900 overflow-hidden rounded-full">
                                    <div className="h-full bg-rose-400 animate-[bounce_1s_infinite]"></div>
                                </div>
                                EMULATING BIO-METABOLISM...
                            </div>
                        )}

                        {result && (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center mt-4">
                                <FiHeart className="text-rose-500 mb-4" size={24} />
                                <p className="text-rose-300 text-sm leading-relaxed italic">"{result}"</p>
                                <button 
                                    onClick={() => setResult(null)} 
                                    className="mt-6 text-rose-600 hover:text-rose-400 text-xs uppercase tracking-widest underline underline-offset-4"
                                >
                                    Share Another
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CyberneticGastronomy;
