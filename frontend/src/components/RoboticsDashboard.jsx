import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCpu, FiCamera, FiArrowUp, FiArrowDown, FiArrowLeft, FiArrowRight, FiActivity } from 'react-icons/fi';

const RoboticsDashboard = ({ isOpen, onClose }) => {
    const [commandLog, setCommandLog] = useState([]);
    const [status, setStatus] = useState('Idle');

    const handleCommand = (cmd) => {
        setStatus('Executing: ' + cmd);
        setCommandLog(prev => [{ time: new Date().toLocaleTimeString(), cmd }, ...prev].slice(0, 5));
        
        setTimeout(() => {
            setStatus('Idle');
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                    className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <FiCpu className="text-orange-500" /> Physical Robotics Link
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Link Active
                            </span>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-950">
                        {/* Camera View */}
                        <div className="w-full md:w-2/3 p-4 relative border-r border-white/10 flex flex-col">
                            <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
                                <span className="flex items-center gap-2"><FiCamera /> Robot Primary Vision (Simulated)</span>
                                <span>1080p @ 60fps</span>
                            </div>
                            <div className="flex-1 bg-black rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                                {/* Mock Camera View */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                <FiCamera size={64} className="text-gray-800" />
                                <div className="absolute top-4 left-4 text-green-500 font-mono text-xs">
                                    <p>SYS: OPTIMAL</p>
                                    <p>BAT: 84%</p>
                                    <p>MOTORS: ENGAGED</p>
                                </div>
                                
                                {/* Overlay Crosshair */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-red-500/50 rounded-full flex items-center justify-center">
                                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Controls & Logs */}
                        <div className="w-full md:w-1/3 p-4 flex flex-col gap-6 bg-gray-900">
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><FiActivity /> Telemetry</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-gray-800 p-3 rounded-lg border border-white/5">
                                        <p className="text-xs text-gray-500 mb-1">Status</p>
                                        <p className="text-sm font-semibold text-blue-400">{status}</p>
                                    </div>
                                    <div className="bg-gray-800 p-3 rounded-lg border border-white/5">
                                        <p className="text-xs text-gray-500 mb-1">Latency</p>
                                        <p className="text-sm font-semibold text-green-400">12ms</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-400 mb-4">Manual Override</h3>
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={() => handleCommand('MOVE_FORWARD')} className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-white/10 active:scale-95 transition-transform"><FiArrowUp /></button>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleCommand('TURN_LEFT')} className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-white/10 active:scale-95 transition-transform"><FiArrowLeft /></button>
                                        <button onClick={() => handleCommand('GRASP')} className="bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 border border-orange-500/30 p-4 rounded-xl font-bold text-xs active:scale-95 transition-transform">GRASP</button>
                                        <button onClick={() => handleCommand('TURN_RIGHT')} className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-white/10 active:scale-95 transition-transform"><FiArrowRight /></button>
                                    </div>
                                    <button onClick={() => handleCommand('MOVE_BACKWARD')} className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-white/10 active:scale-95 transition-transform"><FiArrowDown /></button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col min-h-0">
                                <h3 className="text-sm font-bold text-gray-400 mb-2">Command Log</h3>
                                <div className="flex-1 overflow-y-auto bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-xs">
                                    {commandLog.map((log, i) => (
                                        <div key={i} className="mb-2 text-gray-300">
                                            <span className="text-gray-600 mr-2">[{log.time}]</span>
                                            {log.cmd}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RoboticsDashboard;
