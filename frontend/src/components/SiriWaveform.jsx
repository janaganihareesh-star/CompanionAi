import React from 'react';
import { motion } from 'framer-motion';

export default function SiriWaveform({ isActive = false, color = '#7C3AED' }) {
  // A set of 5 animated bars for a simple Siri/ChatGPT style waveform
  const bars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center justify-center gap-1.5 h-12">
      {bars.map((bar, i) => {
        // Different random heights for organic feel
        const heights = [
          ['12px', '24px', '16px', '12px'],
          ['16px', '32px', '20px', '16px'],
          ['20px', '40px', '24px', '20px'],
          ['16px', '32px', '20px', '16px'],
          ['12px', '24px', '16px', '12px']
        ];

        return (
          <motion.div
            key={i}
            animate={
              isActive
                ? { height: heights[i], opacity: [0.7, 1, 0.7] }
                : { height: '8px', opacity: 0.5 }
            }
            transition={
              isActive
                ? {
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: i * 0.15
                  }
                : { duration: 0.3 }
            }
            style={{
              width: '6px',
              backgroundColor: color,
              borderRadius: '4px',
              boxShadow: isActive ? `0 0 8px ${color}` : 'none'
            }}
          />
        );
      })}
    </div>
  );
}
