import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X as CloseIcon, Link as LinkIcon, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareModal({ isOpen, onClose, message, conversationTitle }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // The link to share (can be the current URL or a specific chat link)
  const shareUrl = window.location.href;
  
  // Truncated preview text
  const previewText = message?.content 
    ? message.content.substring(0, 150) + (message.content.length > 150 ? '...' : '')
    : 'Check out this AI conversation!';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(previewText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(conversationTitle || 'AI Conversation')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(previewText + ' ' + shareUrl)}`
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#171717] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 pb-4">
                <h2 className="text-xl font-semibold text-white font-outfit">
                  {conversationTitle || 'Share Conversation'}
                </h2>
                <button 
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content Preview */}
              <div className="px-5 pb-6">
                <div className="bg-[#212121] rounded-xl p-4 text-sm text-gray-300 mb-6 relative overflow-hidden">
                  <p className="mb-3 leading-relaxed">{previewText}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>File/Conversation → Complete discussion</span>
                    <span className="text-white font-bold text-lg opacity-80 font-outfit">CloserAI</span>
                  </div>
                  {/* Subtle fade effect at bottom of preview */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#212121] to-transparent pointer-events-none"></div>
                </div>

                {/* Share Buttons Grid */}
                <div className="flex items-center justify-center gap-6">
                  {/* Copy Link */}
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={handleCopyLink}
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 text-black shadow-lg"
                    >
                      <LinkIcon className="w-6 h-6" />
                    </button>
                    <span className="text-xs text-gray-400 font-medium">{copied ? 'Copied!' : 'Copy link'}</span>
                  </div>

                  {/* X (Twitter) */}
                  <div className="flex flex-col items-center gap-2">
                    <a 
                      href={shareLinks.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 text-black shadow-lg"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                    <span className="text-xs text-gray-400 font-medium">X</span>
                  </div>

                  {/* LinkedIn */}
                  <div className="flex flex-col items-center gap-2">
                    <a 
                      href={shareLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 text-black shadow-lg"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                    <span className="text-xs text-gray-400 font-medium">LinkedIn</span>
                  </div>

                  {/* Reddit */}
                  <div className="flex flex-col items-center gap-2">
                    <a 
                      href={shareLinks.reddit}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 text-black shadow-lg"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .883.175 1.188.467 1.233-.873 2.935-1.442 4.808-1.488l.89-4.168a.333.333 0 0 1 .39-.253l3.05.642a1.254 1.254 0 0 1 1.152-.702zm-8.818 7.373a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zm7.616 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zm-3.808 3.902c-1.505 0-2.92.383-3.084.428a.333.333 0 1 0 .178.643c.092-.025 1.347-.384 2.906-.384 1.558 0 2.813.359 2.906.384a.333.333 0 1 0 .178-.643c-.164-.045-1.58-.428-3.084-.428z"/>
                      </svg>
                    </a>
                    <span className="text-xs text-gray-400 font-medium">Reddit</span>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex flex-col items-center gap-2">
                    <a 
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 text-black shadow-lg"
                    >
                      <MessageCircle className="w-6 h-6" />
                    </a>
                    <span className="text-xs text-gray-400 font-medium">WhatsApp</span>
                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
