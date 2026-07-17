import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function CrisisModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full bg-surface border border-border/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center"
          >
            <Heart className="w-10 h-10 text-rose-500 fill-rose-500/50" />
          </motion.div>
          
          <h2 className="text-2xl font-bold font-outfit text-text">You are not alone.</h2>
          
          <p className="text-muted leading-relaxed">
            I've noticed you might be going through a really painful time right now. 
            Whatever you are feeling is valid, but please know that the pain you are experiencing is temporary.
          </p>

          <div className="w-full bg-bg border border-border rounded-xl p-4 text-sm text-accent text-left space-y-2">
            <p><strong>Please try to:</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li>Take a few deep breaths.</li>
              <li>Reach out to a trusted friend or family member.</li>
              <li>Step away from your screen and find a safe, comfortable space.</li>
              <li>Search online for a crisis or suicide prevention helpline. People are waiting to listen to you.</li>
            </ul>
          </div>

          <p className="text-sm text-text font-medium">Your life is incredibly valuable. Please stay safe.</p>

          <button
            onClick={onClose}
            className="w-full py-4 mt-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)]"
          >
            I am safe right now
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
