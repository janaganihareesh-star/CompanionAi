import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Code2, Briefcase, FileText, Heart, PenTool, LayoutDashboard, Database, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROUTES = [
  { path: '/home', name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, category: 'Main' },
  { path: '/chat', name: 'New Chat', icon: <Search className="w-4 h-4" />, category: 'Main' },
  { path: '/memory', name: 'Memory Vault', icon: <Database className="w-4 h-4" />, category: 'Main' },
  { path: '/goals', name: 'Goal Setter', icon: <PenTool className="w-4 h-4" />, category: 'Life OS' },
  { path: '/dreams', name: 'Dream Board', icon: <Heart className="w-4 h-4" />, category: 'Life OS' },
  { path: '/resume', name: 'Resume Builder', icon: <FileText className="w-4 h-4" />, category: 'Career Hub' },
  { path: '/salary', name: 'Salary Engine', icon: <Briefcase className="w-4 h-4" />, category: 'Career Hub' },
  { path: '/code', name: 'Code Sandbox', icon: <Code2 className="w-4 h-4" />, category: 'Tools' },
  { path: '/settings', name: 'Settings', icon: <Settings className="w-4 h-4" />, category: 'Tools' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredRoutes = ROUTES.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredRoutes.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredRoutes.length) % filteredRoutes.length);
    } else if (e.key === 'Enter' && filteredRoutes.length > 0) {
      e.preventDefault();
      handleSelect(filteredRoutes[selectedIndex].path);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[15vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-panel border border-border shadow-2xl rounded-2xl overflow-hidden relative mx-4"
        >
          <div className="flex items-center px-4 py-3 border-b border-border/50">
            <Search className="w-5 h-5 text-muted mr-3" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or jump to... (Cmd+K)"
              className="flex-1 bg-transparent border-none outline-none text-text text-lg placeholder:text-muted/60"
            />
            <div className="flex items-center gap-1 text-xs font-mono text-muted bg-surface px-2 py-1 rounded">
              esc
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredRoutes.length === 0 ? (
              <div className="p-8 text-center text-muted">No results found for "{query}"</div>
            ) : (
              filteredRoutes.map((route, idx) => (
                <div
                  key={route.path}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(route.path)}
                  className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors duration-150 ${idx === selectedIndex ? 'bg-accent/10 text-accent' : 'text-text hover:bg-surface'}`}
                >
                  <div className={`mr-4 ${idx === selectedIndex ? 'text-accent' : 'text-muted'}`}>
                    {route.icon}
                  </div>
                  <div className="flex-1 font-medium">{route.name}</div>
                  <div className="text-xs text-muted font-outfit uppercase tracking-wider">{route.category}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
