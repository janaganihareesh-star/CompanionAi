import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShield, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const CommandCenterUI = ({ isOpen, onClose }) => {
    const [nodes, setNodes] = useState([{ id: 1, status: 'IDLE' }, { id: 2, status: 'IDLE' }, { id: 3, status: 'IDLE' }]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [finalStatus, setFinalStatus] = useState(null);

    const executeCriticalTask = () => {
        setIsExecuting(true);
        setFinalStatus(null);
        setNodes(nodes.map(n => ({ ...n, status: 'COMPUTING' })));

        setTimeout(() => {
            // Simulate bit flip on Node 3
            setNodes([
                { id: 1, status: 'OK' },
                { id: 2, status: 'OK' },
                { id: 3, status: 'CORRUPTED_BIT_FLIP' }
            ]);
            
            setTimeout(() => {
                setIsExecuting(false);
                setFinalStatus('Consensus Reached. Node 3 ignored. Action Authorized.');
            }, 1000);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 font-mono"
            >
                <div className="bg-[#050b14] border-2 border-red-900/50 rounded-lg w-full max-w-5xl p-8 relative overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.1)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                    
                    <div className="flex items-center justify-between mb-12 border-b border-red-900/30 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-red-500 tracking-[0.2em] flex items-center gap-3 uppercase">
                                <FiShield /> Strategic Command Center
                            </h2>
                            <p className="text-red-500/50 text-xs tracking-widest mt-1">SPACE-GRADE TRIPLE-MODULAR REDUNDANCY ACTIVE</p>
                        </div>
                        <button onClick={onClose} className="text-red-500/50 hover:text-red-500 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {nodes.map(node => (
                            <div key={node.id} className={`p-6 border ${node.status === 'CORRUPTED_BIT_FLIP' ? 'border-red-500 bg-red-950/20' : 'border-green-500/30 bg-green-950/10'} rounded text-center transition-colors`}>
                                <div className="text-gray-500 text-xs mb-4 tracking-widest">COMPUTE NODE 0{node.id}</div>
                                <div className={`text-xl font-bold tracking-widest ${
                                    node.status === 'OK' ? 'text-green-500' : 
                                    node.status === 'CORRUPTED_BIT_FLIP' ? 'text-red-500 animate-pulse' : 
                                    'text-yellow-500'
                                }`}>
                                    {node.status}
                                </div>
                                {node.status === 'CORRUPTED_BIT_FLIP' && (
                                    <div className="mt-4 flex items-center justify-center text-red-500 text-xs gap-1">
                                        <FiAlertTriangle /> COSMIC RADIATION DETECTED
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-black/50 border border-gray-800 p-6 rounded flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-400 text-sm mb-2 tracking-widest">CRITICAL DIRECTIVE</h3>
                            <p className="text-white text-lg">Initiate Orbital Satellite Repositioning</p>
                        </div>
                        <button 
                            onClick={executeCriticalTask}
                            disabled={isExecuting}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded tracking-widest transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                        >
                            {isExecuting ? 'AWAITING NODE CONSENSUS...' : 'AUTHORIZE EXECUTION'}
                        </button>
                    </div>

                    {finalStatus && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-green-950/30 border border-green-500/50 p-4 rounded text-center text-green-500 flex items-center justify-center gap-3 tracking-widest">
                            <FiCheckCircle size={20} /> {finalStatus}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommandCenterUI;
