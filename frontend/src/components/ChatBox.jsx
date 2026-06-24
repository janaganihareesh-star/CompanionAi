import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubbleV2';
import TypingIndicator from './TypingIndicator';
import AIAvatar from './AIAvatar';
import { Send, Paperclip, Mic, MicOff, Image as ImageIcon, X, Share2, MoreHorizontal, Pin, Archive, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { playPopSound, playChimeSound } from '../utils/soundUtils';

export default function ChatBox({
  inputText,
  setInputText,
  handleInputChange,
  handleSend,
  messages = [],
  companionName = 'Companion',
  language = 'English',
  isSending = false,
  isLoading = false,
  messagesEndRef,
  onImageSelect,
  onVoiceRecordStart,
  onArtifactOpen,
  onOpenSources,
  currentConversation,
  onShareConversation,
  onPin,
  onArchive,
  onDelete,
  isSidebarOpen = true,
  streamingMessage = ''
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const moreActionsRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [preRecordText, setPreRecordText] = useState('');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const prevIsSendingRef = useRef(isSending);

  useEffect(() => {
    if (prevIsSendingRef.current && !isSending) {
      // AI just finished replying
      playChimeSound();
    }
    prevIsSendingRef.current = isSending;
  }, [isSending]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      const getLangCode = (lang) => {
        const langMap = {
          'Telugu': 'te-IN',
          'Hindi': 'hi-IN',
          'Tamil': 'ta-IN',
          'Kannada': 'kn-IN',
          'Malayalam': 'ml-IN',
          'English': 'en-IN'
        };
        return langMap[lang] || 'en-IN';
      };
      recognition.lang = getLangCode(language);

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }
        
        setInterimText(currentInterim);

        if (finalTranscript) {
          setInputText((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
        }
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error", e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [setInputText]);

  const startDictation = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser.');
      return;
    }
    setPreRecordText(inputText);
    setInterimText('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Listening... speak now.');
    } catch (err) {
      console.error(err);
    }
  };

  const cancelDictation = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInputText(preRecordText); // Restore previous text
    setInterimText('');
    toast('Voice recording cancelled.', { icon: '🚫' });
  };

  const finishDictation = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    const finalAutoSendText = (inputText + ' ' + interimText).trim();
    setInterimText('');
    if (finalAutoSendText) {
      handleSend(null, selectedImage, finalAutoSendText);
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target)) {
        setShowMoreActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result);
          if (onImageSelect) onImageSelect(reader.result, compressedFile);
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.error('Image compression failed', err);
        toast.error('Failed to compress image');
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend(e, selectedImage);
    setSelectedImage(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg justify-between relative overflow-hidden">
      {/* Header */}
      <div className={`bg-surface border-b border-border/40 p-4 flex justify-between items-center z-10 shadow-sm transition-all duration-300 ${!isSidebarOpen ? 'pl-28' : ''}`}>
        <div className="flex items-center gap-3">
          <AIAvatar size="w-10 h-10" emoji="🤖" status="online" />
          <div className="text-left">
            <h4 className="font-bold text-text font-outfit text-sm">{companionName}</h4>
            <span className="text-[10px] text-emerald font-semibold">Online</span>
          </div>
        </div>
        
        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (!currentConversation) {
                toast('Start chatting first to share!', { icon: '💬' });
                return;
              }
              onShareConversation();
            }}
            className={`px-3 py-1.5 flex items-center gap-2 text-xs font-semibold border border-border/40 rounded-full transition-colors cursor-pointer ${!currentConversation ? 'text-muted cursor-not-allowed opacity-50' : 'text-text hover:bg-surface'}`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <div className="relative" ref={moreActionsRef}>
            <button 
              onClick={() => {
                if (!currentConversation) {
                  toast('Start chatting first to use options!', { icon: '💬' });
                  return;
                }
                setShowMoreActions(!showMoreActions);
              }}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${!currentConversation ? 'text-muted cursor-not-allowed opacity-50' : 'text-muted hover:text-text hover:bg-surface'}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMoreActions && currentConversation && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-panel border border-border rounded-xl shadow-xl py-1 overflow-hidden z-50"
                >
                  <button onClick={() => { setShowMoreActions(false); onPin(currentConversation._id, !currentConversation.isPinned); }} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface flex items-center gap-2 cursor-pointer">
                    <Pin className={`w-4 h-4 ${currentConversation.isPinned ? 'fill-accent text-accent' : 'text-muted'}`} />
                    {currentConversation.isPinned ? 'Unpin chat' : 'Pin chat'}
                  </button>
                  <button onClick={() => { setShowMoreActions(false); onArchive(currentConversation._id); }} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface flex items-center gap-2 cursor-pointer">
                    <Archive className="w-4 h-4 text-muted" />
                    Archive
                  </button>
                  <button onClick={() => { setShowMoreActions(false); onDelete(currentConversation._id); }} className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col space-y-6 w-full animate-pulse">
            <div className="flex justify-end">
              <div className="h-10 w-48 bg-white/5 rounded-2xl rounded-tr-sm"></div>
            </div>
            <div className="flex justify-start">
              <div className="h-16 w-64 bg-white/5 rounded-2xl rounded-tl-sm"></div>
            </div>
            <div className="flex justify-end">
              <div className="h-12 w-56 bg-white/5 rounded-2xl rounded-tr-sm"></div>
            </div>
            <div className="flex justify-start">
              <div className="h-20 w-72 bg-white/5 rounded-2xl rounded-tl-sm"></div>
            </div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => <MessageBubble key={msg._id} message={msg} onArtifactOpen={onArtifactOpen} onOpenSources={onOpenSources} />)
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-muted">
            <AIAvatar size="w-16 h-16" status={null} ringColor="border-border/30" />
            <div className="space-y-1">
              <h4 className="font-bold font-outfit text-text text-lg">Say something to {companionName}</h4>
              <p className="text-xs max-w-xs leading-relaxed text-muted">
                Start chatting to share your feelings, ask questions, or just have a fun conversation.
              </p>
            </div>
          </div>
        )}
        
        {/* Render Streaming Message if exists */}
        {isSending && streamingMessage && (
          <MessageBubble 
            key="streaming-temp" 
            message={{ _id: 'streaming-temp', sender: 'ai', content: streamingMessage + '█', mood: 'neutral' }} 
            onArtifactOpen={onArtifactOpen} 
            onOpenSources={onOpenSources} 
          />
        )}
        
        {/* Typing Indicator (Only show if not streaming yet) */}
        {isSending && !streamingMessage && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Panel Box */}
      <div className="bg-surface border-t border-border/40 p-4">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleFormSubmit} className="flex gap-2 items-center bg-panel border border-border rounded-xl px-2 py-2 focus-within:border-accent transition">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-muted hover:text-accent transition flex-shrink-0 cursor-pointer"
            title="Attach Image"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>
          
          {isListening ? (
            <div className="flex-1 flex items-center justify-between bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 h-10 overflow-hidden">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                <span className="text-sm font-bold text-rose-500 flex-shrink-0">Listening...</span>
                <span className="text-sm text-text truncate opacity-80">{interimText || 'Speak now...'}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={cancelDictation}
                  className="text-xs font-bold text-muted hover:text-rose-500 transition cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={finishDictation}
                  className="w-6 h-6 flex items-center justify-center bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition shadow-md cursor-pointer"
                  title="Done"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </motion.button>
              </div>
            </div>
          ) : (
            <>
              <textarea
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e);
                  }
                }}
                placeholder={`Message ${companionName}...`}
                className="flex-1 bg-transparent text-text placeholder:text-muted outline-none resize-none h-10 py-2 transition text-sm leading-relaxed max-h-24 custom-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={startDictation}
                className="p-2 text-muted hover:text-accent transition flex-shrink-0 cursor-pointer rounded-full"
                title="Record Voice"
              >
                <Mic className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={!inputText.trim() && !selectedImage}
                className="w-10 h-10 flex items-center justify-center bg-accent text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition shadow-md cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </motion.button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}