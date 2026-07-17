import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MemoryCard from '../components/MemoryCard';
import {
  fetchMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  togglePin
} from '../store/memorySlice';
import {
  Brain,
  Search,
  Plus,
  Pin,
  Trash2,
  Edit3,
  Download,
  Tag,
  X,
  Loader2,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MemoryVaultPage() {
  const user = useSelector((state) => state.auth.user);
  const userName = user ? user.fullName.split(' ')[0] : 'Friend';
  const dispatch = useDispatch();
  const { flatList, isLoading } = useSelector((state) => state.memory);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'pinned' | categoryName
  const [selectedTag, setSelectedTag] = useState('');

  // Modal control
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);

  // Form inputs
  const [memText, setMemText] = useState('');
  const [memCategory, setMemCategory] = useState('favorite');
  const [memTags, setMemTags] = useState('');
  const [memImportance, setMemImportance] = useState(5);
  const [memPinned, setMemPinned] = useState(false);

  useEffect(() => {
    dispatch(fetchMemories(false)); // fetch flat list
  }, [dispatch]);

  const handleOpenAddModal = () => {
    setEditingMemory(null);
    setMemText('');
    setMemCategory('favorite');
    setMemTags('');
    setMemImportance(5);
    setMemPinned(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (mem) => {
    setEditingMemory(mem);
    setMemText(mem.memory);
    setMemCategory(mem.category);
    setMemTags(mem.tags ? mem.tags.join(', ') : '');
    setMemImportance(mem.importanceScore || 5);
    setMemPinned(mem.isPinned || false);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memText.trim()) {
      toast.error(`Memory text is required, ${userName}!`);
      return;
    }

    // Process tags
    const processedTags = memTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== '');

    const payload = {
      memory: memText,
      category: memCategory,
      tags: processedTags,
      importanceScore: Number(memImportance),
      isPinned: memPinned,
      source: 'user'
    };

    try {
      if (editingMemory) {
        await dispatch(updateMemory({ id: editingMemory._id, data: payload })).unwrap();
        toast.success('Memory modified inside the AI brain. 🧠');
      } else {
        await dispatch(createMemory(payload)).unwrap();
        toast.success('Memory secured in vault! Maya won\'t forget this. 📌');
      }
      setShowAddModal(false);
    } catch (err) {
      toast.error(err || 'Failed to save memory.');
    }
  };

  const handleTogglePin = async (mem) => {
    try {
      await dispatch(togglePin(mem._id)).unwrap();
      toast.success(mem.isPinned ? 'Memory unpinned.' : 'Memory pinned to the top! ⭐');
    } catch (err) {
      toast.error('Failed to pin memory.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Forget this memory forever? Your AI will lose access to it.')) {
      try {
        await dispatch(deleteMemory(id)).unwrap();
        toast.success('Memory forgotten.');
      } catch (err) {
        toast.error('Failed to delete memory.');
      }
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(flatList, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `closer_ai_memory_vault_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Memory backup downloaded successfully! 💾');
    } catch (e) {
      toast.error('Export failed.');
    }
  };

  // Extract all unique tags for filter sidebar/dropdown
  const allTags = Array.from(
    new Set(
      flatList?.reduce((acc, mem) => {
        if (mem.tags) acc.push(...mem.tags);
        return acc;
      }, []) || []
    )
  );

  // Filter memories
  const filteredMemories = flatList
    ? flatList.filter((mem) => {
        // Search query filter
        const matchSearch =
          mem.memory.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (mem.tags && mem.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

        // Category filter
        let matchCategory = true;
        if (selectedCategory === 'pinned') {
          matchCategory = mem.isPinned;
        } else if (selectedCategory !== 'all') {
          matchCategory = mem.category === selectedCategory;
        }

        // Tag filter
        const matchTag = selectedTag ? mem.tags && mem.tags.includes(selectedTag) : true;

        return matchSearch && matchCategory && matchTag;
      })
    : [];

  const categories = [
    { value: 'all', label: '📂 All Memories' },
    { value: 'pinned', label: '⭐ Pinned' },
    { value: 'favorite', label: '💖 Favorites' },
    { value: 'relationship', label: '🤝 Relationships' },
    { value: 'career', label: '💼 Career' },
    { value: 'education', label: '🎓 Education' },
    { value: 'goal', label: '🎯 Goals' },
    { value: 'personality', label: '🧬 Personality' },
    { value: 'friends', label: '👥 Friends' },
    { value: 'family', label: '🏡 Family' },
    { value: 'health', label: '💪 Health' },
    { value: 'knowledge', label: '📚 Knowledge' }
  ];

  const getCategoryEmoji = (cat) => {
    switch (cat) {
      case 'relationship': return '🤝';
      case 'career': return '💼';
      case 'education': return '🎓';
      case 'goal': return '🎯';
      case 'health': return '💪';
      case 'family': return '🏡';
      case 'friends': return '👥';
      case 'personality': return '🧬';
      case 'knowledge': return '📚';
      case 'favorite': return '💖';
      default: return '🧠';
    }
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold font-outfit text-text flex items-center gap-2">
              <Brain className="w-8 h-8 text-emerald" /> Memory Vault
            </h2>
            <p className="text-muted text-sm mt-0.5">Explore the details Your AI has stored in her long-term memory engine, ${userName}.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2.5 bg-panel border border-border hover:border-emerald/40 text-text font-bold rounded-xl flex items-center gap-2 transition cursor-pointer text-xs"
              title="Backup Memories as JSON"
            >
              <Download className="w-4 h-4 text-emerald" /> Export Vault
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-emerald text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-card cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" /> Add Memory
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Search className="w-4.5 h-4.5 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search keyword, fact or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-emerald outline-none text-text"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tag selector filter */}
          <div className="relative">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-emerald outline-none text-text cursor-pointer capitalize"
            >
              <option value="">🏷️ Filter by Tag</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag} className="bg-surface">
                  {tag}
                </option>
              ))}
            </select>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag('')}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-muted hover:text-text cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category quick selector (mobile responsive helper) */}
          <div className="md:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-emerald outline-none text-text cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value} className="bg-surface">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Container (Sidebar Category Filter + Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel Categories List (Desktop only) */}
          <div className="hidden lg:block space-y-1 bg-surface border border-border rounded-2xl p-4 h-fit">
            <h3 className="text-xs font-bold text-muted px-3 mb-3 uppercase tracking-wider">Memory Categories</h3>
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedCategory(c.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer text-left ${
                  selectedCategory === c.value
                    ? 'bg-panel text-emerald border-l-2 border-emerald'
                    : 'text-muted hover:bg-panel hover:text-text'
                }`}
              >
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Right Panel Memories Grid */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="py-20 flex justify-center items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald" />
                <span className="text-muted text-sm">Querying Companion Memory Banks...</span>
              </div>
            ) : filteredMemories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredMemories.map((mem) => (
                    <MemoryCard
                      key={mem._id}
                      mem={mem}
                      handleTogglePin={handleTogglePin}
                      handleOpenEditModal={handleOpenEditModal}
                      handleDelete={handleDelete}
                      getCategoryEmoji={getCategoryEmoji}
                      selectedTag={selectedTag}
                      setSelectedTag={setSelectedTag}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-20 text-center bg-surface border border-dashed border-border rounded-2xl flex flex-col items-center justify-center space-y-3">
                <AlertCircle className="w-10 h-10 text-muted" />
                <div className="space-y-1">
                  <h3 className="font-bold text-text">No Memories Found</h3>
                  <p className="text-muted text-xs max-w-xs mx-auto">
                    Try checking a different category, clearing your filters, or locking in a memory manually!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MANUAL ADD/EDIT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-card overflow-hidden"
            >
              <div className="flex justify-between items-center p-5 border-b border-border/40">
                <h3 className="text-lg font-bold font-outfit text-text flex items-center gap-1.5">
                  <Brain className="w-5 h-5 text-emerald" />
                  <span>{editingMemory ? 'Modify Vault Memory' : 'Secure a Personal Memory'}</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-muted hover:text-text rounded-lg hover:bg-panel transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted font-outfit">Memory Details *</label>
                  <textarea
                    required
                    placeholder="Enter what you want your companion to remember. E.g. I hate spicy food but love chocolates; My sister's birthday is on December 14th..."
                    value={memText}
                    onChange={(e) => setMemText(e.target.value)}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-emerald outline-none min-h-[100px] text-text"
                  />
                  <div className="text-right text-[10px] text-muted">
                    {memText.length}/500 characters
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted">Category</label>
                    <select
                      value={memCategory}
                      onChange={(e) => setMemCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-emerald outline-none text-text cursor-pointer"
                    >
                      {categories
                        .filter((c) => c.value !== 'all' && c.value !== 'pinned')
                        .map((c) => (
                          <option key={c.value} value={c.value} className="bg-surface text-text">
                            {c.label.substring(3)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted">Importance Score (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={memImportance}
                      onChange={(e) => setMemImportance(e.target.value)}
                      className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-emerald outline-none text-text"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted">Tags (separated by commas)</label>
                  <input
                    type="text"
                    placeholder="e.g. food, sister, birthday, likes"
                    value={memTags}
                    onChange={(e) => setMemTags(e.target.value)}
                    className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-emerald outline-none text-text"
                  />
                </div>

                <label className="flex items-center gap-2.5 p-3 bg-panel border border-border rounded-xl cursor-pointer transition hover:bg-panel/80">
                  <input
                    type="checkbox"
                    checked={memPinned}
                    onChange={(e) => setMemPinned(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-emerald focus:ring-emerald accent-emerald cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="block text-xs font-bold text-text">Pin to Top</span>
                    <span className="block text-[10px] text-muted">Show this memory first inside the vault lists.</span>
                  </div>
                </label>

                <div className="flex justify-end gap-3 border-t border-border/40 pt-4 mt-6 font-outfit">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 border border-border text-muted font-bold rounded-xl text-sm hover:bg-panel transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-emerald text-white font-bold rounded-xl text-sm hover:opacity-90 transition cursor-pointer"
                  >
                    Confirm Memory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
