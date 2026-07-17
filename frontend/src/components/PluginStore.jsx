import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiCheckCircle, FiGrid } from 'react-icons/fi';

const PluginStore = ({ isOpen, onClose }) => {
    // Mocked Plugins
    const [plugins, setPlugins] = useState([
        { id: 'expedia', name: 'Expedia Flights', description: 'Book flights and hotels autonomously', installed: false, icon: '✈️' },
        { id: 'instacart', name: 'Instacart Grocery', description: 'Order groceries to your door', installed: false, icon: '🛒' },
        { id: 'zapier', name: 'Zapier Automation', description: 'Connect Closer to 5000+ apps', installed: true, icon: '⚡' },
        { id: 'github_actions', name: 'GitHub CI/CD', description: 'Trigger workflows autonomously', installed: false, icon: '🐙' }
    ]);

    const handleInstall = (id) => {
        setPlugins(plugins.map(p => p.id === id ? { ...p, installed: !p.installed } : p));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
                >
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/50">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <FiGrid className="text-blue-500"/> Plugin Store
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plugins.map(plugin => (
                                <div key={plugin.id} className="bg-gray-800 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-gray-750 transition-colors">
                                    <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-white/5">
                                        {plugin.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold">{plugin.name}</h3>
                                        <p className="text-sm text-gray-400">{plugin.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleInstall(plugin.id)}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${plugin.installed ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                    >
                                        {plugin.installed ? <><FiCheckCircle /> Installed</> : <><FiDownload /> Install</>}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PluginStore;
