import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import femaleFace from '../assets/female_face_v2.png';
import maleFace from '../assets/male_face_v2.png';

export default function AINameSelectionPage() {
  const navigate = useNavigate();
  const [aiName, setAiName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successExit, setSuccessExit] = useState(false);

  // Get the selected gender from the previous step
  const aiGender = localStorage.getItem('closer-ai-gender') || 'female';
  const avatarSrc = aiGender === 'female' ? femaleFace : maleFace;

  const targetText = 'Will you name me?';

  // Typing effect on mount
  useEffect(() => {
    let index = 0;
    let currentText = '';
    setSubtitle(''); // Reset before starting
    const interval = setInterval(() => {
      currentText += targetText.charAt(index);
      setSubtitle(currentText);
      index++;
      if (index >= targetText.length) {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aiName.trim()) {
      toast.error('Please name your companion!');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('closer-token');
      await axios.post(
        '/api/profile/ai-name',
        { aiName: aiName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      localStorage.setItem('closer-ai-name', aiName.trim());

      setSuccessExit(true);

      setTimeout(() => {
        navigate('/onboarding/relationship');
      }, 800);
    } catch (err) {
      toast.error('Failed to complete onboarding name setup.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between relative p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Toaster position="top-right" />

      {/* Progress (Step 2 of 3) */}
      <div className="flex justify-center gap-3 mt-4">
        <div className="w-2 h-2 rounded-full bg-accent" />
        <div className="w-8 h-2 rounded-full bg-accent" />
        <div className="w-2 h-2 rounded-full bg-border" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={successExit ? { scale: [1, 1.05, 0], opacity: [1, 1, 0] } : { opacity: 1, y: 0 }}
        transition={successExit ? { duration: 0.6, ease: 'easeInOut' } : { type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md mx-auto bg-surface/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_40px_rgba(167,139,250,0.15)] px-6 py-10 md:px-10 md:py-12 my-auto relative z-10 flex flex-col justify-center transform transition-all hover:shadow-[0_0_50px_rgba(167,139,250,0.25)]"
      >


        <div className="space-y-8 relative z-10 flex flex-col justify-center items-center">
          
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-accent/20 to-fuchsia-500/20 text-accent text-xs font-bold tracking-widest uppercase border border-accent/20 shadow-[0_0_15px_rgba(167,139,250,0.15)] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Identity Setup</span>
          </div>

          {/* Pulsing Dynamic Avatar */}
          <div className="relative flex items-center justify-center w-36 h-36">
            <div className="absolute w-full h-full rounded-full border border-accent/20 pulse-ring-slow" style={{ animationDelay: '0s' }} />
            <div className="absolute w-32 h-32 rounded-full border border-accent/20 pulse-ring-slow" style={{ animationDelay: '1s' }} />
            <div className="absolute w-28 h-28 rounded-full border border-accent/30 pulse-ring-slow" style={{ animationDelay: '2s' }} />
            <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-accent to-fuchsia-500 shadow-[0_0_20px_rgba(167,139,250,0.5)] z-10 flex items-center justify-center">
              <img 
                src={avatarSrc} 
                alt="Selected AI Avatar" 
                className="w-full h-full rounded-full object-cover border-2 border-surface"
              />
            </div>
          </div>

          <div className="text-center space-y-3 w-full">
            <h2 className="text-3xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-r from-text via-text to-muted tracking-tight">Name Your Companion</h2>
            <div className="text-accent font-semibold text-sm min-h-6">
              {subtitle}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="relative">
              <input
                type="text"
                value={aiName}
                onChange={(e) => setAiName(e.target.value)}
                placeholder="Enter name..."
                className="w-full bg-panel/50 border border-border/70 text-text text-center text-xl font-bold rounded-2xl px-4 py-4 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all shadow-inner"
                maxLength="16"
              />
              <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5" />
            </div>
          </form>
        </div>

        <div className="flex justify-between pt-8 w-full border-t border-border/40 mt-8 relative z-10">
          <button
            onClick={() => navigate('/onboarding/gender')}
            className="px-6 py-3.5 bg-panel/50 backdrop-blur-md border border-border text-text font-semibold rounded-2xl hover:bg-panel transition-all flex items-center gap-2 cursor-pointer text-sm hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3.5 bg-gradient-to-r from-accent to-fuchsia-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm shadow-[0_0_25px_rgba(167,139,250,0.4)] hover:shadow-[0_0_35px_rgba(167,139,250,0.6)] hover:-translate-y-0.5"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Next'
            )}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="text-center text-xs text-muted mt-4">Step 2 of 3 • Companion Name</div>
    </div>
  );
}
