import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUsers, FiMessageCircle, FiPlus, FiStar } from 'react-icons/fi';

const PersonaMarketplace = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('explore');
    
    // Mock Data
    const personas = [
        { id: 1, name: 'Socrates', tagline: 'Let us philosophize together.', interactions: 15420, avatar: '🏛️' },
        { id: 2, name: 'Code Master', tagline: 'Expert in debugging and architecture.', interactions: 8900, avatar: '💻' },
        { id: 3, name: 'Therapist Joy', tagline: 'Here to listen and help you heal.', interactions: 24500, avatar: '🛋️' },
        { id: 4, name: 'Pirate Captain', tagline: 'Arr! Ready for an adventure?', interactions: 3200, avatar: '🏴‍☠️' },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                    className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gray-900/80 backdrop-blur">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FiUsers className="text-purple-500" /> Persona Marketplace
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-950">
                        {/* Sidebar */}
                        <div className="w-full md:w-64 border-r border-white/5 bg-gray-900 p-4 flex flex-col gap-2">
                            <button onClick={() => setActiveTab('explore')} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'explore' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}>
                                <FiStar /> Explore
                            </button>
                            <button onClick={() => setActiveTab('create')} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'create' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}>
                                <FiPlus /> Create Persona
                            </button>
                            <div className="mt-auto p-4 bg-purple-900/20 border border-purple-500/20 rounded-xl">
                                <p className="text-xs text-purple-300 font-medium">Create custom GPTs with specific knowledge and distinct personalities.</p>
                            </div>
                        </div>

                        {/* Main Area */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {activeTab === 'explore' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {personas.map(p => (
                                        <div key={p.id} className="bg-gray-800 border border-white/5 rounded-2xl p-5 hover:bg-gray-750 transition-colors group cursor-pointer">
                                            <div className="text-4xl mb-4 bg-gray-900 w-16 h-16 flex items-center justify-center rounded-2xl shadow-inner border border-white/5">
                                                {p.avatar}
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                                            <p className="text-gray-400 text-sm mb-4 h-10">{p.tagline}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500 font-medium">{p.interactions.toLocaleString()} chats</span>
                                                <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FiMessageCircle />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'create' && (
                                <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-2xl border border-white/5">
                                    <h3 className="text-xl font-bold text-white mb-6">Create a New Persona</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-400 mb-1 block">Name</label>
                                            <input type="text" className="w-full bg-gray-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500" placeholder="e.g. Code Master" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-400 mb-1 block">Tagline</label>
                                            <input type="text" className="w-full bg-gray-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500" placeholder="Short description..." />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-400 mb-1 block">System Instructions (The Prompt)</label>
                                            <textarea className="w-full h-32 bg-gray-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500 resize-none" placeholder="You are a helpful coding assistant who speaks like a pirate..."></textarea>
                                        </div>
                                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-4">
                                            Create Persona
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PersonaMarketplace;
