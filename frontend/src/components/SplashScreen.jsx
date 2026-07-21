import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

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
              <img 
                src="/logo.png" 
                alt="Companion AI Logo" 
                className="w-full h-full object-contain rounded-full shadow-2xl ring-4 ring-violet-500/50"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            
            <h1 className="text-3xl font-bold text-white tracking-wider mb-2">
              Companion AI
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
