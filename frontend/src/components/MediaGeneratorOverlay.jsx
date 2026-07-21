import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiVideo, FiMusic, FiBox, FiX, FiLoader, FiDownload, FiSettings } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MediaGeneratorOverlay = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('video'); // Defaulting to Video for Sora showcase
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    
    // Video Generation State
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoStatus, setVideoStatus] = useState('');
    const [videoJobId, setVideoJobId] = useState(null);
    const [videoParams, setVideoParams] = useState({
        aspectRatio: '16:9',
        cameraMotion: 'cinematic_pan',
        lighting: 'dramatic',
        resolution: '4K'
    });

    useEffect(() => {
        let interval;
        if (videoJobId && isGenerating && activeTab === 'video') {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/api/video/status/${videoJobId}`);
                    setVideoStatus(res.data.status);
                    setVideoProgress(res.data.progress);
                    if (res.data.status === 'completed') {
                        setResultUrl(res.data.videoUrl);
                        setIsGenerating(false);
                        setVideoJobId(null);
                        clearInterval(interval);
                        toast.success('Hollywood-level Video Generated!');
                    }
                } catch (err) {
                    console.error('Video poll error', err);
                    setIsGenerating(false);
                    clearInterval(interval);
                    toast.error('Video generation failed');
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [videoJobId, isGenerating, activeTab]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setResultUrl(null);
        
        if (activeTab === 'video') {
            setVideoProgress(0);
            setVideoStatus('queued');
            try {
                const res = await api.post('/api/video/generate', {
                    prompt,
                    options: videoParams
                });
                setVideoJobId(res.data.jobId);
            } catch (err) {
                toast.error('Failed to start video generation');
                setIsGenerating(false);
            }
        } else {
            // Mocking other media types
            setTimeout(() => {
                let mockUrl = '';
                if (activeTab === 'image') {
                    mockUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
                } else if (activeTab === 'audio') {
                    mockUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                } else {
                    mockUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
                }
                setResultUrl(mockUrl);
                setIsGenerating(false);
            }, 3000);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'video', icon: <FiVideo />, label: 'Sora Video' },
        { id: 'image', icon: <FiImage />, label: 'Image' },
        { id: 'audio', icon: <FiMusic />, label: 'Audio' },
        { id: '3d', icon: <FiBox />, label: '3D Model' }
    ];

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/80">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            ✨ CloserAI Media Studio
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-4 gap-2 bg-gray-800/50 overflow-x-auto border-b border-white/5">
                        {tabs.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setResultUrl(null); }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        {/* Sidebar (Input) */}
                        <div className="w-full md:w-2/5 p-5 border-r border-white/10 flex flex-col gap-5 bg-gray-900 overflow-y-auto custom-scrollbar">
                            <div className="flex flex-col gap-2">
                                <label className="text-gray-300 text-sm font-bold">Director's Prompt</label>
                                <textarea 
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={`Describe the ${activeTab} in extreme detail...`}
                                    className="w-full h-32 bg-gray-950 text-white rounded-xl p-4 outline-none border border-white/10 focus:border-indigo-500 resize-none font-medium leading-relaxed"
                                />
                            </div>

                            {activeTab === 'video' && (
                                <div className="space-y-4 bg-gray-800/30 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-2">
                                        <FiSettings /> Sora Generation Parameters
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400">Aspect Ratio</label>
                                            <select 
                                                value={videoParams.aspectRatio}
                                                onChange={e => setVideoParams({...videoParams, aspectRatio: e.target.value})}
                                                className="w-full bg-gray-950 text-white text-xs p-2 rounded outline-none border border-white/10"
                                            >
                                                <option value="16:9">16:9 (Cinematic)</option>
                                                <option value="9:16">9:16 (TikTok/Reels)</option>
                                                <option value="1:1">1:1 (Square)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400">Camera Motion</label>
                                            <select 
                                                value={videoParams.cameraMotion}
                                                onChange={e => setVideoParams({...videoParams, cameraMotion: e.target.value})}
                                                className="w-full bg-gray-950 text-white text-xs p-2 rounded outline-none border border-white/10"
                                            >
                                                <option value="cinematic_pan">Cinematic Pan</option>
                                                <option value="drone_flythrough">Drone Flythrough</option>
                                                <option value="zoom_in">Slow Zoom In</option>
                                                <option value="static">Static Tripod</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400">Lighting</label>
                                            <select 
                                                value={videoParams.lighting}
                                                onChange={e => setVideoParams({...videoParams, lighting: e.target.value})}
                                                className="w-full bg-gray-950 text-white text-xs p-2 rounded outline-none border border-white/10"
                                            >
                                                <option value="dramatic">Dramatic / Moody</option>
                                                <option value="golden_hour">Golden Hour</option>
                                                <option value="studio">Studio Lighting</option>
                                                <option value="cyberpunk">Cyberpunk Neon</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400">Resolution</label>
                                            <select 
                                                value={videoParams.resolution}
                                                onChange={e => setVideoParams({...videoParams, resolution: e.target.value})}
                                                className="w-full bg-gray-950 text-white text-xs p-2 rounded outline-none border border-white/10"
                                            >
                                                <option value="4K">4K UHD</option>
                                                <option value="1080p">1080p HD</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 mt-auto"
                            >
                                {isGenerating ? <><FiLoader className="animate-spin" /> {activeTab === 'video' ? 'Synthesizing...' : 'Generating...'}</> : '✨ Generate Masterpiece'}
                            </button>
                        </div>

                        {/* Main View (Output) */}
                        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black relative">
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center text-indigo-400 w-full max-w-md">
                                    <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(99,102,241,0.5)]"></div>
                                    <h3 className="font-bold text-lg mb-2 capitalize">{activeTab === 'video' ? videoStatus.replace('_', ' ') : `Generating ${activeTab}...`}</h3>
                                    
                                    {activeTab === 'video' && (
                                        <div className="w-full bg-gray-800 rounded-full h-2 mb-2 overflow-hidden">
                                            <div className="bg-indigo-500 h-2 transition-all duration-300" style={{ width: `${videoProgress}%` }}></div>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 animate-pulse">This might take a moment based on complexity...</p>
                                </div>
                            ) : resultUrl ? (
                                <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in relative group">
                                    {activeTab === 'image' && (
                                        <img src={resultUrl} alt="Generated" className="max-w-full max-h-full rounded-xl shadow-2xl object-contain border border-white/10" />
                                    )}
                                    {activeTab === 'video' && (
                                        <video src={resultUrl} controls autoPlay loop className="max-w-full max-h-full rounded-xl shadow-2xl bg-black border border-white/10" />
                                    )}
                                    {activeTab === 'audio' && (
                                        <div className="w-full max-w-md bg-gray-900 p-8 rounded-3xl shadow-2xl border border-white/10 flex flex-col items-center gap-6">
                                            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-2 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-white/20 animate-ping"></div>
                                                <FiMusic size={48} className="text-white relative z-10" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-bold text-lg">AI Audio Track</p>
                                                <p className="text-gray-400 text-xs mt-1 truncate max-w-[200px]">{prompt}</p>
                                            </div>
                                            <audio src={resultUrl} controls className="w-full outline-none" />
                                        </div>
                                    )}
                                    {activeTab === '3d' && (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-center bg-gray-900 rounded-xl border border-white/10">
                                            <FiBox size={64} className="text-indigo-500 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                            <p className="text-white font-bold text-xl mb-2">3D Asset Synthesized</p>
                                            <p className="text-gray-400 max-w-sm mb-6">Your object has been generated. Download it to view in any standard 3D viewer (glTF/glb format).</p>
                                            <a href={resultUrl} download className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/10">
                                                Download .glb
                                            </a>
                                        </div>
                                    )}
                                    
                                    {activeTab !== '3d' && (
                                        <a 
                                            href={resultUrl} 
                                            download 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="absolute bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 border border-white/20 text-white p-4 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                        >
                                            <FiDownload size={24} />
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-600 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                                        {activeTab === 'image' && <FiImage size={40} className="text-gray-700" />}
                                        {activeTab === 'video' && <FiVideo size={40} className="text-gray-700" />}
                                        {activeTab === 'audio' && <FiMusic size={40} className="text-gray-700" />}
                                        {activeTab === '3d' && <FiBox size={40} className="text-gray-700" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-500 mb-2">Ready to Synthesize</h3>
                                    <p className="max-w-xs text-sm">Enter a highly descriptive prompt on the left to begin generating your masterpiece.</p>
                                    <p className="text-xs mt-4 opacity-50 font-mono tracking-widest text-indigo-500">POWERED BY CLOSER-AI</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MediaGeneratorOverlay;
