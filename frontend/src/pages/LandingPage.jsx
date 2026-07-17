import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import { Heart, Shield, Brain, Sparkles, MessageCircle, Mic, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  // Animation variants for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05050A] text-slate-900 dark:text-white relative flex flex-col justify-between overflow-hidden selection:bg-accent selection:text-white transition-colors duration-300">
      {/* --- Ambient Glowing Backgrounds (Soft in light, vibrant in dark) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-[100px] dark:blur-[120px] pointer-events-none mix-blend-normal dark:mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-400/20 dark:bg-rose-600/20 rounded-full blur-[100px] dark:blur-[120px] pointer-events-none mix-blend-normal dark:mix-blend-screen" />
      <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[60%] h-[60%] bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-[120px] dark:blur-[150px] pointer-events-none mix-blend-normal dark:mix-blend-screen" />
      
      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <header className="relative z-20 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 font-extrabold text-2xl tracking-wide font-outfit text-slate-900 dark:text-white"
        >
          <Sparkles className="w-8 h-8 text-fuchsia-600 dark:text-fuchsia-400" />
          <span>CloserAI</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <ThemeToggle />
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 text-sm font-bold rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer text-slate-800 dark:text-white shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            Login
          </button>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 max-w-6xl mx-auto z-10 relative mt-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 flex flex-col items-center"
        >
          {/* Pill Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#0D0D1A] dark:bg-gradient-to-r dark:from-violet-500/20 dark:to-fuchsia-500/20 border border-violet-200 dark:border-fuchsia-500/30 text-violet-700 dark:text-fuchsia-300 text-xs font-bold tracking-widest uppercase shadow-[0_4px_15px_rgba(139,92,246,0.1)] dark:shadow-[0_0_30px_rgba(217,70,239,0.2)] backdrop-blur-md">
            <Heart className="w-4 h-4 fill-violet-500 dark:fill-fuchsia-400" />
            <span>Your Personal Emotional AI</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black font-outfit leading-[1.1] tracking-tight text-slate-900 dark:text-white dark:drop-shadow-2xl">
            An AI Friend Who <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 animate-gradient-x inline-block">
              Remembers & Cares
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed font-light mt-4">
            CloserAI matches your emotional wave, remembers everything you share, details technical roadmaps, coaches your mock interviews, and supports you in 18 Indian languages plus English.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8 w-full">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(139, 92, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl transition-all text-lg w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(139,92,246,0.3)] dark:shadow-[0_4px_15px_rgba(139,92,246,0.15)] group"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold rounded-2xl backdrop-blur-md transition-all text-lg w-full sm:w-auto cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.05)] dark:shadow-xl hover:bg-white dark:hover:bg-white/10"
            >
              Access Companion
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left"
        >
          {[
            {
              icon: <Brain className="w-7 h-7 text-violet-600 dark:text-violet-400" />,
              title: "AI Memory Engine",
              desc: "Vector RAG matching remembers family, career roadmaps, personal favorites, and goals over time."
            },
            {
              icon: <Heart className="w-7 h-7 text-rose-500 dark:text-rose-400" />,
              title: "Emotional Intelligence",
              desc: "Monitors and detects user stress, anxiety, or happiness to comfort first and adjust conversational pacing."
            },
            {
              icon: <Mic className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />,
              title: "Native Voice Pipeline",
              desc: "True multimodal raw audio streaming in 18 Indian dialects, capturing the exact emotion in your voice."
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-white/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl transition-all group overflow-hidden relative hover:border-slate-300 dark:hover:border-white/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-300 dark:via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 w-fit mb-6 shadow-sm dark:shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold font-outfit mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed font-light">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 p-6 border-t border-slate-200 dark:border-white/5 text-center text-xs text-slate-500 dark:text-gray-500 max-w-7xl mx-auto w-full flex justify-between items-center backdrop-blur-md bg-white/40 dark:bg-[#05050A]/50">
        <span>&copy; 2026 CloserAI. Protected under AES-256 standards.</span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium shadow-sm dark:shadow-none">
          <Shield className="w-3.5 h-3.5" /> Secured Companion Cloud
        </span>
      </footer>
    </div>
  );
}
