import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Share2, AlertCircle, Home } from 'lucide-react';
import MessageBubble from '../components/MessageBubbleV2';
import AIAvatar from '../components/AIAvatar';

export default function SharedChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/public/${id}`);
        setConversation(res.data.conversation);
        setMessages(res.data.messages);
      } catch (err) {
        console.error('Failed to load shared chat:', err);
        setError('This shared conversation link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedChat();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen bg-bg flex items-center justify-center text-text">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="h-screen bg-bg flex flex-col items-center justify-center text-text p-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Chat Not Found</h2>
        <p className="text-muted text-center max-w-sm mb-6">{error}</p>
        <button onClick={() => navigate('/landing')} className="px-6 py-2 bg-accent text-white rounded-full font-semibold hover:bg-accent/90 transition">
          Go to CloserAI
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg text-text overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-border/40 p-4 flex justify-between items-center z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <AIAvatar size="w-10 h-10" emoji="🤖" status={null} />
          <div className="text-left">
            <h4 className="font-bold text-text font-outfit text-sm">Shared Conversation</h4>
            <span className="text-[10px] text-muted font-semibold">{new Date(conversation.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-surface border border-border/50 text-xs font-semibold text-muted rounded-full flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5" />
            Public Link
          </div>
          <button onClick={() => navigate('/landing')} className="text-accent text-sm font-semibold hover:underline">
            Get CloserAI
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold font-outfit mb-2">{conversation.title || 'Untitled Chat'}</h1>
          <p className="text-sm text-muted">This is a public, read-only view of a shared conversation.</p>
        </div>

        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} />
        ))}
        
        <div className="py-8 text-center text-xs text-muted border-t border-border/30 mt-8">
          Powered by CloserAI · ChatGPT Clone Architecture
        </div>
      </div>
    </div>
  );
}
