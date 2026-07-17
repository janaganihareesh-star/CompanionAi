import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import useVoice from '../hooks/useVoice';
import useAuth from '../hooks/useAuth';
import { fetchPreferences } from '../store/settingsSlice';
import Sidebar from '../components/Sidebar';
import ChatSidebar from '../components/ChatSidebar';
import { updateConversation, deleteConversation } from '../store/chatSlice';
import { Menu, Sparkles, Share2, MoreHorizontal, Pin, Archive, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import VoiceCallOverlay from '../components/VoiceCallOverlay';
import LiveNativeVoice from '../components/LiveNativeVoice';

export default function VoicePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    fetchConversations,
    setCurrentConversation,
  } = useVoice();

  const pref = useSelector((state) => state.settings.preferences);
  const mode = useSelector((state) => state.theme?.mode || 'dark');
  const companionName = pref ? pref.aiName : 'Closer';
  const isDark = mode === 'dark';

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [useNativeAudio, setUseNativeAudio] = useState(false);
  
  const appStoreSafeMode = useSelector((state) => state.settings?.preferences?.appStoreSafeMode || false);
  
  const moreActionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target)) {
        setShowMoreActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && user._id) {
      dispatch(fetchPreferences());
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Handle URL ID changes
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const voiceId = pathParts[pathParts.length - 1];
    
    if (voiceId && voiceId !== 'voice' && voiceId.length === 24) {
      if (!currentConversation || currentConversation._id !== voiceId) {
        setCurrentConversation({ _id: voiceId });
        // Instead of fetchMessages, VoiceCallOverlay will handle it if needed
      }
    } else if (currentConversation) {
      setCurrentConversation(null);
    }
  }, [window.location.pathname]);

  const handleNewChat = () => {
    setCurrentConversation(null);
    navigate('/voice');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this voice chat history?')) {
      dispatch(deleteConversation(id));
      if (currentConversation?._id === id) {
        handleNewChat();
      }
      setTimeout(() => fetchConversations(), 500);
    }
  };

  const darkGrad = 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
  const lightGrad = 'linear-gradient(180deg, #eef2f3 0%, #8e9eab 100%)';

  return (
    <div className="flex h-screen bg-bg text-text font-inter overflow-hidden relative">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      {/* Main Sidebar (Icon only) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Voice Chat Sidebar (Recents, Pinned, etc) */}
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
        conversations={conversations}
        currentConversation={currentConversation}
        setCurrentConversation={(conv) => {
          setCurrentConversation(conv);
          navigate(`/voice/${conv._id}`);
        }}
        handleDelete={handleDelete}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleNewChat={handleNewChat}
        onRename={(id, title) => dispatch(updateConversation({ id, updates: { title } })).then(() => fetchConversations())}
        onPin={(id, isPinned) => dispatch(updateConversation({ id, updates: { isPinned } })).then(() => fetchConversations())}
        onArchive={(id) => dispatch(updateConversation({ id, updates: { isArchived: true } })).then(() => fetchConversations())}
        onShare={(id) => {
          const shareLink = `${window.location.origin}/share/voice/${id}`;
          navigator.clipboard.writeText(shareLink)
            .then(() => toast.success('Link copied!'))
            .catch(() => toast.error('Failed to copy link.'));
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative" style={{ background: isDark ? darkGrad : lightGrad }}>
        
        {/* Top Floating Bar */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-surface/50 border border-border/30 text-muted hover:text-text rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
                title="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 bg-surface/50 px-3 py-2 rounded-xl border border-border/30 backdrop-blur-sm ml-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold font-outfit tracking-wide">{companionName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setUseNativeAudio(!useNativeAudio)}
              className={`px-3 py-2 flex items-center gap-2 text-sm font-semibold border rounded-xl backdrop-blur-sm transition-colors cursor-pointer ${useNativeAudio ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-border/40 text-muted hover:bg-surface bg-surface/50'}`}
              title="Toggle End-to-End Native Audio (Bidi WebSockets)"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">{useNativeAudio ? 'Native Audio Active' : 'Enable Native Audio'}</span>
            </button>

            <button 
              onClick={() => {
                if (!currentConversation) {
                  toast('Start voice chat first to share!', { icon: '💬' });
                  return;
                }
                const shareLink = `${window.location.origin}/share/voice/${currentConversation._id}`;
                navigator.clipboard.writeText(shareLink)
                  .then(() => toast.success('Link copied!'))
                  .catch(() => toast.error('Failed to copy link.'));
              }}
              className={`px-3 py-2 flex items-center gap-2 text-sm font-semibold border border-border/40 rounded-xl backdrop-blur-sm transition-colors cursor-pointer ${!currentConversation ? 'text-muted cursor-not-allowed opacity-50 bg-surface/30' : 'text-text hover:bg-surface bg-surface/50'}`}
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <div className="relative" ref={moreActionsRef}>
              <button 
                onClick={() => {
                  if (!currentConversation) {
                    toast('Start voice chat first to use options!', { icon: '💬' });
                    return;
                  }
                  setShowMoreActions(!showMoreActions);
                }}
                className={`p-2 rounded-xl backdrop-blur-sm border border-border/40 transition-colors cursor-pointer ${!currentConversation ? 'text-muted cursor-not-allowed opacity-50 bg-surface/30' : 'text-text hover:bg-surface bg-surface/50'}`}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showMoreActions && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-panel border border-border rounded-xl shadow-xl py-1 z-50 overflow-hidden"
                  >
                    <button 
                      onClick={() => {
                        dispatch(updateConversation({ id: currentConversation._id, updates: { isPinned: !currentConversation.isPinned } })).then(() => fetchConversations());
                        setShowMoreActions(false);
                      }} 
                      className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface flex items-center gap-2 transition-colors"
                    >
                      <Pin className="w-4 h-4 text-muted" />
                      {currentConversation?.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                    </button>
                    <button 
                      onClick={() => {
                        dispatch(updateConversation({ id: currentConversation._id, updates: { isArchived: true } })).then(() => { fetchConversations(); handleNewChat(); });
                        setShowMoreActions(false);
                      }} 
                      className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface flex items-center gap-2 transition-colors"
                    >
                      <Archive className="w-4 h-4 text-muted" />
                      Archive Chat
                    </button>
                    <div className="border-t border-border/50 my-1"></div>
                    <button 
                      onClick={() => { handleDelete(currentConversation._id); setShowMoreActions(false); }} 
                      className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Chat
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Inline Voice OS Duplex Area */}
        <div className="flex-1 w-full h-full relative">
          {appStoreSafeMode ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 mb-6 rounded-full bg-surface border-4 border-border flex items-center justify-center shadow-xl">
                <ShieldAlert className="w-10 h-10 text-muted" />
              </div>
              <h2 className="text-2xl font-bold font-outfit text-text mb-3">Feature Unavailable</h2>
              <p className="text-muted max-w-md">Live Voice modes are disabled while App Store Safe Mode is active to comply with standard review guidelines.</p>
            </div>
          ) : useNativeAudio ? (
            <LiveNativeVoice companionName={companionName} />
          ) : (
            <VoiceCallOverlay 
              onClose={() => navigate('/')} 
              currentConversation={currentConversation} 
              companionName={companionName}
              isInline={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
