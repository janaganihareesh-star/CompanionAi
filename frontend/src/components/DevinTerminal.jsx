import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTerminal, FiPlay, FiGithub, FiCheckCircle } from 'react-icons/fi';

const DevinTerminal = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [isWorking, setIsWorking] = useState(false);
    const [issue, setIssue] = useState('Fix failing tests in user-auth flow');
    const bottomRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const startAgent = async () => {
        setIsWorking(true);
        setLogs([{ time: new Date().toLocaleTimeString(), text: '> Requesting real execution from OS Agent...', type: 'sys' }]);

        try {
            const token = localStorage.getItem('closer-token');
            const res = await fetch('/api/os/devin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ repoUrl: 'demo-repo', issueDescription: issue })
            });
            const data = await res.json();
            
            if (data.success && data.details) {
                data.details.forEach((step, idx) => {
                    setTimeout(() => {
                        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: step.command, type: 'cmd' }]);
                        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: step.log, type: step.success ? 'success' : 'error' }]);
                        if (idx === data.details.length - 1) setIsWorking(false);
                    }, idx * 1000); // Stagger logs for effect
                });
            } else {
                setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: data.message || 'Execution failed', type: 'error' }]);
                setIsWorking(false);
            }
        } catch (err) {
            setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: 'Connection to local OS agent failed.', type: 'error' }]);
            setIsWorking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                    className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-4xl h-[70vh] flex flex-col overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/60">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FiTerminal className="text-green-500" /> Autonomous CI/CD Engineer
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row h-full overflow-hidden">
                        {/* Control Panel */}
                        <div className="w-full md:w-1/3 bg-gray-950 p-6 border-r border-white/10 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <FiGithub /> Target Repository
                            </div>
                            <input type="text" disabled value="company/core-backend" className="w-full bg-gray-900 border border-white/10 p-3 rounded-lg text-gray-500 cursor-not-allowed" />
                            
                            <div className="text-sm text-gray-400 mt-2 mb-1">Issue Description</div>
                            <textarea 
                                value={issue} 
                                onChange={(e) => setIssue(e.target.value)}
                                disabled={isWorking}
                                className="w-full h-24 bg-gray-900 border border-white/10 p-3 rounded-lg text-white resize-none outline-none focus:border-green-500"
                            />

                            <button 
                                onClick={startAgent}
                                disabled={isWorking}
                                className="mt-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                {isWorking ? 'Agent is working...' : <><FiPlay /> Start Autonomous Fix</>}
                            </button>
                        </div>

                        {/* Terminal Window */}
                        <div className="w-full md:w-2/3 bg-[#0D0D0D] p-6 font-mono text-sm overflow-y-auto flex flex-col">
                            {logs.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-gray-700">
                                    Ready to spawn isolated cloud workspace...
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="mb-2 break-words">
                                        <span className="text-gray-600 mr-3">[{log.time}]</span>
                                        <span className={`
                                            ${log.type === 'cmd' ? 'text-white' : ''}
                                            ${log.type === 'sys' ? 'text-blue-400' : ''}
                                            ${log.type === 'error' ? 'text-red-500' : ''}
                                            ${log.type === 'thought' ? 'text-yellow-400 italic' : ''}
                                            ${log.type === 'success' ? 'text-green-400 font-bold' : ''}
                                        `}>
                                            {log.type === 'cmd' && <span className="text-green-500 mr-2">➜</span>}
                                            {log.text}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={bottomRef} />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DevinTerminal;
