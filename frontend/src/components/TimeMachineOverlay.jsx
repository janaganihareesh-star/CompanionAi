import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock, FiAlertTriangle, FiPlayCircle, FiPauseCircle, FiDownload } from 'react-icons/fi';
import api from '../utils/api'; // using global axios instance

const TimeMachineOverlay = ({ isOpen, onClose }) => {
    const [targetDate, setTargetDate] = useState('0050-01-01');
    const [newFact, setNewFact] = useState('');
    const [isTravelling, setIsTravelling] = useState(false);
    const [mediaData, setMediaData] = useState(null); // { mediaUrl, audioUrl, message }
    
    // Audio Player State
    const [isPlaying, setIsPlaying] = useState(true);
    const audioRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setTargetDate('0050-01-01');
            setNewFact('');
            setIsTravelling(false);
            setMediaData(null);
            setIsPlaying(true);
        }
    }, [isOpen]);

    const initiateChronoSlip = async () => {
        setIsTravelling(true);
        setMediaData(null);
        
        try {
            const res = await api.post('/api/chrono-slip/generate', { date: targetDate, incident: newFact });
            
            // Artificial delay for intense "Quantum Rendering" effect
            setTimeout(() => {
                setIsTravelling(false);
                setMediaData(res.data);
            }, 5000);
            
        } catch (err) {
            console.error("Temporal connection failed:", err);
            setIsTravelling(false);
            alert("Temporal connection failed. Please try again.");
        }
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
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
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 font-mono"
            >
                <div className="absolute top-6 right-6 z-50">
                    <button onClick={onClose} className="text-white/50 hover:text-white bg-white/10 p-3 rounded-full transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className={`transition-all duration-700 ease-in-out border-2 rounded-3xl relative overflow-hidden text-center shadow-[0_0_150px_rgba(147,51,234,0.3)]
                    ${mediaData ? 'w-full max-w-4xl h-[80vh] border-purple-900/30 bg-black' : 'bg-[#050014] border-purple-900/50 w-full max-w-2xl p-8 max-h-[85vh] overflow-y-auto'}
                `}>
                    
                    {/* Background Glow */}
                    {!mediaData && (
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none"></div>
                    )}

                    <div className="relative z-10 flex flex-col items-center h-full">
                        
                        {/* FORM & LOADING STATE */}
                        {!mediaData && (
                            <div className="w-full flex flex-col items-center">
                                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mb-8 transition-colors duration-1000 ${isTravelling ? 'border-purple-500 animate-spin shadow-[0_0_50px_rgba(168,85,247,0.8)]' : 'border-purple-900'}`}>
                                    <FiClock size={48} className={isTravelling ? 'text-purple-300 animate-pulse' : 'text-purple-700'} />
                                </div>
                                
                                <h2 className="text-3xl font-bold text-white tracking-[0.3em] uppercase mb-2">Chrono-Slip Engine</h2>
                                <p className="text-purple-500/80 text-sm tracking-widest mb-10">Temporal Video Feed Generator</p>

                                {!isTravelling && (
                                    <div className="w-full flex flex-col gap-6 text-left">
                                        <div className="bg-purple-950/30 border border-purple-900 p-4 rounded-xl flex items-start gap-3">
                                            <FiAlertTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                                            <p className="text-xs text-purple-300">Enter a historical incident and date. Our AI will intercept temporal lightwaves to generate a cinematic video feed and synchronized atmosphere.</p>
                                        </div>
                                        
                                        <div>
                                            <label className="text-xs text-purple-500 tracking-widest uppercase mb-2 block">Target Destination Date</label>
                                            <input 
                                                type="date" 
                                                value={targetDate} 
                                                onChange={(e) => setTargetDate(e.target.value)}
                                                className="w-full bg-black/50 border border-purple-800 rounded-lg p-3 text-purple-200 outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="text-xs text-purple-500 tracking-widest uppercase mb-2 block">Incident to View</label>
                                            <input 
                                                type="text" 
                                                value={newFact} 
                                                onChange={(e) => setNewFact(e.target.value)}
                                                placeholder="e.g. Alien invasion during the Roman Empire"
                                                className="w-full bg-black/50 border border-purple-800 rounded-lg p-3 text-purple-200 outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        
                                        <button 
                                            onClick={initiateChronoSlip}
                                            disabled={!newFact.trim()}
                                            className="mt-4 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-4 px-12 rounded-full tracking-widest uppercase text-sm shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all"
                                        >
                                            OPEN TEMPORAL FEED
                                        </button>
                                    </div>
                                )}

                                {isTravelling && (
                                    <div className="flex flex-col items-center mt-12 w-full">
                                        <div className="text-purple-400 tracking-[0.4em] text-xl font-bold animate-pulse mb-6">
                                            QUANTUM RENDERING...
                                        </div>
                                        <div className="w-full max-w-md h-2 bg-purple-900/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-purple-700 to-fuchsia-500 rounded-full w-full animate-[progress_5s_ease-in-out_forwards]"></div>
                                        </div>
                                        <p className="text-xs text-purple-500/50 mt-4 tracking-widest animate-bounce">INTERCEPTING LIGHTWAVES FROM {targetDate.split('-')[0]}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TEMPORAL VIDEO PLAYER MODE */}
                        {mediaData && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="w-full h-full flex flex-col relative"
                            >
                                {/* The Cinematic Visual with Ken Burns Zoom & VHS Glitch */}
                                <div className="absolute inset-0 bg-black overflow-hidden group">
                                    <div 
                                        className="w-full h-full bg-cover bg-center animate-[kenburns_20s_ease-out_infinite_alternate]"
                                        style={{ backgroundImage: `url("${mediaData.mediaUrl}")` }}
                                    ></div>
                                    
                                    {/* VHS / Scanline Overlay */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-black/80 pointer-events-none"></div>
                                    
                                    {/* Vignette */}
                                    <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none"></div>

                                    {/* Top Left Rec Info */}
                                    <div className="absolute top-6 left-6 flex items-center gap-3">
                                        <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                                        <span className="text-red-500 font-bold tracking-[0.3em]">REC</span>
                                        <span className="text-white/50 tracking-widest ml-4">{targetDate}</span>
                                    </div>
                                </div>

                                {/* Player Controls UI Overlay */}
                                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center">
                                    <h3 className="text-2xl font-bold text-white tracking-widest mb-2 shadow-black drop-shadow-md">"{newFact}"</h3>
                                    <p className="text-purple-400 text-sm tracking-[0.2em] mb-6">{mediaData.message}</p>
                                    
                                    <div className="flex items-center gap-6">
                                        <button onClick={toggleAudio} className="text-white hover:text-purple-400 transition-colors">
                                            {isPlaying ? <FiPauseCircle size={48} /> : <FiPlayCircle size={48} />}
                                        </button>
                                        <button onClick={() => setMediaData(null)} className="text-xs text-white/50 hover:text-white tracking-widest border border-white/20 px-6 py-2 rounded-full uppercase transition-colors">
                                            Close Feed
                                        </button>
                                    </div>
                                </div>

                                {/* Hidden Audio Player */}
                                <audio ref={audioRef} src={mediaData.audioUrl} autoPlay loop />
                            </motion.div>
                        )}

                    </div>
                </div>
            </motion.div>
            
            {/* Custom Animations for Ken Burns effect */}
            <style jsx>{`
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(0); }
                }
                @keyframes kenburns {
                    0% { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.15) translate(-1%, -1%); }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default TimeMachineOverlay;
