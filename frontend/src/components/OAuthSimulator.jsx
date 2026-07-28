import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Check, X } from 'lucide-react';

export default function OAuthSimulator({ plugin, onComplete, onCancel }) {
  const user = useSelector((state) => state.auth.user);
  const [step, setStep] = useState(1); // 1 = Login, 2 = Permissions, 3 = Success

  // Helper to get initial
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Handle successful authorization
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        onComplete();
      }, 5000); // 5 seconds success screen
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      
      {/* Background decoration (simulating external login page) */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at center, ${plugin.iconBg} 0%, transparent 70%)` 
        }}
      />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#202123] w-full max-w-sm rounded-2xl p-8 flex flex-col items-center relative z-10 border border-white/10 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Jump back in!</h2>
            
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg">
              {userInitial}
            </div>
            
            <h3 className="text-white font-semibold tracking-wider">{user?.name || 'USER'}</h3>
            <p className="text-gray-400 text-sm mb-8">{user?.email || 'user@example.com'}</p>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-3 bg-[#8A2BE2] hover:bg-[#9B30FF] text-white rounded-lg font-medium transition-colors mb-4"
            >
              Continue
            </button>

            <div className="flex items-center w-full my-2">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-xs text-gray-500 uppercase tracking-widest">OR</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            <button 
              className="w-full py-3 text-white font-medium hover:bg-white/5 rounded-lg transition-colors mt-2"
            >
              Continue with another account
            </button>

            <p className="text-xs text-gray-500 mt-8 text-center">
              By continuing, you agree to {plugin.name}'s <span className="text-[#8A2BE2] cursor-pointer hover:underline">Terms of Use</span>.<br/>
              Read our <span className="text-[#8A2BE2] cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
            
            <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 hover:text-white transition">
               <X className="w-5 h-5"/>
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, scale: 0.95, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-md rounded-2xl overflow-hidden relative z-10 shadow-2xl"
          >
            <div className="p-8 flex flex-col items-center border-b border-gray-100">
              <div className="flex items-center justify-center gap-4 mb-6">
                 {/* CloserAI Logo Mock */}
                 <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">
                   CA
                 </div>
                 <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                   <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                   <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                 </div>
                 {/* Plugin Logo */}
                 <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm"
                    style={{ backgroundColor: plugin.iconBg, color: plugin.iconColor }}
                  >
                    {plugin.iconText}
                  </div>
              </div>

              <h2 className="text-xl font-semibold text-center text-gray-900 leading-snug">
                CloserAI would like access to your<br/>{plugin.name} account
              </h2>

              <div className="mt-4 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">
                  {userInitial}
                </div>
                <span className="text-xs text-gray-600">{user?.email}</span>
                <span className="text-[10px] text-blue-500 hover:underline cursor-pointer ml-1">Switch accounts</span>
              </div>
            </div>

            <div className="p-8 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-4">This will allow CloserAI to:</p>
              
              <ul className="space-y-3 mb-8">
                {['Read your user profile and account information', 'Read your design metadata', 'Create and modify designs', 'Read your folders and content', 'Publish brand templates to your team', 'Post comments on your behalf'].map((perm, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setStep(3)}
                  className="w-full py-3 bg-[#8A2BE2] hover:bg-[#9B30FF] text-white rounded-xl font-semibold transition-colors"
                >
                  Allow
                </button>
                <button 
                  onClick={onCancel}
                  className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-[10px] text-center text-gray-500 mt-6">
                By using CloserAI, you agree to its <span className="text-blue-500 hover:underline cursor-pointer">Terms</span> and <span className="text-blue-500 hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-md rounded-2xl p-12 flex flex-col items-center relative z-10 shadow-2xl"
          >
            <div className="w-20 h-20 bg-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(52,211,153,0.3)] rotate-3">
               <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authorization Successful!</h2>
            <p className="text-gray-500 text-sm text-center">
              Redirecting to application...
            </p>
            <p className="text-gray-400 text-xs text-center mt-2 max-w-[250px]">
              If the application doesn't open automatically, please ensure it's installed and running.
            </p>

            <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
