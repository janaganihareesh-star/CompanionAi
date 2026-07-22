import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquarePlus, Trash2, Pin, Archive, Settings, User, Compass, Brain, Mic, Wand2, Briefcase, FileText, Target, Home, X, PanelLeftClose, PanelLeft, MoreHorizontal, GraduationCap, Share2, Edit2, Check, Menu, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AIAvatar from './AIAvatar';
import Tooltip from './Tooltip';

export default function ChatSidebar({ 
  isOpen, 
  onClose,
  onOpen,
  conversations, 
  currentConversation, 
  setCurrentConversation, 
  handleDelete, 
  searchQuery, 
  setSearchQuery,
  handleNewChat,
  onRename,
  onPin,
  onArchive,
  onShare,
  handleNewGroup,
  companionName = 'CloserAI'
}) {
  const navigate = useNavigate();
  const [showApps, setShowApps] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchQuery]);

  const filteredConversations = (conversations || []).filter(c => {
    const title = c?.title || 'New Chat';
    const query = searchQuery || '';
    return title.toLowerCase().includes(query.toLowerCase());
  });

  const pinnedChats = filteredConversations.filter(c => c.isPinned && !c.isArchived);
  const recentChats = filteredConversations.filter(c => !c.isPinned && !c.isArchived);
  const archivedChats = filteredConversations.filter(c => c.isArchived);

  const folderGroups = recentChats.reduce((acc, chat) => {
    const folder = chat.folder || 'General';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(chat);
    return acc;
  }, {});

  // When collapsed, we only show a floating button in the ChatPage.
  if (!isOpen) return null;

  const renderChatItem = (conv) => (
    <ChatItem 
      key={conv._id} 
      conv={conv} 
      isActive={currentConversation?._id === conv._id} 
      onSelect={() => setCurrentConversation(conv)} 
      onDelete={() => handleDelete(conv._id)}
      onRename={(title) => onRename && onRename(conv._id, title)}
      onPin={() => onPin && onPin(conv._id, !conv.isPinned)}
      onArchive={() => onArchive && onArchive(conv._id)}
      onShare={() => onShare && onShare(conv._id)}
      isDropdownOpen={activeDropdown === conv._id}
      setDropdownOpen={(isOpen) => setActiveDropdown(isOpen ? conv._id : null)}
    />
  );

  return (
    <div className="w-64 bg-surface border-r border-border/20 flex flex-col h-full flex-shrink-0 z-40 overflow-hidden shadow-2xl">
      {/* Top Bar: Logo & Close */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer font-bold tracking-wide font-outfit text-text" onClick={() => navigate('/home')}>
          <Brain className="w-7 h-7 text-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
          <span className="font-bold text-text text-lg">CloserAI</span>
        </div>
        <Tooltip text="Close Sidebar" position="right">
          <button 
            onClick={onClose}
            className="p-1.5 text-muted hover:text-text hover:bg-panel rounded-lg transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </Tooltip>

      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-4 custom-scrollbar">
        
        {/* Action Buttons */}
        <div className="space-y-1 mt-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-panel rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 bg-text text-bg rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">+</span>
            </div>
            New chat
          </button>
          <button
            onClick={handleNewGroup}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-panel rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">+</span>
            </div>
            New Team Workspace
          </button>
          
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search chats"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-transparent text-text text-sm rounded-lg pl-9 pr-3 py-2 outline-none hover:bg-panel focus:bg-panel transition-colors placeholder:text-muted"
            />
          </div>
        </div>

        {/* Pinned Chats */}
        {pinnedChats.length > 0 && (
          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold text-muted mb-2">Pinned</h3>
            <div className="space-y-0.5">
              {pinnedChats.map(renderChatItem)}
            </div>
          </div>
        )}

        {/* Folder Groups */}
        {Object.entries(folderGroups).map(([folderName, chats]) => (
          <div key={folderName} className="mt-6">
            <h3 className="px-3 text-xs font-semibold text-muted mb-2 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent"></span>
              {folderName}
            </h3>
            <div className="space-y-0.5">
              {chats.map(renderChatItem)}
            </div>
          </div>
        ))}

        {/* Archived Chats */}
        {archivedChats.length > 0 && (
          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold text-muted mb-2">Archived</h3>
            <div className="space-y-0.5">
              {archivedChats.map(renderChatItem)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function ChatItem({ conv, isActive, onSelect, onDelete, onRename, onPin, onArchive, onShare, isDropdownOpen, setDropdownOpen }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conv.title);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, setDropdownOpen]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (editTitle.trim() && editTitle !== conv.title) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-panel border-l-4 border-accent text-accent'
          : 'text-text hover:bg-panel'
      }`}
    >
      <div className="overflow-hidden flex-1 flex items-center gap-2">
        {isEditing ? (
          <form onSubmit={handleRenameSubmit} className="flex-1 flex items-center w-full" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              className="w-full bg-bg text-text text-sm rounded px-1.5 py-0.5 outline-none border border-border/40 focus:border-accent"
            />
          </form>
        ) : (
          <h4 className="text-sm truncate">{conv.title}</h4>
        )}
      </div>
      
      {!isEditing && (
        <div className={`flex items-center shrink-0 ${isDropdownOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            className="p-1.5 text-muted hover:text-text transition-colors cursor-pointer"
            title={conv.isPinned ? "Unpin chat" : "Pin chat"}
          >
            <Pin className={`w-3.5 h-3.5 ${conv.isPinned ? 'fill-accent text-accent' : ''}`} />
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!isDropdownOpen);
              }}
              className="p-1.5 text-muted hover:text-text transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, zIndex: -10 }}
                  animate={{ opacity: 1, scale: 1, zIndex: 50 }}
                  exit={{ opacity: 0, scale: 0.95, zIndex: -10 }}
                  className="absolute top-full right-0 mt-1 w-44 bg-surface border border-border rounded-xl shadow-xl py-1 overflow-hidden z-50 origin-top-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onClick={() => { setDropdownOpen(false); onShare(); }} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-panel flex items-center gap-2 cursor-pointer">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button onClick={() => { setDropdownOpen(false); setIsEditing(true); }} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-panel flex items-center gap-2 cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" /> Rename
                  </button>
                  <button onClick={() => { setDropdownOpen(false); onPin(); }} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-panel flex items-center gap-2 cursor-pointer">
                    <Pin className={`w-3.5 h-3.5 ${conv.isPinned ? 'fill-accent text-accent' : 'text-muted'}`} /> {conv.isPinned ? 'Unpin chat' : 'Pin chat'}
                  </button>
                  <button onClick={() => { setDropdownOpen(false); onArchive(); }} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-panel flex items-center gap-2 cursor-pointer">
                    <Archive className="w-3.5 h-3.5" /> Archive
                  </button>
                  <div className="h-px bg-border/40 my-1"></div>
                  <button onClick={() => { setDropdownOpen(false); onDelete(); }} className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
