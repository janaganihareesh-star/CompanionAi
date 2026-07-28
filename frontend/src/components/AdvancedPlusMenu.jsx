import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, 
  Image as ImageIcon, 
  Globe, 
  Telescope, 
  PenTool, 
  Workflow, 
  BarChart2, 
  Triangle,
  Plus
} from 'lucide-react';

const MENU_ITEMS = [
  {
    id: 'add-files',
    icon: Paperclip,
    title: 'Add photos & files',
    desc: 'Upload from computer',
    iconClass: 'text-gray-400',
    actionType: 'native-file'
  },
  {
    id: 'create-image',
    icon: ImageIcon,
    title: 'Create image',
    desc: 'Visualize anything',
    iconClass: 'text-blue-400',
    prefixText: '/image '
  },
  {
    id: 'web-search',
    icon: Globe,
    title: 'Web search',
    desc: 'Find real-time news and info',
    iconClass: 'text-cyan-400',
    prefixText: '/search '
  },
  {
    id: 'deep-research',
    icon: Telescope,
    title: 'Deep research',
    desc: 'Get a detailed report',
    iconClass: 'text-blue-500',
    prefixText: '/research '
  },
  {
    id: 'canva',
    icon: PenTool,
    title: 'Canva',
    desc: 'Create, review, edit designs',
    iconClass: 'text-purple-400',
    prefixText: '/canva '
  },
  {
    id: 'visualize',
    icon: Workflow,
    title: 'Visualize',
    desc: 'Create visualizations and interactive tools',
    iconClass: 'text-pink-400',
    prefixText: '/visualize '
  },
  {
    id: 'data-analytics',
    icon: BarChart2,
    title: 'Data Analytics',
    desc: 'Answer product and business questions with data',
    iconClass: 'text-blue-400',
    prefixText: '/analyze '
  },
  {
    id: 'atlassian',
    icon: Triangle,
    title: 'Atlassian Rovo',
    desc: 'Manage Jira and Confluence fast',
    iconClass: 'text-blue-500',
    prefixText: '/rovo '
  }
];

export default function AdvancedPlusMenu({ isOpen, onClose, onFileClick, onOptionSelect }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = MENU_ITEMS.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible backdrop to detect outside clicks */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-16 left-0 z-50 w-[420px] bg-[#1a1a1c] border border-[#2c2c2e] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2c2c2e] bg-[#1a1a1c]">
              <Plus className="w-5 h-5 text-gray-400 shrink-0" />
              <input 
                type="text"
                placeholder="Ask anything"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder:text-gray-400 outline-none text-[15px]"
                autoFocus
              />
            </div>

            {/* Menu Items List */}
            <div className="py-2 max-h-[380px] overflow-y-auto custom-scrollbar">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.id}
                    onClick={() => {
                      if (item.actionType === 'native-file') {
                        onFileClick();
                      } else {
                        onOptionSelect(item.prefixText);
                      }
                      onClose();
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl hover:bg-[#2A2B32] cursor-pointer transition-colors group"
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${item.iconClass} opacity-90 group-hover:opacity-100 transition-opacity`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-white whitespace-nowrap">{item.title}</span>
                        <span className="text-[13px] text-gray-500 truncate">{item.desc}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredItems.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  No matches found for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#2c2c2e] bg-[#1a1a1c]">
              <p className="text-[12px] text-gray-500 font-medium">
                Type to search plugins, files, folders & skills
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
