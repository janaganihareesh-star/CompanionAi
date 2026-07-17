import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import {
  fetchDreams,
  createDream,
  updateDream,
  deleteDream
} from '../store/goalSlice';
import {
  Compass,
  Plus,
  Pin,
  Trash2,
  Calendar,
  Sparkles,
  Edit2,
  X,
  Loader2,
  Smile,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DreamBoardPage() {
  const user = useSelector((state) => state.auth.user);
  const userName = user ? user.fullName.split(' ')[0] : 'Friend';
  const dispatch = useDispatch();
  const { dreams, isLoading } = useSelector((state) => state.goal);

  // Modal and editing controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDream, setEditingDream] = useState(null);

  // Form inputs
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamDesc, setDreamDesc] = useState('');
  const [dreamCategory, setDreamCategory] = useState('life');
  const [dreamProgress, setDreamProgress] = useState(0);
  const [dreamTargetYear, setDreamTargetYear] = useState(new Date().getFullYear() + 2);

  useEffect(() => {
    dispatch(fetchDreams());
  }, [dispatch]);

  const handleOpenAddModal = () => {
    setEditingDream(null);
    setDreamTitle('');
    setDreamDesc('');
    setDreamCategory('life');
    setDreamProgress(0);
    setDreamTargetYear(new Date().getFullYear() + 2);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (dream) => {
    setEditingDream(dream);
    setDreamTitle(dream.dream);
    setDreamDesc(dream.description || '');
    setDreamCategory(dream.category || 'life');
    setDreamProgress(dream.progress || 0);
    setDreamTargetYear(dream.targetYear || new Date().getFullYear() + 2);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dreamTitle.trim()) {
      toast.error('Dream title is required!');
      return;
    }

    const payload = {
      dream: dreamTitle,
      description: dreamDesc,
      category: dreamCategory,
      progress: Number(dreamProgress),
      targetYear: Number(dreamTargetYear)
    };

    try {
      if (editingDream) {
        await dispatch(updateDream({ id: editingDream._id, data: payload })).unwrap();
        toast.success('Dream updated! Keep manifesting it. ✨');
      } else {
        await dispatch(createDream(payload)).unwrap();
        toast.success('Dream added to your companion board! 🌌');
      }
      setShowAddModal(false);
    } catch (err) {
      toast.error(err || 'Operation failed.');
    }
  };

  const handleTogglePin = async (dream) => {
    try {
      await dispatch(
        updateDream({
          id: dream._id,
          data: { isPinned: !dream.isPinned }
        })
      ).unwrap();
      toast.success(dream.isPinned ? 'Dream unpinned.' : 'Dream pinned to the top! 📌');
    } catch (err) {
      toast.error('Failed to toggle pin.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this dream from your board?')) {
      try {
        await dispatch(deleteDream(id)).unwrap();
        toast.success('Dream deleted.');
      } catch (err) {
        toast.error('Failed to delete dream.');
      }
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'career': return 'bg-cyan/15 text-cyan border-cyan/30';
      case 'travel': return 'bg-amber/15 text-amber border-amber/30';
      case 'wealth': return 'bg-emerald/15 text-emerald border-emerald/30';
      case 'relationships': return 'bg-rose/15 text-rose border-rose/30';
      default: return 'bg-fuchsia/15 text-fuchsia border-fuchsia/30';
    }
  };

  // Group pinned vs unpinned
  const sortedDreams = dreams ? [...dreams].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  }) : [];

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold font-outfit text-text flex items-center gap-2">
              <Compass className="w-8 h-8 text-fuchsia animate-spin-slow" /> Dream Board
            </h2>
            <p className="text-muted text-sm mt-0.5">Visualize, manifest, and track progress on your grandest life visions, ${userName}.</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 bg-fuchsia text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-card cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" /> Add Dream
          </button>
        </div>

        {/* Masonry Columns Layout */}
        {isLoading ? (
          <div className="py-16 flex justify-center items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-fuchsia" />
            <span className="text-muted text-sm">Visualizing your dream board...</span>
          </div>
        ) : sortedDreams.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {sortedDreams.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="break-inside-avoid p-6 rounded-2xl bg-surface border border-border hover:border-fuchsia/30 transition duration-300 relative group flex flex-col justify-between mb-6 shadow-card overflow-hidden"
              >
                {/* Ribbon overlay if pinned */}
                {item.isPinned && (
                  <div className="absolute top-0 right-10 bg-fuchsia text-white px-2 py-0.5 rounded-b-md text-[10px] font-bold tracking-wider flex items-center gap-0.5 shadow-sm">
                    <Pin className="w-2.5 h-2.5 fill-white" /> PINNED
                  </div>
                )}

                <div className="space-y-4">
                  {/* Category and Year */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold capitalize ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-muted">
                      <Calendar className="w-3.5 h-3.5 text-muted" /> Target {item.targetYear}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold font-outfit text-text leading-snug">
                    {item.dream}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-muted text-xs leading-relaxed border-l-2 border-border/60 pl-3 italic">
                      "{item.description}"
                    </p>
                  )}

                  {/* Progress slide */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-muted">Manifesting Progress</span>
                      <span className="text-fuchsia">{item.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-panel rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia to-accent rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex justify-between items-center border-t border-border/40 mt-5 pt-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition duration-300">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(item)}
                      className={`p-1.5 rounded-lg border border-border hover:bg-panel transition cursor-pointer ${
                        item.isPinned ? 'text-fuchsia border-fuchsia/20 bg-fuchsia/10' : 'text-muted hover:text-text'
                      }`}
                      title={item.isPinned ? 'Unpin Dream' : 'Pin to top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 text-muted hover:text-text hover:bg-panel border border-border rounded-lg transition cursor-pointer"
                      title="Edit Dream"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-muted hover:text-rose hover:bg-rose/10 border border-border hover:border-rose/20 rounded-lg transition cursor-pointer"
                    title="Delete Dream"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface border border-dashed border-border rounded-2xl flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="w-10 h-10 text-muted" />
            <div className="space-y-1">
              <h3 className="font-bold text-text">Empty Dream Board</h3>
              <p className="text-muted text-xs max-w-xs mx-auto">
                No dreams visualized yet, ${userName}. Add your target visions, goals, or travel ideas and start tracking their manifestation!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ADD/EDIT MODAL */}
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
                  <Sparkles className="w-5 h-5 text-fuchsia animate-pulse" />
                  <span>{editingDream ? 'Refine Your Dream' : 'Visualize a New Dream'}</span>
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
                  <label className="text-xs font-bold text-muted">Dream Vision *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Travel to Switzerland, buy a sports car, build an AI startup"
                    value={dreamTitle}
                    onChange={(e) => setDreamTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-fuchsia outline-none text-text"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted">Manifestation Notes / Description</label>
                  <textarea
                    placeholder={`Describe the details, sights, sounds, or feeling of achieving this dream, ${userName}...`}
                    value={dreamDesc}
                    onChange={(e) => setDreamDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-fuchsia outline-none min-h-[70px] text-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted">Category</label>
                    <select
                      value={dreamCategory}
                      onChange={(e) => setDreamCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-fuchsia outline-none text-text cursor-pointer"
                    >
                      <option value="life" className="bg-surface">Life Vision</option>
                      <option value="career" className="bg-surface">Career / Business</option>
                      <option value="travel" className="bg-surface">Travel Goals</option>
                      <option value="wealth" className="bg-surface">Financial Assets</option>
                      <option value="relationships" className="bg-surface">Relationships</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted">Target Year</label>
                    <input
                      type="number"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 50}
                      value={dreamTargetYear}
                      onChange={(e) => setDreamTargetYear(e.target.value)}
                      className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-fuchsia outline-none text-text"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <label className="text-muted">Manifesting Progress</label>
                    <span className="text-fuchsia">{dreamProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dreamProgress}
                    onChange={(e) => setDreamProgress(e.target.value)}
                    className="w-full h-2 bg-panel rounded-lg appearance-none cursor-pointer accent-fuchsia"
                  />
                  <div className="flex justify-between text-[9px] text-muted font-bold">
                    <span>JUST STARTED</span>
                    <span>HALFWAY</span>
                    <span>ALMOST THERE</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-border/40 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 border border-border text-muted font-bold rounded-xl text-sm hover:bg-panel transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-fuchsia text-white font-bold rounded-xl text-sm hover:opacity-90 transition cursor-pointer"
                  >
                    Manifest
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
