import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ children, text, position = 'bottom', className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  const getPositionStyles = () => {
    switch (position) {
      case 'top': return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
      case 'bottom': return 'top-full mt-2 left-1/2 -translate-x-1/2';
      case 'left': return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right': return 'left-full ml-2 top-1/2 -translate-y-1/2';
      default: return 'top-full mt-2 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[100] px-2 py-1 bg-surface border border-border shadow-card rounded text-[10px] font-bold text-text whitespace-nowrap pointer-events-none ${getPositionStyles()}`}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
