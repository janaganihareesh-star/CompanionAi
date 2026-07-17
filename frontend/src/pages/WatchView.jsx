import React, { useState } from 'react';
import { Mic, CheckCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { sendMessageStreamAsync } from '../store/chatSlice';

export default function WatchView() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Tap to speak');
  const dispatch = useDispatch();

  const handleMicTap = () => {
    if (isListening) return;
    setIsListening(true);
    setStatus('Listening...');
    
    // Simulate speech recognition for Watch
    setTimeout(() => {
      setStatus('Processing...');
      // Fake sending message to backend
      dispatch(sendMessageStreamAsync({
        message: 'Hello from Apple Watch!',
        conversationId: localStorage.getItem('activeConversationId') || 'watch_conv'
      }));
      setTimeout(() => {
        setStatus('Sent!');
        setIsListening(false);
        setTimeout(() => setStatus('Tap to speak'), 2000);
      }, 1000);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white p-2 overflow-hidden">
      <div 
        onClick={handleMicTap}
        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isListening ? 'bg-rose-500 scale-110 animate-pulse' : 'bg-[#1A1A24] hover:bg-[#2A2A35]'} border-2 ${isListening ? 'border-rose-400' : 'border-[#2A2A35]'}`}
      >
        {status === 'Sent!' ? <CheckCircle className="w-8 h-8 text-emerald-400" /> : <Mic className={`w-8 h-8 ${isListening ? 'text-white' : 'text-[#7C3AED]'}`} />}
      </div>
      <p className="mt-4 text-[10px] font-medium text-center text-gray-400 uppercase tracking-widest">{status}</p>
    </div>
  );
}
