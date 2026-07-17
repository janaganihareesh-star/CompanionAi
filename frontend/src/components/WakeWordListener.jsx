import React, { useEffect, useState } from 'react';
import annyang from 'annyang';

export default function WakeWordListener({ onWakeWord }) {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (annyang) {
      // Define the wake word command
      const commands = {
        'hey closer': () => {
          console.log('[Omniscient OS] Wake word detected!');
          if (onWakeWord) onWakeWord();
        },
        'closer wake up': () => {
          console.log('[Omniscient OS] Wake word detected!');
          if (onWakeWord) onWakeWord();
        }
      };

      annyang.addCommands(commands);
      
      // Start listening silently in the background
      annyang.start({ autoRestart: true, continuous: false });
      setIsListening(true);

      return () => {
        annyang.abort();
      };
    }
  }, [onWakeWord]);

  if (!isListening) return null;

  return (
    <div className="fixed bottom-2 right-2 flex items-center gap-2 bg-[#050511]/80 px-3 py-1 rounded-full border border-[#00FFCC]/20 backdrop-blur-md text-[10px] text-[#00FFCC]/70 pointer-events-none">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
      Listening for "Hey Closer"
    </div>
  );
}
