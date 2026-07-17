import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCode, FiPlay, FiRefreshCw } from 'react-icons/fi';

const LivePreview = ({ isOpen, onClose, code, language = 'html' }) => {
    const [previewContent, setPreviewContent] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        let finalHtml = code;
        if (language === 'react') {
            // Mock React rendering by wrapping in babel standalone (conceptually like v0)
            finalHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-50 p-4">
                <div id="root"></div>
                <script type="text/babel">
                    ${code}
                    const root = ReactDOM.createRoot(document.getElementById('root'));
                    root.render(<App />);
                </script>
            </body>
            </html>
            `;
        }

        setPreviewContent(finalHtml);
    }, [isOpen, code, language]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.95, y: 10 }}
                    className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-white/10 bg-gray-900">
                        <div className="flex items-center gap-2 text-white font-semibold">
                            <FiPlay className="text-blue-500" /> Live Preview
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="text-gray-400 hover:text-white transition-colors" title="Reload">
                                <FiRefreshCw />
                            </button>
                            <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Split View */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Code View (Read Only Mock) */}
                        <div className="w-1/3 bg-gray-950 border-r border-white/10 p-4 overflow-y-auto text-sm text-green-400 font-mono hidden md:block">
                            <pre>{code}</pre>
                        </div>

                        {/* Output View */}
                        <div className="flex-1 bg-white relative">
                            <iframe 
                                title="live-preview"
                                srcDoc={previewContent}
                                className="w-full h-full border-none outline-none"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LivePreview;
