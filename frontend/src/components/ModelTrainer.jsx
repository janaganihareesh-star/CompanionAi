import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDatabase, FiCpu, FiTrendingUp, FiUploadCloud } from 'react-icons/fi';

const ModelTrainer = ({ isOpen, onClose }) => {
    const [dataset, setDataset] = useState(null);
    const [status, setStatus] = useState('IDLE');
    const [progress, setProgress] = useState(0);

    const handleUpload = (e) => {
        setDataset(e.target.files[0]?.name || 'custom_dataset.jsonl');
        setStatus('READY');
    };

    const startTraining = () => {
        setStatus('TRAINING');
        setProgress(0);
        
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setStatus('COMPLETED');
                    return 100;
                }
                return p + 2;
            });
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                    className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl flex flex-col overflow-hidden shadow-2xl"
                >
                    <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gray-900">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <FiCpu className="text-purple-500" /> Closer Custom Fine-Tuning
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row min-h-[450px]">
                        <div className="w-full md:w-1/3 bg-gray-950 p-6 border-r border-white/10">
                            <h3 className="text-sm font-semibold text-gray-400 mb-4">Training Configuration</h3>
                            
                            <label className="text-xs text-gray-500 block mb-1">Base Model</label>
                            <select className="w-full bg-gray-900 border border-white/10 text-white rounded-lg p-2 mb-4 outline-none">
                                <option>Llama-3-8B-Instruct</option>
                                <option>Mistral-7B-v0.2</option>
                                <option>Closer-Core-V8</option>
                            </select>

                            <label className="text-xs text-gray-500 block mb-1">Upload Dataset (.jsonl)</label>
                            <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:bg-white/5 transition-colors mb-4 relative">
                                <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <FiUploadCloud className="mx-auto text-gray-400 mb-2" size={24} />
                                <span className="text-sm text-gray-400 font-medium">
                                    {dataset ? dataset : 'Drag & drop or browse'}
                                </span>
                            </div>

                            <label className="text-xs text-gray-500 block mb-1">Method</label>
                            <select className="w-full bg-gray-900 border border-white/10 text-white rounded-lg p-2 mb-6 outline-none">
                                <option>LoRA (Low-Rank Adaptation)</option>
                                <option>QLoRA (Quantized)</option>
                                <option>Full Fine-Tune</option>
                            </select>

                            <button 
                                onClick={startTraining}
                                disabled={status !== 'READY'}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Start Training Run
                            </button>
                        </div>

                        <div className="flex-1 bg-gray-900 p-6 flex flex-col justify-center relative">
                            {status === 'IDLE' && (
                                <div className="text-center text-gray-600">
                                    <FiDatabase size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Upload a dataset to begin fine-tuning.</p>
                                </div>
                            )}
                            
                            {status === 'READY' && (
                                <div className="text-center text-gray-400">
                                    <p className="mb-2">Dataset Verified: <strong className="text-white">1,240 examples</strong></p>
                                    <p>Estimated VRAM: <strong className="text-white">16GB</strong></p>
                                </div>
                            )}

                            {(status === 'TRAINING' || status === 'COMPLETED') && (
                                <div className="max-w-md w-full mx-auto">
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-gray-400">Epoch 3/3</span>
                                        <span className="text-purple-400">{progress}%</span>
                                    </div>
                                    <div className="h-4 bg-gray-950 rounded-full overflow-hidden border border-white/10">
                                        <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>

                                    <div className="mt-8 bg-gray-950 p-4 rounded-xl border border-white/5">
                                        <h4 className="text-xs text-gray-500 mb-2 flex items-center gap-2"><FiTrendingUp /> Training Loss</h4>
                                        <div className="h-32 border-b border-l border-gray-700 relative">
                                            {/* Mock Chart line */}
                                            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                                <path d={`M0,80 Q20,30 50,20 T${Math.max(50, progress)},${Math.max(10, 80 - progress * 0.7)}`} fill="none" stroke="#a855f7" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </div>

                                    {status === 'COMPLETED' && (
                                        <div className="mt-6 bg-green-500/20 text-green-400 p-4 rounded-xl text-center font-medium border border-green-500/20">
                                            Training complete! Model saved to /models/lora-custom-v1
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ModelTrainer;
