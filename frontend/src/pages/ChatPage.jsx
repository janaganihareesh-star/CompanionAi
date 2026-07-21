import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setModel, fetchPreferences } from '../store/settingsSlice';
import useChat from '../hooks/useChat';
import useAuth from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import { updateConversation, deleteConversation } from '../store/chatSlice';
import ScreenUnderstanding from '../components/ScreenUnderstanding';
import Sidebar from '../components/Sidebar';
import AIAvatar from '../components/AIAvatar';
import ChatBox from '../components/ChatBox';

import CanvasEditor from '../components/CanvasEditor';
import CanvasArtifact from '../components/CanvasArtifact';
import CodeRunner from '../components/CodeRunner';
import LiveTerminal from '../components/LiveTerminal';
import { Smile, Search, MessageSquarePlus, Trash2, ArrowLeft, Menu, X, Pin, PanelLeftOpen, PanelLeft, Heart, Phone, Terminal as TerminalIcon } from 'lucide-react';
import { MessageCircle, Mic, Target, Lightbulb, Clock, Video } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import VoiceCallOverlay from '../components/VoiceCallOverlay';
import SourcesPanel from '../components/SourcesPanel';
import ChatSidebar from '../components/ChatSidebar';
import ParticlesBackground from '../components/ParticlesBackground';
import { setEmergencyMode } from '../store/chatSlice';
import api from '../utils/api';

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { socket, emitTyping } = useSocket();
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
    clearChat,
    fetchMoreMessages,
    hasMore,
    stopGeneration
  } = useChat();

  const pref = useSelector((state) => state.settings.preferences);
  const minimalMode = useSelector((state) => state.settings.minimalMode);
  const emergencyMode = useSelector((state) => state.chat.emergencyMode);
  const companionName = pref?.aiName || 'CloserAI';

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [sourcesMessage, setSourcesMessage] = useState(null);
  
  const [activeCodeRunner, setActiveCodeRunner] = useState(null);
  const [activeCanvasArtifact, setActiveCanvasArtifact] = useState(null);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasContent, setCanvasContent] = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('chat');
  const [groupEmails, setGroupEmails] = useState('');
  const [groupName, setGroupName] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleOpenSources = (message) => {
    setSourcesMessage(message);
    setShowSourcesPanel(true);
  };

  // Context Memory Tracking
  const totalChars = messages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0);
  const estimatedTokens = Math.floor(totalChars / 4);
  const maxTokens = 128000;
  const contextPercentage = Math.min(100, (estimatedTokens / maxTokens) * 100).toFixed(1);


  useEffect(() => {
    fetchConversations();
    dispatch(fetchPreferences());
  }, []);

  useEffect(() => {
    if (id && currentConversation?._id !== id) {
      const conv = conversations.find(c => c._id === id);
      if (conv) {
        setCurrentConversation(conv);
      } else {
        // Fallback: If not in the fetched list (or while loading), set it instantly so fetchMessages runs
        setCurrentConversation({ _id: id, title: 'Loading Chat...' });
      }
    } else if (!id && currentConversation) {
      navigate(`/chat/${currentConversation._id}`, { replace: true });
    }
  }, [id, currentConversation, conversations, navigate, setCurrentConversation]);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation._id);
      if (socket) {
        socket.emit('join-room', currentConversation._id);
      }
    }
    
    return () => {
      if (currentConversation && socket) {
        socket.emit('leave-room', currentConversation._id);
      }
    };
  }, [currentConversation, socket]);

  // ChatBox handles its own robust scrolling now.

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (currentConversation && user) {
      emitTyping(currentConversation._id, 'ai', true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(currentConversation._id, 'ai', false);
      }, 1500);
    }
  };

  const handleContinue = () => {
    handleSend(null, [], "Continue exactly from where you left off without any intro text.");
  };

  const handleSend = async (e, attachments = [], textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride !== null ? textOverride : inputText;
    if (!textToSend.trim() && attachments.length === 0) return;

    if (textOverride === null) setInputText('');

    if (textToSend.toLowerCase().startsWith('/search ')) {
      setSearchQuery(textToSend.replace('/search ', ''));
      setIsSidebarOpen(true);
      return;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(currentConversation?._id || '', 'ai', false);

    try {
      let activeId = currentConversation?._id;
      sendMessage({
        conversationId: activeId,
        message: textToSend,
        attachments: attachments
      });
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(err?.message || 'Failed to send message. Please check connection.');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    try {
      const emailList = groupEmails.split(',').map(e => e.trim()).filter(e => e);
      const res = await api.post('/api/chat/group', {
        title: groupName,
        members: emailList
      });
      if (res.data.success) {
        toast.success('Team Workspace Created!');
        setIsGroupModalOpen(false);
        setGroupName('');
        setGroupEmails('');
        fetchConversations();
        navigate(`/chat/${res.data.conversation._id}`);
      }
    } catch (error) {
      console.error('Failed to create group', error);
      toast.error(error.response?.data?.error || 'Failed to create group');
    }
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    clearChat();
    navigate('/chat');
    setInputText('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      deleteConversation(id);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-bg aurora-bg text-text overflow-hidden relative">
      <ParticlesBackground />
      <div className="hidden md:block z-10 relative">
        <Sidebar />
      </div>

      {!minimalMode && (
        <ChatSidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          companionName={companionName}
          onClose={() => setIsSidebarOpen(false)}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          conversations={conversations}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentConversation={currentConversation}
          setCurrentConversation={(conv) => {
            navigate(`/chat/${conv._id}`);
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
          handleNewChat={handleNewChat}
          handleDelete={(id) => {
            if (window.confirm('Are you sure you want to permanently delete this chat?')) {
              dispatch(deleteConversation(id)).unwrap().then(() => fetchConversations());
            }
          }}
          onRename={(id, title) => dispatch(updateConversation({ id, updates: { title } })).unwrap().then(() => fetchConversations())}
          onPin={(id, isPinned) => dispatch(updateConversation({ id, updates: { isPinned } })).unwrap().then(() => fetchConversations())}
          onArchive={(id) => dispatch(updateConversation({ id, updates: { isArchived: true } }))}
          onShare={(id) => {
            const shareLink = `${window.location.origin}/share/${id}`;
            navigator.clipboard.writeText(shareLink)
              .then(() => toast.success('Link copied!'))
              .catch(err => toast.error('Failed to copy link.'));
          }}
          handleNewGroup={() => setIsGroupModalOpen(true)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden relative">
          <ChatBox
            headerActions={
              !isSidebarOpen && !minimalMode ? (
                <div className="flex items-center gap-1.5 mr-2">
                  <Tooltip text="Open Sidebar">
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="p-1.5 bg-surface/50 border border-border/30 text-muted hover:text-text rounded-lg backdrop-blur-sm transition-colors cursor-pointer shadow-sm"
                    >
                      <PanelLeft className="w-4 h-4" />
                    </button>
                  </Tooltip>

                  <ScreenUnderstanding />

                  {/* Context Memory Tracker */}
                  <Tooltip text={`Context Memory: ${estimatedTokens.toLocaleString()} / ${maxTokens.toLocaleString()} tokens`}>
                    <div className="flex flex-col gap-1 w-24 mx-2">
                      <div className="flex justify-between text-[9px] text-muted font-bold uppercase tracking-wider">
                        <span>Memory</span>
                        <span>{contextPercentage}%</span>
                      </div>
                      <div className="w-full bg-surface border border-border/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${contextPercentage > 80 ? 'bg-rose-500' : contextPercentage > 50 ? 'bg-amber-400' : 'bg-accent'}`} 
                          style={{ width: `${contextPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </Tooltip>

                  <Tooltip text="Switch AI Model">
                    <select
                      value={pref?.selectedModel || 'gemini-2.5-flash'}
                      onChange={(e) => dispatch(setModel(e.target.value))}
                      className="bg-surface/50 border border-border/30 text-emerald-400 text-xs font-bold py-1.5 px-3 rounded-lg backdrop-blur-sm cursor-pointer outline-none hover:text-emerald-300 hover:border-emerald-500/50 transition-colors shadow-sm"
                    >
                      <option className="bg-[#0f172a] text-gray-200 py-1" value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                      <option className="bg-[#0f172a] text-gray-200 py-1" value="gemini-2.5-pro">Gemini 2.5 Pro (Complex)</option>
                      <option className="bg-[#0f172a] text-gray-200 py-1" value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                      <option className="bg-[#0f172a] text-gray-200 py-1" value="gpt-4o">OpenAI GPT-4o</option>
                      <option className="bg-[#0f172a] text-gray-200 py-1" value="llama-3-local">Llama 3 (Local Offline)</option>
                    </select>
                  </Tooltip>
                  <Tooltip text="New Chat">
                    <button 
                      onClick={handleNewChat}
                      className="p-1.5 bg-surface/50 border border-border/30 text-muted hover:text-text rounded-lg backdrop-blur-sm transition-colors cursor-pointer shadow-sm"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip text="New Team Workspace">
                    <button 
                      onClick={() => setIsGroupModalOpen(true)}
                      className="p-1.5 bg-surface/50 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 rounded-lg backdrop-blur-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <span className="text-sm">👥</span>
                    </button>
                  </Tooltip>
                  <Tooltip text="Toggle OS Terminal">
                    <button 
                      onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                      className={`p-1.5 bg-surface/50 border rounded-lg backdrop-blur-sm shadow-sm transition-colors cursor-pointer ${isTerminalOpen ? 'border-accent text-accent' : 'border-border/30 text-muted hover:text-text'}`}
                    >
                      <TerminalIcon className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              ) : null
            }
            inputText={inputText}
            setInputText={setInputText}
            handleInputChange={handleInputChange}
            handleSend={handleSend}
            messages={messages}
            hasMore={hasMore}
            fetchMoreMessages={fetchMoreMessages}
            companionName={companionName}
            language={pref?.language || 'English'}
            isSending={isSending}
            isLoading={isLoading}
            streamingMessage={streamingMessage}
            streamingSources={null}
            messagesEndRef={messagesEndRef}
            onContinue={handleContinue}
            onArtifactOpen={(code, language) => setActiveCodeRunner({ code, language })}
            onCanvasArtifactOpen={(code, language) => setActiveCanvasArtifact({ code, language })}
            onOpenCanvas={(content) => {
              setCanvasContent(content);
              setIsCanvasOpen(true);
            }}
            onOpenSources={handleOpenSources}
            currentConversation={currentConversation}
            onShareConversation={() => {}}
            onPin={(id, isPinned) => dispatch(updateConversation({ id, updates: { isPinned } }))}
            onArchive={(id) => dispatch(updateConversation({ id, updates: { isArchived: true } }))}
            onDelete={handleDelete}
            isSidebarOpen={isSidebarOpen}
            onCodeRun={(code, lang) => setActiveCodeRunner({ code, language: lang })}
            minimalMode={minimalMode}
            socket={socket}
            onStopGeneration={stopGeneration}
          />

          {isCanvasOpen && (
            <CanvasEditor 
              initialContent={canvasContent || "<h1>Project Draft</h1><p>Start writing here...</p>"}
              onClose={() => setIsCanvasOpen(false)} 
            />
          )}

          {activeCodeRunner && (
            <CodeRunner
              code={activeCodeRunner.code}
              language={activeCodeRunner.language}
              onClose={() => setActiveCodeRunner(null)}
            />
          )}

          {activeCanvasArtifact && (
            <CanvasArtifact
              code={activeCanvasArtifact.code}
              language={activeCanvasArtifact.language}
              onClose={() => setActiveCanvasArtifact(null)}
            />
          )}

          {isTerminalOpen && (
            <div className="absolute bottom-20 left-4 right-4 h-64 z-40 bg-[#0B0F19] rounded-xl border border-border shadow-2xl flex flex-col">
              <div className="flex justify-between items-center p-2 border-b border-border bg-surface/50 rounded-t-xl">
                <span className="text-xs font-bold text-accent font-mono ml-2">Closer-AI OS Terminal</span>
                <button onClick={() => setIsTerminalOpen(false)} className="text-muted hover:text-rose-500">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <LiveTerminal isVisible={isTerminalOpen} />
              </div>
            </div>
          )}

          {emergencyMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg">
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center mx-4 relative">
                <button 
                  onClick={() => dispatch(setEmergencyMode(false))}
                  className="absolute top-2 right-2 text-rose-500 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                </div>
                <h3 className="text-white font-bold mb-1">You are not alone</h3>
                <p className="text-xs text-rose-200 mb-3">Please reach out for support right now. Your life is valuable.</p>
                <div className="flex gap-2">
                  <a href="tel:9152987821" className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2 px-4 rounded-xl transition flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Call iCall
                  </a>
                  <a href="tel:18602662345" className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-100 text-xs font-bold py-2 px-4 rounded-xl transition flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Vandrevala
                  </a>
                </div>
              </div>
            </div>
          )}

          <SourcesPanel 
            isOpen={showSourcesPanel} 
            onClose={() => setShowSourcesPanel(false)} 
            message={sourcesMessage} 
          />
        </div>
      </div>

      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-outfit">New Team Workspace</h2>
              <button onClick={() => setIsGroupModalOpen(false)} className="text-muted hover:text-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Workspace Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Project Phoenix"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text focus:border-cyan outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Invite Members (Emails, comma separated)</label>
                <textarea
                  value={groupEmails}
                  onChange={(e) => setGroupEmails(e.target.value)}
                  placeholder="john@example.com, alice@team.com"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text focus:border-cyan outline-none transition-colors resize-none h-24"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cyan hover:bg-cyan/90 text-bg font-bold py-3 rounded-xl transition-all shadow-glow"
              >
                Create Workspace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
