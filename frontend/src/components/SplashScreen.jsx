import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { Brain } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600); // Wait for exit animation
    }, 2500); // Splash screen duration 2.5s

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'backOut' }}
            className="flex flex-col items-center"
          >
            <div className="relative flex items-center justify-center w-32 h-32 mb-6">
              <Brain className="w-full h-full text-violet-400 drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]" />
            </div>
            
            <h1 className="text-3xl font-bold text-white tracking-wider mb-2">
              CloserAI
            </h1>
            <p className="text-violet-300 tracking-widest splash-tagline uppercase text-sm font-medium">
              Universal Intelligence OS
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
