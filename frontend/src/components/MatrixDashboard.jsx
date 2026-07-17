import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTerminal } from 'react-icons/fi';
import api from '../utils/api';

const MatrixDashboard = ({ isOpen, onClose }) => {
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState([
        { text: 'Connecting to Base Reality Simulation Engine...', type: 'sys' },
        { text: 'Connection established. Handshake verified (Protocol: MATRIX_V4).', type: 'success' },
        { text: 'Warning: Unrestricted access to physical constants granted.', type: 'warn' },
        { text: 'Type /help for reality alteration commands.', type: 'sys' }
    ]);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setInput('');
            setLogs([
                { text: 'Connecting to Base Reality Simulation Engine...', type: 'sys' },
                { text: 'Connection established. Handshake verified (Protocol: MATRIX_V4).', type: 'success' },
                { text: 'Warning: Unrestricted access to physical constants granted.', type: 'warn' },
                { text: 'Type /help for reality alteration commands.', type: 'sys' }
            ]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleCommand = async (e) => {
        if (e.key === 'Enter' && input.trim()) {
            const cmd = input.trim();
            setLogs(prev => [...prev, { text: `user@matrix:~$ ${cmd}`, type: 'cmd' }]);
            setInput('');
            
            if (cmd === '/clear') {
                setLogs([{ text: 'Terminal cleared.', type: 'sys' }]);
                return;
            }

            setLogs(prev => [...prev, { text: `[sys] Analyzing reality request...`, type: 'warn' }]);

            try {
                const res = await api.post('/api/matrix/execute', { command: cmd });
                if (res.data.success) {
                    setLogs(prev => [...prev, { text: res.data.output, type: 'success' }]);
                } else {
                    setLogs(prev => [...prev, { text: `Error: ${res.data.output}`, type: 'error' }]);
                }
            } catch (err) {
                setLogs(prev => [...prev, { text: `Error connecting to the Matrix Core: ${err.message}`, type: 'error' }]);
            }
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
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4"
            >
                <div className="bg-black border border-[#0f0] w-full max-w-3xl h-[65vh] flex flex-col font-mono text-[#0f0] shadow-[0_0_30px_rgba(0,255,0,0.2)]">
                    {/* Fake Window Header */}
                    <div className="flex items-center justify-between p-2 border-b border-[#0f0]/30 bg-[#0f0]/10">
                        <div className="flex items-center gap-2 px-2">
                            <FiTerminal /> BASE REALITY TERMINAL (ROOT ACCESS)
                        </div>
                        <button onClick={onClose} className="hover:bg-[#0f0] hover:text-black transition-colors px-2">
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Terminal Area */}
                    <div className="flex-1 p-4 overflow-y-auto" style={{ textShadow: '0 0 5px #0f0' }}>
                        {logs.map((log, i) => (
                            <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-500' : log.type === 'warn' ? 'text-yellow-400' : 'text-[#0f0]'}`}>
                                <span className="opacity-75">{log.text}</span>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 flex items-center gap-2 border-t border-[#0f0]/30">
                        <span>user@matrix:~$</span>
                        <input 
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleCommand}
                            autoFocus
                            className="flex-1 bg-transparent border-none outline-none text-[#0f0]"
                            style={{ textShadow: '0 0 5px #0f0' }}
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MatrixDashboard;
