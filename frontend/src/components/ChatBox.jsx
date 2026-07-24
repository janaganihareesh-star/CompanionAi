import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubbleV2';
import TypingIndicator from './TypingIndicator';
import AIAvatar from './AIAvatar';
import LiveVision from './LiveVision';
import AgentTerminal from './AgentTerminal';
import { Send, Paperclip, Mic, MicOff, Image as ImageIcon, X, Share2, MoreHorizontal, Pin, Archive, Trash2, Cloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { playPopSound, playChimeSound } from '../utils/soundUtils';
import { extractTextFromFile } from '../utils/fileParser';
import GoogleDrivePicker from './GoogleDrivePicker';

function SmoothStreamBubble({ streamingMessage, onArtifactOpen, onCanvasArtifactOpen, onOpenSources, messagesEndRef, isAtBottom }) {
  // Direct render to prevent browser tab crash (OOM) caused by 
  // rendering heavy ReactMarkdown at 60fps in the previous requestAnimationFrame loop.
  return (
    <MessageBubble 
      key="streaming-temp" 
      message={{ _id: 'streaming-temp', sender: 'ai', content: (streamingMessage || '') + ' ⚡', mood: 'neutral' }} 
      onArtifactOpen={onArtifactOpen} 
      onCanvasArtifactOpen={onCanvasArtifactOpen}
      onOpenCanvas={onArtifactOpen} 
      onOpenSources={onOpenSources} 
    />
  );
}


const ChatBox = React.memo(function ChatBox({
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
  onCanvasArtifactOpen,
  onOpenSources,
  currentConversation,
  onShareConversation,
  onPin,
  onArchive,
  onDelete,
  isSidebarOpen = true,
  streamingMessage = '',
  onCodeRun,
  minimalMode,
  socket,
  onStopGeneration,
  onContinue,
  headerActions
}) {
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const moreActionsRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [preRecordText, setPreRecordText] = useState('');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const prevIsSendingRef = useRef(isSending);
  const [isLiveVision, setIsLiveVision] = useState(false);
  const [latestVideoFrame, setLatestVideoFrame] = useState(null);
  
  const chatContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Allow a 150px threshold for being "at the bottom"
    const atBottom = scrollHeight - scrollTop - clientHeight < 150;
    setIsAtBottom(atBottom);
  };

  const scrollToBottom = () => {
    if (messagesEndRef && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setIsAtBottom(true);
    }
  };

  // Robust Auto-Scroll Mechanism
  useEffect(() => {
    // If we are sending a message, or streaming, or at the bottom, auto-scroll.
    if ((isAtBottom || isSending) && messagesEndRef?.current) {
      // Use requestAnimationFrame to ensure DOM has painted the latest messages/bubbles
      requestAnimationFrame(() => {
        messagesEndRef.current.scrollIntoView({
          behavior: 'auto', // use auto for instant sticking to bottom during stream to avoid queue lag
          block: 'end'
        });
      });
    }
  }, [messages, isSending, streamingMessage, messagesEndRef]);

  // Force scroll to bottom when a new conversation loads
  useEffect(() => {
    if (messagesEndRef?.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        setIsAtBottom(true);
      }, 100);
    }
  }, [currentConversation?._id]);

  useEffect(() => {
    if (window.visualViewport) {
      const handleResize = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      };
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, []);

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
    if (finalAutoSendText || attachments.length > 0) {
      handleSend(null, attachments, finalAutoSendText);
      setAttachments([]);
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
    if (!file) return;

    try {
      const ext = file.name.split('.').pop().toLowerCase();
      
      // Handle Images
      if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext)) {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments(prev => [...prev, { type: 'image', name: file.name, data: reader.result, mimeType: file.type }]);
        };
        reader.readAsDataURL(compressedFile);
        return;
      }

      // Handle Datasets (CSV, Excel, JSON) - Upload to backend for Deep Data Analysis
      if (['csv', 'xlsx', 'xls', 'json'].includes(ext)) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const token = localStorage.getItem('closer-token');
          // Using standard fetch or axios, since we need to upload
          const uploadRes = await fetch('/api/document/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });
          const data = await uploadRes.json();
          if (data.success) {
            setAttachments(prev => [...prev, { type: 'dataset', name: file.name, data: data.filePath }]);
            toast.success('Dataset uploaded for Deep Data Analysis');
          } else {
            toast.error(data.message || 'Upload failed');
          }
        } catch (err) {
           console.error(err);
           toast.error('Failed to upload dataset');
        }
        return;
      }

      // Handle Text/Document parsing for PDF, DOCX, TXT, etc.
      if (['pdf', 'docx', 'doc', 'txt', 'md', 'js', 'html', 'css'].includes(ext)) {
        try {
          const extractedText = await extractTextFromFile(file, ext);
          setAttachments(prev => [...prev, { type: 'document', name: file.name, data: extractedText }]);
        } catch (err) {
          console.error('Text extraction failed', err);
          toast.error(`Parse Error: ${err.message || 'Unknown error'}`);
        }
        return;
      }

      toast.error('Unsupported file format');

    } catch (err) {
      console.error('File processing failed', err);
      toast.error('Could not process file');
    }
  };

  const handleGoogleDriveFilePicked = (driveAttachments) => {
    // driveAttachments array contains { id, name, mimeType, url, source, size, content }
    const newAttachments = driveAttachments.map(file => ({
      type: 'document',
      name: file.name,
      data: file.content,
      source: file.source,
      url: file.url
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend(e, attachments);
    setAttachments([]);
    setLatestVideoFrame(null); // Clear the frame after sending
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg justify-between relative overflow-hidden">
      {/* Header */}
      <div className={`bg-surface border-b border-border/40 p-4 flex justify-between items-center z-10 shadow-sm transition-all duration-300 ${!isSidebarOpen ? 'pl-28 md:pl-4' : ''}`}>
        <div className="flex items-center gap-3">
          {headerActions && <div className="flex items-center">{headerActions}</div>}
          <AIAvatar size="w-10 h-10" emoji="🤖" status="online" />
          <div className="text-left">
            <h4 className="font-bold text-text font-outfit text-sm">{companionName}</h4>
            <span className="text-[10px] text-emerald font-semibold">Online</span>
          </div>
        </div>
        
        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          {isOffline && (
            <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse backdrop-blur-md">
              <span>⚡ OFFLINE</span>
            </div>
          )}
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
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 transform-gpu flex flex-col relative" 
        style={{ transform: 'translateZ(0)' }}
      >
        <AgentTerminal socket={socket} />
        
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
          messages.map((msg) => <MessageBubble key={msg._id} message={msg} onArtifactOpen={onArtifactOpen} onCanvasArtifactOpen={onCanvasArtifactOpen} onOpenCanvas={onArtifactOpen} onOpenSources={onOpenSources} />)
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-muted">
            <AIAvatar size="w-16 h-16" emoji="🤖" status={null} ringColor="border-border/30" />
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
          <SmoothStreamBubble 
            streamingMessage={streamingMessage}
            onArtifactOpen={onArtifactOpen}
            onCanvasArtifactOpen={onCanvasArtifactOpen}
            onOpenSources={onOpenSources}
            messagesEndRef={messagesEndRef}
            isAtBottom={isAtBottom}
          />
        )}
        
        {/* Typing Indicator (Only show if not streaming yet) */}
        {isSending && !streamingMessage && <TypingIndicator />}
        
        {/* Continue Generating feature removed due to false positives */}        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-8 bg-surface border border-border hover:border-accent text-accent p-2.5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] z-40 backdrop-blur-md transition-all animate-bounce"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
        </button>
      )}

      {/* Input Panel Box */}
      <div className="bg-surface border-t border-border/40 p-4">
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, idx) => (
              <div key={idx} className="relative inline-block">
                {file.type === 'image' ? (
                  <img src={file.data} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border" />
                ) : (
                  <div className="h-16 w-16 flex flex-col items-center justify-center bg-gray-800 text-white rounded-lg border border-border text-xs text-center p-1 overflow-hidden">
                    <span className="font-bold">{file.type.toUpperCase()}</span>
                    <span className="text-[9px] truncate w-full">{file.name}</span>
                  </div>
                )}
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 cursor-pointer z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-center bg-panel border border-border rounded-xl px-2 py-2 focus-within:border-accent transition">
          <input
            type="file"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
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
            title="Attach File"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>
          
          <GoogleDrivePicker onFilePicked={handleGoogleDriveFilePicked}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-muted hover:text-[#4285F4] transition flex-shrink-0 cursor-pointer"
              title="Attach from Google Drive"
            >
              <Cloud className="w-5 h-5" />
            </motion.div>
          </GoogleDrivePicker>
          
          <LiveVision 
            isActive={isLiveVision} 
            setIsActive={setIsLiveVision} 
            onFrameCaptured={(frameBase64) => {
              // We store the latest frame so that when the user submits, it goes with the message
              setLatestVideoFrame(frameBase64);
            }} 
          />
          
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
                name="chat-message-input"
                id="chat-message-input"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
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
              
              {isSending ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onStopGeneration}
                  className="w-10 h-10 flex items-center justify-center bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-xl hover:bg-rose-500/20 transition shadow-md cursor-pointer flex-shrink-0"
                  title="Stop Generating"
                >
                  <div className="w-3.5 h-3.5 bg-rose-500 rounded-sm"></div>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={!inputText.trim() && attachments.length === 0}
                  className="w-10 h-10 flex items-center justify-center bg-accent text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition shadow-md cursor-pointer flex-shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default ChatBox;