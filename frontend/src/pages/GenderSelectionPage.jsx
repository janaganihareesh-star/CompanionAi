import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import femaleFace from '../assets/female_face_v2.png';
import maleFace from '../assets/male_face_v2.png';

export default function GenderSelectionPage() {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState('female');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('closer-token');
      await axios.post(
        '/api/profile/ai-gender',
        { aiGender: selectedGender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Save locally to display the avatar in the next step immediately
      localStorage.setItem('closer-ai-gender', selectedGender);
      
      navigate('/onboarding/name');
    } catch (err) {
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

      {/* Progress (3 steps total) */}
      <div className="flex justify-center gap-3 mt-4">
        <div className="w-8 h-2 rounded-full bg-accent" />
        <div className="w-2 h-2 rounded-full bg-border" />
        <div className="w-2 h-2 rounded-full bg-border" />
      </div>

      {/* Card */}
      <div className="w-full max-w-[500px] mx-auto bg-surface/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_40px_rgba(167,139,250,0.15)] px-8 py-8 md:px-10 md:py-10 my-auto relative z-10 flex flex-col justify-center transform transition-all hover:shadow-[0_0_50px_rgba(167,139,250,0.25)]">


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10 w-full flex-1 flex flex-col justify-center"
        >
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1 • AI Persona Identity</span>
            </div>
            <h2 className="text-4xl font-extrabold font-outfit text-text tracking-tight">Select AI Gender</h2>
            <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
              Choose the core vocal representation and conversational tone style of your emotional companion.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-4 w-full">
            {/* Female AI Card */}
            <motion.button
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGender('female')}
              className={`flex-1 p-8 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 relative overflow-hidden ${
                selectedGender === 'female'
                  ? 'border-accent shadow-[0_0_25px_rgba(236,72,153,0.15)] bg-gradient-to-b from-panel to-accent/5'
                  : 'bg-surface border-border hover:border-accent/40'
              }`}
            >
              <div className="relative p-1 rounded-full bg-panel border-2 border-border/50">
                <img 
                  src={femaleFace} 
                  alt="Female AI Face" 
                  className="w-28 h-28 rounded-full object-cover shadow-lg"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl text-text block tracking-wide">Female Companion</span>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Empathetic, nurturing, and emotionally supportive female voice models.
                </p>
              </div>
              {selectedGender === 'female' && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-accent animate-pulse" />
              )}
            </motion.button>

            {/* Male AI Card */}
            <motion.button
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGender('male')}
              className={`flex-1 p-8 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 relative overflow-hidden ${
                selectedGender === 'male'
                  ? 'border-accent shadow-[0_0_25px_rgba(59,130,246,0.15)] bg-gradient-to-b from-panel to-accent/5'
                  : 'bg-surface border-border hover:border-accent/40'
              }`}
            >
              <div className="relative p-1 rounded-full bg-panel border-2 border-border/50">
                <img 
                  src={maleFace} 
                  alt="Male AI Face" 
                  className="w-28 h-28 rounded-full object-cover shadow-lg"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl text-text block tracking-wide">Male Companion</span>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Strong, protective, warm, and highly expressive male voice models.
                </p>
              </div>
              {selectedGender === 'male' && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-accent animate-pulse" />
              )}
            </motion.button>
          </div>
        </motion.div>

        <div className="flex justify-between pt-8 border-t border-border/40 mt-6">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-panel border border-border text-text font-semibold rounded-xl hover:bg-opacity-95 transition flex items-center gap-2 cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm shadow-lg shadow-accent/25"
          >
            {isLoading ? 'Saving...' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted mt-4">Step 1 of 3 • AI Gender Select</div>
    </div>
  );
}
