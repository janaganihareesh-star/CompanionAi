import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import useChat from '../hooks/useChat';
import useAuth from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import { fetchPreferences } from '../store/settingsSlice';
import Sidebar from '../components/Sidebar';
import AIAvatar from '../components/AIAvatar';
import ChatBox from '../components/ChatBox';
import ArtifactViewer from '../components/ArtifactViewerV2';
import { Smile, Search, MessageSquarePlus, Trash2, ArrowLeft, Menu, X, Pin, PanelLeftOpen } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import VoiceCallOverlay from '../components/VoiceCallOverlay';
import SourcesPanel from '../components/SourcesPanel';
import ChatSidebar from '../components/ChatSidebar';
import ParticlesBackground from '../components/ParticlesBackground';
import { updateConversation } from '../store/chatSlice';

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { emitTyping } = useSocket();
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSending,
    streamingMessage,
    fetchConversations,
    fetchMessages,
    sendMessage,
    deleteConversation,
    setCurrentConversation,
    createConversation,
    addMessage,
    clearChat
  } = useChat();

  const pref = useSelector((state) => state.settings.preferences);
  const companionName = pref ? pref.aiName : 'Companion';

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [sourcesMessage, setSourcesMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleOpenSources = (message) => {
    setSourcesMessage(message);
    setShowSourcesPanel(true);
  };

  useEffect(() => {
    fetchConversations();
    dispatch(fetchPreferences());
  }, []);

  // Sync URL with current conversation state
  useEffect(() => {
    if (id && currentConversation?._id !== id) {
      // URL has ID, but state doesn't match. Try to find it.
      const conv = conversations.find(c => c._id === id);
      if (conv) {
        setCurrentConversation(conv);
      }
    } else if (!id && currentConversation) {
      // URL has no ID, but we have an active conversation (e.g. restored from localStorage)
      navigate(`/chat/${currentConversation._id}`, { replace: true });
    }
  }, [id, currentConversation, conversations, navigate, setCurrentConversation]);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation._id);
    }
  }, [currentConversation]);

  // Scroll to bottom on new messages or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, streamingMessage]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Emit typing state to socket
    if (currentConversation && user) {
      emitTyping(currentConversation._id, 'ai', true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(currentConversation._id, 'ai', false);
      }, 1500);
    }
  };

  const handleSend = async (e, imageBase64 = null, textOverride = null) => {
    if (e) e.preventDefault();
    const activeText = textOverride !== null ? textOverride : inputText;
    if ((!activeText.trim() && !imageBase64) || isSending) return;

    const textToSend = activeText.trim() || (imageBase64 ? '📸 [Image Attached]' : '');
    setInputText('');

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(currentConversation?._id || '', 'ai', false);

    try {
      let activeId = currentConversation?._id;

      sendMessage({
        conversationId: activeId,
        message: textToSend,
        imageBase64
      });
      
      // Refresh list to show new conversation / last message updates
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(err?.message || 'Failed to send message. Please check connection.');
    }
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    clearChat();
    navigate('/chat');
    setInputText('');
    setActiveArtifact(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      deleteConversation(id);
    }
  };

  // Filter conversations based on query search
  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-bg aurora-bg text-text overflow-hidden relative">
      <ParticlesBackground />
      {/* Sidebar navigation */}
      <div className="hidden md:block z-10 relative">
        <Sidebar />
      </div>

      <ChatSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
        conversations={conversations}
        currentConversation={currentConversation}
        setCurrentConversation={(conv) => {
          setCurrentConversation(conv);
          if (conv) navigate(`/chat/${conv._id}`);
          else navigate('/chat');
        }}
        handleDelete={handleDelete}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleNewChat={handleNewChat}
        onRename={(id, title) => dispatch(updateConversation({ id, updates: { title } }))}
        onPin={(id, isPinned) => dispatch(updateConversation({ id, updates: { isPinned } }))}
        onArchive={(id) => dispatch(updateConversation({ id, updates: { isArchived: true } }))}
        onShare={(id) => {
          const shareLink = `${window.location.origin}/share/${id}`;
          navigator.clipboard.writeText(shareLink)
            .then(() => {
              toast.success('Link copied! You can now share it with anyone.', {
                icon: '🔗',
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
              });
            })
            .catch(err => {
              console.error('Failed to copy', err);
              toast.error('Failed to copy link. Try again.');
            });
        }}
      />

      {/* Main chat window */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Collapsed Sidebar Floating Toolbar */}
        {!isSidebarOpen && (
          <div className="absolute top-3 left-3 z-50 flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-surface border border-border/40 text-muted hover:text-text rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Open sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNewChat}
              className="p-2 bg-surface border border-border/40 text-muted hover:text-text rounded-lg shadow-sm transition-colors cursor-pointer"
              title="New chat"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">


          <ChatBox
            inputText={inputText}
            setInputText={setInputText}
            handleInputChange={handleInputChange}
            handleSend={handleSend}
            messages={messages}
            companionName={companionName}
            language={pref?.language || 'English'}
            isSending={isSending}
            isLoading={isLoading}
            streamingMessage={streamingMessage}
            messagesEndRef={messagesEndRef}

            onArtifactOpen={(code, language) => setActiveArtifact({ code, language })}
            onOpenSources={handleOpenSources}
            currentConversation={currentConversation}
            onShareConversation={() => {
              const shareLink = `${window.location.origin}/share/${currentConversation._id}`;
              navigator.clipboard.writeText(shareLink)
                .then(() => {
                  toast.success('Link copied! You can now share it with anyone.', {
                    icon: '🔗',
                    style: {
                      borderRadius: '10px',
                      background: '#333',
                      color: '#fff',
                    },
                  });
                })
                .catch(err => {
                  console.error('Failed to copy', err);
                  toast.error('Failed to copy link. Try again.');
                });
            }}
            onPin={(id, isPinned) => dispatch(updateConversation({ id, updates: { isPinned } }))}
            onArchive={(id) => dispatch(updateConversation({ id, updates: { isArchived: true } }))}
            onDelete={handleDelete}
            isSidebarOpen={isSidebarOpen}
          />

          {/* Artifact Viewer Slide-in Panel */}
          {activeArtifact && (
            <ArtifactViewer
              code={activeArtifact.code}
              language={activeArtifact.language}
              onClose={() => setActiveArtifact(null)}
            />
          )}

          {/* Sources Side Panel */}
          <SourcesPanel 
            isOpen={showSourcesPanel} 
            onClose={() => setShowSourcesPanel(false)} 
            message={sourcesMessage} 
          />
        </div>
      </div>
    </div>
  );
}
