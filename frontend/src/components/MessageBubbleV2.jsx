import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Play, ThumbsUp, ThumbsDown, MessageSquareDiff, ShieldCheck, ShieldAlert, PhoneCall, Copy, Edit3, RefreshCw, MoreHorizontal, BookOpen, GitBranch, Volume2, Share2, Lightbulb, Globe, ArrowUp, Download, Eye } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { editAndResendMessage, branchConversation, sendMessage, sendMessageStreamAsync } from '../store/chatSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ShareModal from './ShareModal';
import VoicePlayer from './VoicePlayer';
import ChatImage from './ChatImage';
import FileCard from './FileCard';
import DataChart from './DataChart';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MOCK_PLUGINS } from '../pages/PluginStorePage';

const MOOD_EMOJIS = {
  sad: '😢',
  happy: '😊',
  angry: '😠',
  lonely: '😔',
  anxious: '😰',
  tired: '😴',
  excited: '🤩',
  calm: '😌',
  frustrated: '😣',
  neutral: '😐'
};

const MessageBubble = React.memo(function MessageBubble({ message, isGroup, onArtifactOpen, onCanvasArtifactOpen, onOpenCanvas, onOpenSources, onCodeRun }) {
  const isUser = message.sender === 'user';
  
  // Format timestamp helper
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const [rating, setRating] = useState(message.rating || 0);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState(message.feedbackText || '');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChangeResponse, setShowChangeResponse] = useState(false);
  const [changeInstruction, setChangeInstruction] = useState('');
  const moreActionsRef = useRef(null);
  const changeResponseRef = useRef(null);

  const handleAutoRefine = (instruction, filename) => {
    dispatch(sendMessageStreamAsync({
      message: `Edit the document "${filename}": ${instruction}. Do not explain, just give me the updated file.`,
      conversationId: message.conversationId
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target)) {
        setShowMoreActions(false);
      }
      if (changeResponseRef.current && !changeResponseRef.current.contains(event.target)) {
        setShowChangeResponse(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangeResponse = (type, customInstruction = '') => {
    setShowChangeResponse(false);
    let instruction = '';
    if (type === 'try_again') {
      instruction = 'Please regenerate your previous response with a better, more detailed answer.';
    } else if (type === 'think_longer') {
      instruction = 'Please think longer and provide a much more detailed, comprehensive, and deeply analyzed answer to my previous question.';
    } else if (type === 'search_web') {
      instruction = 'Please search the web for the latest information and provide an updated answer to my previous question.';
    } else if (type === 'custom') {
      if (!customInstruction.trim()) return;
      instruction = `Please rewrite your previous response. Follow these instructions: ${customInstruction}`;
      setChangeInstruction('');
    }

    dispatch(sendMessage({
      conversationId: message.conversationId,
      message: instruction
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
      .then(() => toast.success('Message copied!'))
      .catch(() => toast.error('Failed to copy.'));
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content && !message.isOptimistic) {
      dispatch(editAndResendMessage({
        conversationId: message.conversationId,
        messageId: message._id,
        newText: editContent
      }));
    }
    setIsEditing(false);
  };

  const handleBranchChat = async () => {
    setShowMoreActions(false);
    try {
      const resultAction = await dispatch(branchConversation({
        conversationId: message.conversationId,
        messageId: message._id
      }));
      if (branchConversation.fulfilled.match(resultAction)) {
        const newConversationId = resultAction.payload;
        window.open(`/chat/${newConversationId}`, '_blank');
      }
    } catch (err) {
      console.error('Branching failed');
    }
  };

  const handleReadAloud = () => {
    setShowMoreActions(false);
    
    // Dynamically import googleTTS to avoid circular deps or SSR issues
    import('../utils/tts').then(({ googleTTS }) => {
      if (isReading) {
        googleTTS.cancel();
        setIsReading(false);
        return;
      }
      
      const textToSpeak = message.content.replace(/```[\s\S]*?```/g, 'Code block omitted.');
      
      googleTTS.onEnd(() => setIsReading(false));
      setIsReading(true);
      googleTTS.speak(textToSpeak, 'te');
    });
  };

  const handleRate = async (val) => {
    if (isUser) return;
    setRating(val);
    try {
      await api.post(`/chat/message/${message._id}/feedback`, { rating: val });
    } catch (err) {
      console.error('Failed to save rating');
    }
  };

  const submitFeedbackText = async () => {
    if (!feedbackText.trim()) return;
    try {
      await api.post(`/chat/message/${message._id}/feedback`, { feedbackText });
      setShowFeedbackInput(false);
      setFeedbackSaved(true);
      setTimeout(() => setFeedbackSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save feedback text');
    }
  };

  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!message.content) return;
    setIsVerifying(true);
    try {
      const res = await api.post('/chat/verify', { fact: message.content });
      setVerificationResult(res.data);
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // Vibration effect removed due to browser intervention errors
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
      className={`flex w-full ${isUser ? 'mb-8 justify-end' : 'mb-12 justify-start'}`}
    >
      <div
        className={`relative max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed group ${
          isUser
            ? 'glass-bubble-user rounded-tr-sm ml-auto'
            : 'glass-bubble-ai text-text rounded-tl-sm mr-auto hover:shadow-card transition-shadow duration-300'
        }`}
      >
        {isGroup && isUser && message.userId?.fullName && (
          <div className="text-[10px] font-bold text-emerald-400 mb-1 tracking-wide">
            {message.userId.fullName}
          </div>
        )}
        {isEditing ? (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <textarea
              className="w-full bg-surface/20 border border-white/20 rounded-md p-2 text-white outline-none resize-y min-h-[60px]"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-1">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-white/10 rounded-md text-xs hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-white text-accent font-bold rounded-md text-xs hover:bg-gray-100 transition"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap word-break">
            {message.imageBase64 && (
              <div className="mb-3 rounded-xl overflow-hidden shadow-sm">
                <ChatImage src={message.imageBase64} alt="Uploaded attachment" conversationId={message.conversationId} />
              </div>
            )}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.attachments.map((att, idx) => (
                  <button
                    key={idx}
                    onClick={() => onCanvasArtifactOpen ? onCanvasArtifactOpen(att.data, 'txt') : null}
                    title="View Document"
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-accent" />
                    <span className="truncate max-w-[150px]">{att.name}</span>
                  </button>
                ))}
              </div>
            )}
            {message.audioUrl && (
              <div className="mb-3">
                <VoicePlayer audioUrl={message.audioUrl} />
              </div>
            )}
            
            {/* Smart Plugin Interceptors */}
            {(() => {
              const content = message.content || '';
              const installMatch = content.match(/\[INSTALL_PLUGIN:\s*([^\]]+)\]/);
              const suggestMatch = content.match(/\[SUGGEST_PLUGIN:\s*([^\]]+)\]/);
              const cleanContent = content.replace(/\[INSTALL_PLUGIN:\s*[^\]]+\]/g, '').replace(/\[SUGGEST_PLUGIN:\s*[^\]]+\]/g, '');
              
              const pluginId = installMatch ? installMatch[1].trim() : (suggestMatch ? suggestMatch[1].trim() : null);
              const plugin = pluginId ? MOCK_PLUGINS.find(p => p.id === pluginId) : null;

              return (
                <>
                  <div className={`prose prose-sm md:prose-base max-w-none break-words leading-relaxed ${isUser ? 'text-text/95' : 'text-text/95'} prose-headings:text-inherit prose-a:text-accent hover:prose-a:text-accent-light prose-strong:text-inherit prose-code:text-accent-light prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0`}>
                    {renderContent(cleanContent, isUser, onArtifactOpen, onCanvasArtifactOpen, onCodeRun, message.conversationId, handleAutoRefine)}
                  </div>
                  
                  {plugin && (
                    <div className="mt-4 p-4 rounded-xl border border-white/10 bg-[#1E1E1E] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                          style={{ backgroundColor: plugin.iconBg, color: plugin.iconColor }}
                        >
                          {plugin.iconText}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{plugin.name}</h4>
                          <p className="text-gray-400 text-xs mt-0.5">{installMatch ? 'Plugin installed successfully' : 'Recommended for this task'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          toast.success(`${plugin.name} ${installMatch ? 'is ready to use' : 'connected successfully'}!`);
                          if (suggestMatch) {
                            try {
                              await api.post('/api/plugins/toggle', { pluginName: plugin.id, isEnabled: true });
                            } catch(e) {}
                          }
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                          installMatch 
                            ? 'bg-green-500/20 text-green-400 cursor-default'
                            : 'bg-white text-black hover:bg-gray-200'
                        }`}
                      >
                        {installMatch ? 'Installed' : 'Connect Plugin'}
                      </button>
                    </div>
                  )}

                  {verificationResult && (
                    <div className={`mt-3 p-3 rounded-xl border text-sm ${
                      verificationResult.status === 'Verified' ? 'bg-emerald-500/10 border-emerald-500/30' :
                      verificationResult.status === 'False' ? 'bg-rose-500/10 border-rose-500/30' :
                      'bg-amber-500/10 border-amber-500/30'
                    }`}>
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {verificationResult.status === 'Verified' ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-rose-500" />}
                        <span className={verificationResult.status === 'Verified' ? 'text-emerald-500' : 'text-rose-500'}>
                          Fact Check: {verificationResult.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs mb-2">{verificationResult.explanation}</p>
                      {verificationResult.sources && verificationResult.sources.length > 0 && (
                        <div className="text-[10px] text-gray-500">
                          Sources:
                          {verificationResult.sources.map((s, i) => (
                            <a key={i} href={s} target="_blank" rel="noopener noreferrer" className="ml-1 text-accent hover:underline">{new URL(s).hostname.replace('www.', '')}</a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
            
          </div>
        )}
        
        {/* Action Buttons for User Message (Copy / Edit) */}
        {isUser && !isEditing && !message.isOptimistic && (
          <div className="absolute -bottom-6 right-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-bg/80 backdrop-blur-sm rounded-md px-1.5 py-1 border border-border/40 z-10">
            <button onClick={handleCopy} className="p-1 text-muted hover:text-text transition-colors cursor-pointer" title="Copy">
              <Copy className="w-3.5 h-3.5 pointer-events-none" />
            </button>
            <button onClick={() => setIsEditing(true)} className="p-1 text-muted hover:text-text transition-colors cursor-pointer" title="Edit">
              <Edit3 className="w-3.5 h-3.5 pointer-events-none" />
            </button>
          </div>
        )}

        {/* Emergency Override (Task 5) */}
        {!isUser && message.emergency && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs uppercase tracking-wide">
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Detected</span>
            </div>
            <button className="px-4 py-1.5 bg-rose-500 text-white font-bold rounded-lg text-xs hover:bg-rose-600 transition shadow-lg animate-pulse cursor-pointer">
              Call Amma
            </button>
          </div>
        )}

        {/* Phase 1: Inline Citations */}
        {!isUser && message.sources && message.sources.length > 0 && message.sources[0] !== 'Closer Logic Engine' && message.sources[0] !== 'Crisis Care Check-in' && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Sources
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, idx) => {
                let domain = '';
                try { domain = new URL(source).hostname.replace('www.', ''); } catch(e) { domain = source; }
                return (
                  <a key={idx} href={source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border/40 hover:border-accent hover:bg-accent/10 rounded-full transition-all group/link text-xs max-w-[200px]">
                    <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`} alt="favicon" className="w-3 h-3 rounded-full opacity-70 group-hover/link:opacity-100" onError={(e) => e.target.style.display='none'} />
                    <span className="text-muted group-hover/link:text-text truncate">{domain}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons for AI Message */}
        {!isUser && (
          <div className="absolute -bottom-8 left-1 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-bg/80 backdrop-blur-sm rounded-md px-2 py-1 border border-border/40 z-10">
            <button onClick={handleCopy} className="p-1 text-muted hover:text-text transition-colors cursor-pointer" title="Copy">
              <Copy className="w-4 h-4 pointer-events-none" />
            </button>
            <button onClick={() => handleRate(1)} className={`p-1 transition-colors cursor-pointer ${rating === 1 ? 'text-emerald-500' : 'text-muted hover:text-emerald-400'}`} title="Good response">
              <ThumbsUp className="w-4 h-4 pointer-events-none" />
            </button>
            <button onClick={() => { handleRate(-1); setShowFeedbackInput(!showFeedbackInput); }} className={`p-1 transition-colors cursor-pointer ${rating === -1 ? 'text-rose-500' : 'text-muted hover:text-rose-400'}`} title="Bad response">
              <ThumbsDown className="w-4 h-4 pointer-events-none" />
            </button>
            <button onClick={() => setShowShareModal(true)} className="p-1 text-muted hover:text-text transition-colors cursor-pointer" title="Share">
              <Share2 className="w-4 h-4 pointer-events-none" />
            </button>
            <button onClick={handleVerify} disabled={isVerifying} className={`p-1 transition-colors cursor-pointer ${isVerifying ? 'animate-spin text-accent' : 'text-muted hover:text-emerald-400'}`} title="Verify Fact (Hallucination Checker)">
              <ShieldCheck className="w-4 h-4 pointer-events-none" />
            </button>
            <div className="relative" ref={changeResponseRef}>
              <button onClick={() => setShowChangeResponse(!showChangeResponse)} className="p-1 text-muted hover:text-text transition-colors cursor-pointer" title="Ask to change response">
                <RefreshCw className="w-4 h-4 pointer-events-none" />
              </button>
              
              <AnimatePresence>
                {showChangeResponse && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute bottom-full left-0 mb-2 w-64 bg-panel border border-border rounded-xl shadow-xl p-2 z-20"
                  >
                    <div className="flex items-center bg-surface border border-white/5 rounded-lg p-1.5 mb-2 focus-within:border-white/20 transition-colors">
                      <input 
                        type="text" 
                        placeholder="Ask to change response" 
                        className="bg-transparent outline-none flex-1 px-2 text-xs text-white"
                        value={changeInstruction}
                        onChange={(e) => setChangeInstruction(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChangeResponse('custom', changeInstruction)}
                      />
                      <button onClick={() => handleChangeResponse('custom', changeInstruction)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors">
                        <ArrowUp className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleChangeResponse('try_again')} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-surface flex items-center gap-3 transition-colors">
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                        Try again
                      </button>
                      <button onClick={() => handleChangeResponse('think_longer')} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-surface flex items-center gap-3 transition-colors">
                        <Lightbulb className="w-4 h-4 text-gray-400" />
                        Think longer
                      </button>
                      <button onClick={() => handleChangeResponse('search_web')} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-surface flex items-center gap-3 transition-colors">
                        <Globe className="w-4 h-4 text-gray-400" />
                        Search the web
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative" ref={moreActionsRef}>
              <button onClick={() => setShowMoreActions(!showMoreActions)} className="p-1 text-muted hover:text-text transition-colors" title="More actions">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {showMoreActions && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-panel border border-border rounded-xl shadow-xl py-1 overflow-hidden z-20"
                  >
                    <button onClick={() => { setShowMoreActions(false); onOpenSources(message); }} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted" />
                      View sources
                    </button>
                    {onOpenCanvas && !isUser && message.content && (
                      <button onClick={() => { 
                        setShowMoreActions(false); 
                        const cleanContent = (message.content || '').replace(/\[INSTALL_PLUGIN:\s*[^\]]+\]/g, '').replace(/\[SUGGEST_PLUGIN:\s*[^\]]+\]/g, '');
                        const htmlContent = marked.parse(cleanContent);
                        onOpenCanvas(htmlContent); 
                      }} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-muted" />
                        Edit & Export Document
                      </button>
                    )}
                    <button onClick={handleBranchChat} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-muted" />
                      Branch in new chat
                    </button>
                    <button onClick={handleReadAloud} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface flex items-center gap-2">
                      <Volume2 className={`w-4 h-4 ${isReading ? 'text-accent animate-pulse' : 'text-muted'}`} />
                      {isReading ? 'Stop reading' : 'Read aloud'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Timestamp Row */}
        <div className="flex items-center justify-end mt-2 text-[10px] opacity-60">
          <span>{formatTime(message.timestamp || message.createdAt)}</span>
        </div>

        {/* Feedback Input Dropdown */}
        {!isUser && showFeedbackInput && (
          <div className="mt-2 flex items-center gap-2">
            <input 
              type="text" 
              className="flex-1 bg-surface border border-border rounded-md px-2 py-1 text-xs outline-none focus:border-accent text-text"
              placeholder="Suggest a correction..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <button onClick={submitFeedbackText} className="px-2 py-1 bg-accent text-white rounded-md text-xs hover:bg-accent/80 transition">
              Send
            </button>
          </div>
        )}
        {feedbackSaved && <span className="text-[10px] text-emerald-500 mt-1 block">Feedback saved. Thank you!</span>}
      </div>

      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        message={message}
        conversationTitle="Companion AI Conversation"
      />
    </motion.div>
  );
});
// ReactMarkdown code block parser
function renderContent(text, isUser, onArtifactOpen, onCanvasArtifactOpen, onCodeRun, conversationId, onAutoRefine) {
  if (isUser || !text) return text;
  
  // Intercept PDF_CONTENT
  const pdfMatch = text.match(/<PDF_CONTENT>([\s\S]*?)<\/PDF_CONTENT>/);
  let pdfContent = null;
  let remainingText = text;
  if (pdfMatch) {
    pdfContent = pdfMatch[1].trim();
    remainingText = text.replace(pdfMatch[0], '').trim();
  }

  // Intercept CHART block
  const chartMatch = remainingText.match(/<CHART>([\s\S]*?)<\/CHART>/);
  let chartConfig = null;
  if (chartMatch) {
    try {
      chartConfig = JSON.parse(chartMatch[1].trim());
      remainingText = remainingText.replace(chartMatch[0], '').trim();
    } catch (e) {
      console.error('Failed to parse CHART JSON', e);
    }
  }

  // Intercept VIDEO block
  const videoMatch = remainingText.match(/<VIDEO>([\s\S]*?)<\/VIDEO>/);
  let videoData = null;
  if (videoMatch) {
    try {
      videoData = JSON.parse(videoMatch[1].trim());
      remainingText = remainingText.replace(videoMatch[0], '').trim();
    } catch (e) {
      console.error('Failed to parse VIDEO JSON', e);
    }
  }

  // Intercept IMAGE block
  const imageMatch = remainingText.match(/<IMAGE>([\s\S]*?)<\/IMAGE>/);
  let imageUrl = null;
  if (imageMatch) {
    imageUrl = imageMatch[1].trim();
    remainingText = remainingText.replace(imageMatch[0], '').trim();
  }

  // Intercept AUDIO block
  const audioMatch = remainingText.match(/<AUDIO>([\s\S]*?)<\/AUDIO>/);
  let audioData = null;
  if (audioMatch) {
    try {
      audioData = JSON.parse(audioMatch[1].trim());
      remainingText = remainingText.replace(audioMatch[0], '').trim();
    } catch (e) {
      console.error('Failed to parse AUDIO JSON', e);
    }
  }

  // Intercept 3D block
  const threeDMatch = remainingText.match(/<3D>([\s\S]*?)<\/3D>/);
  let threeDData = null;
  if (threeDMatch) {
    try {
      threeDData = JSON.parse(threeDMatch[1].trim());
      remainingText = remainingText.replace(threeDMatch[0], '').trim();
    } catch (e) {
      console.error('Failed to parse 3D JSON', e);
    }
  }

  
  return (
    <>
      {pdfContent && (
        <div className="mb-4 bg-white text-black p-0 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
          <div className="bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-700 font-bold">
              <BookOpen className="w-5 h-5 text-rose-600" />
              <span>Generated Document (PDF)</span>
            </div>
            <button 
              onClick={() => {
                const element = document.getElementById(`pdf-render-${conversationId}`);
                if (window.html2pdf && element) {
                  window.html2pdf().set({
                    margin: 10,
                    filename: 'Closer_AI_Document.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                  }).from(element).save();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
          <div id={`pdf-render-${conversationId}`} className="p-8 bg-white max-h-[500px] overflow-y-auto print:max-h-none print:overflow-visible prose prose-sm max-w-none text-black">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {pdfContent}
            </ReactMarkdown>
          </div>
        </div>
      )}
      {chartConfig && <DataChart config={chartConfig} />}
      {videoData && (
        <div className="mb-4 bg-black rounded-xl overflow-hidden border border-border/30 relative shadow-lg">
          {videoData.status === 'processing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs font-bold text-accent">Generating Video...</p>
              <p className="text-[10px] text-muted max-w-xs text-center mt-1">"{videoData.prompt}"</p>
            </div>
          )}
          <video 
            src={videoData.url} 
            controls 
            autoPlay={videoData.status !== 'processing'} 
            loop 
            className="w-full max-h-[300px] object-cover"
          />
          <div className="p-2 bg-surface/80 border-t border-border/30 text-xs text-muted truncate">
            Prompt: {videoData.prompt}
          </div>
        </div>
      )}
      {imageUrl && (
        <div className="mb-4 bg-surface rounded-xl overflow-hidden border border-border/50 shadow-lg">
          <img src={imageUrl} alt="Generated AI Graphic" className="w-full object-cover" />
        </div>
      )}
      {audioData && (
        <div className="mb-4 p-4 bg-surface rounded-xl border border-border/50 shadow-lg flex flex-col gap-2">
          <div className="flex items-center gap-2 text-accent text-sm font-bold">
            <span className="material-icons text-base">music_note</span> AI Audio Track
          </div>
          <audio src={audioData.url} controls className="w-full" />
          <div className="text-xs text-muted truncate">Prompt: {audioData.prompt}</div>
        </div>
      )}
      {threeDData && (
        <div className="mb-4 bg-surface rounded-xl overflow-hidden border border-border/50 shadow-lg flex flex-col items-center justify-center p-4">
          <div className="w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center mb-2">
            <span className="text-gray-400 font-bold tracking-widest">[Interactive 3D Viewer Placeholder]</span>
          </div>
          <div className="text-xs text-accent truncate border border-accent/30 bg-accent/10 px-2 py-1 rounded w-full text-center">
            🔗 <a href={threeDData.url} target="_blank" rel="noreferrer" className="hover:underline">Download {threeDData.prompt} Asset (.glb)</a>
          </div>
        </div>
      )}
      {remainingText && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+(?:[:\w\.]+)?)/.exec(className || '');
          const lang = match ? match[1].toLowerCase() : '';
          const codeString = String(children).replace(/\n$/, '');

          let isFile = false;
          let filename = 'document.txt';

          if (!inline) {
            const cleanLang = lang.trim();
            if (cleanLang.startsWith('file:')) {
              isFile = true;
              let parsedName = cleanLang.split(':')[1] || 'document';
              
              // Remove any existing extension like .md to force proper pdf/docx generation
              if (parsedName.includes('.')) {
                parsedName = parsedName.split('.')[0];
              }
              filename = parsedName + '.pdf'; // Default to PDF for these formatted blocks
            } else if (['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'csv', 'zip'].includes(cleanLang)) {
              isFile = true;
              filename = `document.${cleanLang}`;
            }
          }

          if (isFile) {
            return <FileCard filename={filename} content={codeString} onAutoRefine={onAutoRefine} />;
          }

          const isRenderable = ['html', 'javascript', 'js', 'react', 'jsx', 'python', 'py', 'java', 'c', 'cpp', 'go', 'ruby', 'rust'].includes(lang);

          if (!inline && match) {
            return (
              <div className="mac-window">
                <div className="mac-header">
                  <div className="flex items-center gap-1.5 mr-2">
                    <div className="mac-dot mac-dot-red" />
                    <div className="mac-dot mac-dot-yellow" />
                    <div className="mac-dot mac-dot-green" />
                  </div>
                  <div className="flex items-center gap-2 flex-1 font-mono text-xs text-gray-400 justify-center">
                    <Code2 className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-wider">{lang}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(['html', 'jsx', 'react', 'javascript', 'js'].includes(lang)) ? (
                      <button 
                        onClick={() => onCanvasArtifactOpen ? onCanvasArtifactOpen(codeString, lang) : null}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 text-accent hover:bg-accent hover:text-white rounded-md transition font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Artifact</span>
                      </button>
                    ) : (onCodeRun || onArtifactOpen) && (
                      <button 
                        onClick={() => onCodeRun ? onCodeRun(codeString, lang) : onArtifactOpen(codeString, lang)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 text-accent hover:bg-accent hover:text-white rounded-md transition font-semibold cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Code</span>
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        const blob = new Blob([codeString], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        let ext = lang ? (lang === 'react' ? 'jsx' : lang === 'python' ? 'py' : lang === 'javascript' ? 'js' : lang === 'html' ? 'html' : lang === 'css' ? 'css' : lang === 'json' ? 'json' : lang === 'markdown' ? 'md' : lang) : 'txt';
                        if (ext.length > 5 || ext.includes(' ') || ext.includes('_')) {
                          ext = 'txt';
                        }
                        a.download = `closer-ai-artifact-${Date.now()}.${ext}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setTimeout(() => URL.revokeObjectURL(url), 2000);
                        toast.success('File downloaded successfully!', { icon: '⬇️', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
                      }}
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(codeString);
                        toast.success('Code copied!', { icon: '📋', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
                      }}
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-[13px] leading-relaxed">
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={lang}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                    }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              </div>
            );
          }
          return (
            <code className="bg-white/10 text-accent-light px-1.5 py-0.5 rounded-md font-mono text-[0.9em]" {...props}>
              {children}
            </code>
          );
        },
        p({ node, children }) {
          if (node && node.children && node.children.some(n => n.tagName === 'img')) {
            return <>{children}</>;
          }
          return <p className="mb-1.5 last:mb-0 leading-relaxed text-[15px]">{children}</p>;
        },
        h1({ children }) { return <h1 className="text-2xl font-bold mt-6 mb-4 font-outfit text-white">{children}</h1>; },
        h2({ children }) { return <h2 className="text-xl font-bold mt-5 mb-3 font-outfit text-white">{children}</h2>; },
        h3({ children }) { return <h3 className="text-lg font-bold mt-4 mb-2 font-outfit text-white">{children}</h3>; },
        ul({ children }) { return <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>; },
        ol({ children }) { return <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>; },
        li({ children }) { return <li className="mb-1 leading-relaxed">{children}</li>; },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-accent bg-accent/5 pl-4 py-2 pr-4 my-4 rounded-r-lg italic text-gray-300">
              {children}
            </blockquote>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto mb-4 border border-border/50 rounded-lg">
              <table className="w-full text-left border-collapse text-sm">{children}</table>
            </div>
          );
        },
        th({ children }) { return <th className="bg-surface/50 border-b border-border/50 p-3 font-semibold">{children}</th>; },
        td({ children }) { return <td className="border-b border-border/30 p-3">{children}</td>; },
        img({ src, alt }) {
          return (
            <ChatImage src={src} alt={alt} conversationId={conversationId} />
          );
        }
      }}
    >
      {(() => {
        // Task 7.1: Streaming UI Glitches (Markdown Buffering)
        // If there's an odd number of ``` (unclosed code block), append ``` to fix layout during streaming
        const backtickMatches = remainingText.match(/```/g);
        if (backtickMatches && backtickMatches.length % 2 !== 0) {
          return remainingText + '\n```';
        }
        return remainingText;
      })()}
    </ReactMarkdown>
      )}
    </>
  );
}

export default MessageBubble;
