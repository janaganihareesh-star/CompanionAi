import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function SharedChatView() {
  const { shareId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/chat/public/${shareId}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shared conversation.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedChat();
  }, [shareId]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg relative">
        <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
        <p className="text-muted text-sm">Loading shared chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg p-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Unavailable</h2>
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  const { conversation, messages } = data;

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <div className="sticky top-0 z-50 glass-panel border-b border-border/30 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{conversation.title || 'Shared Conversation'}</h1>
          <p className="text-xs text-muted mt-1">Shared via Companion AI</p>
        </div>
      </div>
      
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        {messages.map((msg) => (
          <div key={msg._id} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.sender === 'user' ? 'bg-accent text-white rounded-tr-sm' : 'bg-surface border border-border rounded-tl-sm'}`}>
              <div className="prose prose-invert max-w-none text-sm break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="my-4 rounded-xl overflow-hidden shadow-lg border border-border">
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: '1rem', background: '#0d1117' }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className="bg-bg/50 px-1.5 py-0.5 rounded text-accent" {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
