import React from 'react';
import { Globe, FileText, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SourcesCarousel({ sources = [], isGenerating = false }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="w-full flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x">
      {sources.map((src, i) => (
        <a
          key={i}
          href={src.link}
          target="_blank"
          rel="noopener noreferrer"
          className="snap-start flex-shrink-0 w-64 md:w-72 bg-surface/50 border border-white/5 hover:bg-surface hover:border-accent/30 rounded-xl p-3 transition-all duration-300 shadow-sm flex flex-col gap-2 group"
        >
          <div className="flex items-center gap-2">
            {src.favicon ? (
              <img src={src.favicon} alt={src.source} className="w-4 h-4 rounded-sm" />
            ) : (
              <Globe className="w-4 h-4 text-muted" />
            )}
            <span className="text-xs text-muted font-medium truncate group-hover:text-accent transition-colors">
              {src.source || new URL(src.link).hostname}
            </span>
          </div>
          
          <h4 className="text-sm text-text font-semibold line-clamp-2 leading-tight">
            {src.title}
          </h4>
        </a>
      ))}
      
      {isGenerating && (
        <div className="snap-start flex-shrink-0 w-48 bg-surface/30 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2 opacity-70">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Search className="w-5 h-5 text-accent" />
          </motion.div>
          <span className="text-xs text-muted font-medium">Reading sources...</span>
        </div>
      )}
    </div>
  );
}
