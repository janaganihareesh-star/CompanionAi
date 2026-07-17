import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiServer, FiGlobe } from 'react-icons/fi';

const DataCenterMap = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const regions = [
        { name: 'us-east-1', gpus: '24,000 H100s', status: 'Online', load: '87%' },
        { name: 'eu-central-1', gpus: '12,000 H100s', status: 'Online', load: '92%' },
        { name: 'ap-south-1', gpus: '8,000 H100s', status: 'Cooling', load: '45%' },
    ];

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-sm p-4"
            >
                <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-5xl h-[70vh] flex flex-col overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/30">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FiServer className="text-indigo-500" /> Physical GPU Foundry Controller
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">Managing 100,000+ Hardware Accelerators</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="flex-1 p-6 flex gap-6 bg-[#0a0a0a]">
                        <div className="w-1/3 flex flex-col gap-4">
                            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Regional Clusters</h3>
                            {regions.map((r, i) => (
                                <div key={i} className="bg-gray-800/50 border border-white/5 p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-mono text-white text-sm flex items-center gap-2"><FiGlobe className="text-indigo-400"/> {r.name}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'Online' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">Hardware: {r.gpus}</p>
                                    <div className="w-full bg-black rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: r.load }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 bg-black/50 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
                            {/* Mock Global Map Vis */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                            <div className="text-center z-10">
                                <div className="text-6xl font-bold text-white mb-2">44,000</div>
                                <div className="text-indigo-400 uppercase tracking-widest text-sm font-bold">Total Active GPUs</div>
                                <p className="text-gray-500 text-xs mt-4 max-w-xs mx-auto">Compute resources are automatically routed to handle V10 deep-tech inference pipelines.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DataCenterMap;
