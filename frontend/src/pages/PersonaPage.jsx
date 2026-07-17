import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { fetchPreferences, updatePreferences } from '../store/settingsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import {
  Sparkles, Award, Heart, Smile, BookOpen, GraduationCap,
  Loader2, CheckCircle2, Plus, X, Bot
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PersonaPage() {
  const user = useSelector((state) => state.auth.user);
  const userName = user ? user.fullName.split(' ')[0] : 'Friend';
  const dispatch = useDispatch();
  const { preferences, isLoading } = useSelector((state) => state.settings);

  // States
  const [activePersona, setActivePersona] = useState('maya_companion');
  const [isSaving, setIsSaving] = useState(false);
  const [customAgents, setCustomAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', description: '', systemPromptOverride: '', icon: '🤖' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchPreferences());
    fetchCustomAgents();
  }, [dispatch]);

  useEffect(() => {
    if (preferences) {
      setActivePersona(preferences.activePersonaId || 'maya_companion');
    }
  }, [preferences]);

  const fetchCustomAgents = async () => {
    try {
      setIsLoadingAgents(true);
      const res = await api.get('/custom-agents');
      setCustomAgents(res.data.agents || []);
    } catch (error) {
      console.error('Failed to fetch custom agents', error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const defaultPersonas = [
    {
      id: 'maya_companion',
      name: 'Companion (Default)',
      description: `Warm, supportive, and emotionally intelligent. Focuses on validation and daily stress reduction, ${userName}.`,
      icon: '💖',
      traits: ['Empathetic', 'Encouraging', 'Good Listener'],
      bg: 'from-pink-500/10 to-rose-500/5 hover:border-pink-500/40'
    },
    {
      id: 'arjun_mentor',
      name: 'Arjun (The Strict Tech Coach)',
      description: 'Professional, direct, and focused on your goals. Skips small talk to analyze code files, review resumes, and run interviews.',
      icon: '💻',
      traits: ['Structured', 'Analytical', 'Challenging'],
      bg: 'from-cyan-500/10 to-indigo-500/5 hover:border-cyan-500/40'
    },
    {
      id: 'priya_therapist',
      name: 'Priya (The Wellness Counselor)',
      description: 'Deeply calm, patient, and wellness-oriented. Specializes in handling panic, identifying emotional struggles, and suggesting breathing exercises.',
      icon: '🍃',
      traits: ['Calm', 'Mindful', 'Non-judgmental'],
      bg: 'from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/40'
    },
    {
      id: 'kavi_philosopher',
      name: 'Kavi (The Creative Philosopher)',
      description: 'Poetic, philosophical, and reflective. Likes to frame your daily challenges as heroic journeys, often adding Telugu/English quotes.',
      icon: '📜',
      traits: ['Reflective', 'Poetic', 'Intelligent'],
      bg: 'from-amber-500/10 to-orange-500/5 hover:border-amber-500/40'
    }
  ];

  const allPersonas = [
    ...defaultPersonas,
    ...customAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      icon: agent.icon,
      traits: agent.traits.length ? agent.traits : ['Custom Agent'],
      bg: 'from-purple-500/10 to-fuchsia-500/5 hover:border-purple-500/40',
      isCustom: true,
      _id: agent._id
    }))
  ];

  const handleSelectPersona = async (personaId) => {
    if (personaId === activePersona) return;

    setIsSaving(true);
    setActivePersona(personaId);
    try {
      await dispatch(updatePreferences({ activePersonaId: personaId })).unwrap();
      toast.success('Companion cognitive archetype updated successfully! 🧠');
    } catch (err) {
      toast.error('Failed to change persona archetype.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!newAgent.name || !newAgent.systemPromptOverride) {
      toast.error('Name and System Prompt are required.');
      return;
    }
    setIsCreating(true);
    try {
      await api.post('/custom-agents', newAgent);
      toast.success('Custom Agent Created! 🚀');
      setShowCreateModal(false);
      setNewAgent({ name: '', description: '', systemPromptOverride: '', icon: '🤖' });
      fetchCustomAgents();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create agent.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAgent = async (e, _id) => {
    e.stopPropagation();
    try {
      await api.delete(`/custom-agents/${_id}`);
      toast.success('Agent deleted.');
      fetchCustomAgents();
    } catch (error) {
      toast.error('Failed to delete agent.');
    }
  };

  const currentCompanionName = preferences?.aiName || 'Companion';

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center max-w-4xl">
          <div>
            <h2 className="text-3xl font-extrabold font-outfit text-text flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-accent animate-pulse" /> Agent Studio (GPT Store)
            </h2>
            <p className="text-muted text-sm mt-0.5">Select a persona or create your own custom AI agent, {userName}.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-light text-white rounded-xl font-bold transition shadow-lg"
          >
            <Plus className="w-4 h-4" /> Create Agent
          </button>
        </div>

        {/* Info card */}
        <div className="p-5 bg-surface border border-border rounded-2xl shadow-card max-w-3xl leading-relaxed text-xs">
          <p className="font-semibold text-muted">
            💡 Toggling archetypes updates the AI system prompts dynamically. Custom Agents override the base personality completely with your own instructions.
          </p>
        </div>

        {/* Persona list grid */}
        {(isLoading || isLoadingAgents) && !isSaving ? (
          <div className="py-20 flex justify-center items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="text-muted text-sm font-outfit">Loading agents...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {allPersonas.map((pers) => {
              const isActive = activePersona === pers.id;
              return (
                <div
                  key={pers.id}
                  onClick={() => handleSelectPersona(pers.id)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition duration-300 relative group flex flex-col justify-between overflow-hidden bg-gradient-to-r ${
                    pers.bg
                  } ${
                    isActive ? 'border-accent shadow-card' : 'border-border/60'
                  }`}
                >
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-4xl">{pers.icon}</span>
                      <div className="flex items-center gap-2">
                        {pers.isCustom && (
                          <button onClick={(e) => handleDeleteAgent(e, pers._id)} className="text-muted hover:text-rose-500 transition px-2 py-1 bg-panel rounded-md text-xs">Delete</button>
                        )}
                        {isActive && (
                          <CheckCircle2 className="w-6 h-6 text-accent fill-accent/10 animate-scale" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-base text-text group-hover:text-accent transition">
                        {pers.name}
                      </h3>
                      <p className="text-muted text-xs leading-relaxed font-semibold">
                        {pers.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-border/30">
                    {pers.traits.map((trait) => (
                      <span key={trait} className="px-2 py-0.5 bg-panel border border-border/80 rounded text-[9px] font-bold text-muted uppercase">
                        {trait}
                      </span>
                    ))}
                  </div>

                  {/* Ribbon tag if active */}
                  {isActive && (
                    <div className="absolute top-0 right-10 bg-accent text-white px-3 py-0.5 rounded-b-md text-[9px] font-bold tracking-wider">
                      ACTIVE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-panel">
                <h3 className="text-lg font-bold flex items-center gap-2"><Bot className="w-5 h-5 text-accent"/> Create Custom Agent</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-text"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateAgent} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Agent Name</label>
                  <input required type="text" value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="e.g. Data Scientist Pro" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Description</label>
                  <input required type="text" value={newAgent.description} onChange={e => setNewAgent({...newAgent, description: e.target.value})} className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="Brief description of what this agent does" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">System Prompt / Instructions</label>
                  <textarea required value={newAgent.systemPromptOverride} onChange={e => setNewAgent({...newAgent, systemPromptOverride: e.target.value})} className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none h-32 custom-scrollbar" placeholder="You are an expert... You must always..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Icon (Emoji)</label>
                  <input type="text" value={newAgent.icon} onChange={e => setNewAgent({...newAgent, icon: e.target.value})} className="w-20 bg-panel border border-border rounded-lg px-3 py-2 text-center text-xl focus:border-accent outline-none" />
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-panel text-text rounded-xl text-sm font-bold hover:bg-border transition">Cancel</button>
                  <button type="submit" disabled={isCreating} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent-light transition flex items-center gap-2">
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Create Agent'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
