import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGlobe, FiPlay, FiSearch, FiLoader } from 'react-icons/fi';

const WebBrowserOverlay = ({ isOpen, onClose }) => {
    const [url, setUrl] = useState('https://www.wikipedia.org');
    const [screenshot, setScreenshot] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleNavigate = () => {
        setIsLoading(true);
        // Simulate fetching screenshot from backend browserAgent
        setTimeout(() => {
            setScreenshot(`https://image.thum.io/get/width/1280/crop/800/${url}`); // Free thumbnail API for mock
            setIsLoading(false);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.95, y: 10 }}
                    className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
                >
                    {/* Toolbar */}
                    <div className="flex items-center gap-4 p-3 border-b border-white/10 bg-gray-800">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1 flex items-center bg-gray-950 rounded-lg border border-white/5 px-3 py-2 text-sm">
                            <FiGlobe className="text-gray-500 mr-2" />
                            <input 
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="bg-transparent text-white w-full outline-none"
                                placeholder="Enter URL..."
                                onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                            />
                        </div>
                        <button 
                            onClick={handleNavigate}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <FiPlay /> Go
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white ml-auto">
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Browser Content */}
                    <div className="flex-1 bg-white relative overflow-auto flex items-center justify-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center text-gray-500 gap-4">
                                <FiLoader size={48} className="animate-spin text-blue-500" />
                                <p>Navigating autonomously...</p>
                            </div>
                        ) : screenshot ? (
                            <img src={screenshot} alt="Browser View" className="w-full h-auto object-cover object-top" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center gap-4">
                                <FiSearch size={64} className="opacity-50" />
                                <p>Closer-AI Web Automator Ready.</p>
                                <p className="text-sm">I can navigate, click, type, and extract data from any website.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WebBrowserOverlay;
