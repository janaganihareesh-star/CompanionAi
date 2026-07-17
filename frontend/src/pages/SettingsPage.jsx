import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { fetchPreferences, updatePreferences } from '../store/settingsSlice';
import useTheme from '../hooks/useTheme';
import HardwareManager from '../components/HardwareManager';
import axios from 'axios';
import {
  Settings,
  Sun,
  Moon,
  ShieldAlert,
  Bell,
  Heart,
  Save,
  Loader2,
  Sparkles,
  Volume2,
  Download,
  Trash2,
  ChevronDown
} from 'lucide-react';

const LANGS = [
  { value: 'English', label: 'English' },
  { value: 'Telugu', label: 'Telugu (తెలుగు)' },
  { value: 'Hindi', label: 'Hindi (हिन्दी)' },
  { value: 'Tamil', label: 'Tamil (தமிழ்)' },
  { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'Malayalam', label: 'Malayalam (മലയാളം)' },
  { value: 'Marathi', label: 'Marathi (मराठी)' },
  { value: 'Bengali', label: 'Bengali (বাংলা)' },
  { value: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
  { value: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { value: 'Urdu', label: 'Urdu (اردو)' },
  { value: 'Spanish', label: 'Spanish (Español)' },
  { value: 'French', label: 'French (Français)' },
  { value: 'German', label: 'German (Deutsch)' },
  { value: 'Japanese', label: 'Japanese (日本語)' },
  { value: 'Korean', label: 'Korean (한국어)' },
  { value: 'Chinese', label: 'Chinese (中文)' }
];
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const user = useSelector((state) => state.auth.user);
  const userName = user ? user.fullName.split(' ')[0] : 'Friend';
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { preferences, isLoading } = useSelector((state) => state.settings);
  const { mode, setTheme } = useTheme();

  // Local state for inputs
  const [aiName, setAiName] = useState('Companion');
  const [aiGender, setAiGender] = useState('female');
  const [boundary, setBoundary] = useState('friendly');
  const [notifications, setNotifications] = useState(true);
  const [activePersonaId, setActivePersonaId] = useState('maya_companion');
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState('');
  const [morningReport, setMorningReport] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [appStoreSafeMode, setAppStoreSafeMode] = useState(false);
  
  // Trusted contacts
  const [contact1Name, setContact1Name] = useState('');
  const [contact1Email, setContact1Email] = useState('');
  const [contact2Name, setContact2Name] = useState('');
  const [contact2Email, setContact2Email] = useState('');

  // Loading state
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    dispatch(fetchPreferences());
  }, [dispatch]);

  // Sync state once preferences load
  useEffect(() => {
    if (preferences) {
      setAiName(preferences.aiName || 'Companion');
      setAiGender(preferences.aiGender || 'female');
      setBoundary(preferences.relationshipBoundary || 'friendly');
      setNotifications(preferences.notificationsEnabled !== undefined ? preferences.notificationsEnabled : true);
      setActivePersonaId(preferences.activePersonaId || 'maya_companion');
      setOfflineMode(preferences.offlineMode || false);
      setElevenLabsVoiceId(preferences.elevenLabsVoiceId || '');
      setMorningReport(preferences.morningReportEnabled || false);
      setAppStoreSafeMode(preferences.appStoreSafeMode || false);
      
      if (preferences.trustedContact1) {
        setContact1Name(preferences.trustedContact1.name || '');
        setContact1Email(preferences.trustedContact1.email || '');
      }
      if (preferences.trustedContact2) {
        setContact2Name(preferences.trustedContact2.name || '');
        setContact2Email(preferences.trustedContact2.email || '');
      }
    }
  }, [preferences]);

  const handleThemeSwitch = async (targetMode) => {
    if (mode !== targetMode) {
      setTheme(targetMode); // Local redux change
      try {
        await axios.put('/api/profile/theme', { themeMode: targetMode }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to sync theme to DB:', err);
      }
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const updates = {
      aiName,
      aiGender,
      relationshipBoundary: boundary,
      notificationsEnabled: notifications,
      activePersonaId,
      offlineMode,
      appStoreSafeMode,
      elevenLabsVoiceId,
      morningReportEnabled: morningReport,
      trustedContact1: { name: contact1Name, email: contact1Email },
      trustedContact2: { name: contact2Name, email: contact2Email }
    };

    try {
      await dispatch(updatePreferences(updates)).unwrap();
      toast.success('Companion parameters saved successfully! ✨');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await axios.get('/api/settings/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `closer-ai-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Your data has been exported successfully! 📦');
    } catch (err) {
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteEmail || !deletePassword) {
      return toast.error('Please enter your email and password to confirm deletion.');
    }

    setIsDeletingAccount(true);
    try {
      await axios.delete('/api/settings/account', {
        headers: { Authorization: `Bearer ${token}` },
        data: { email: deleteEmail, password: deletePassword }
      });
      toast.success('Account deleted. Goodbye ra, take care! 💔');
      setTimeout(() => window.location.href = '/', 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold font-outfit text-text flex items-center gap-2">
              <Settings className="w-8 h-8 text-accent animate-spin-slow" /> Custom Settings
            </h2>
            <p className="text-muted text-sm mt-0.5">Adjust theme templates, safety protocols, and configure companion boundaries, ${userName}.</p>
          </div>
        </div>

        {isLoading && !isSaving ? (
          <div className="py-20 flex justify-center items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="text-muted text-sm">Loading user preferences...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
            
            {/* SECTION 1: THEME SWATCH CODES */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4">
              <h3 className="text-lg font-bold font-outfit text-text flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" /> App Styling Theme
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Dark Swatch */}
                <div
                  onClick={() => handleThemeSwitch('dark')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex justify-between items-center ${
                    mode === 'dark'
                      ? 'border-accent bg-panel text-accent font-bold shadow-sm'
                      : 'border-border/60 hover:border-accent/40 bg-panel/30 text-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-accent" />
                    <span className="text-xs">Midnight Obsidian</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-muted">DARK MODE</span>
                </div>

                {/* Light Swatch */}
                <div
                  onClick={() => handleThemeSwitch('light')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex justify-between items-center ${
                    mode === 'light'
                      ? 'border-accent bg-panel text-accent font-bold shadow-sm'
                      : 'border-border/60 hover:border-accent/40 bg-panel/30 text-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-amber-500 text-amber" />
                    <span className="text-xs">Solstice Lavender</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-muted">LIGHT MODE</span>
                </div>

                {/* Cyberpunk Swatch */}
                <div
                  onClick={() => handleThemeSwitch('cyberpunk')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex justify-between items-center ${
                    mode === 'cyberpunk'
                      ? 'border-accent bg-panel text-accent font-bold shadow-sm'
                      : 'border-border/60 hover:border-accent/40 bg-panel/30 text-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-fuchsia-500 text-fuchsia" />
                    <span className="text-xs">Neon City (Cyberpunk)</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-muted">CYBERPUNK</span>
                </div>

                {/* Ocean Swatch */}
                <div
                  onClick={() => handleThemeSwitch('ocean')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex justify-between items-center ${
                    mode === 'ocean'
                      ? 'border-accent bg-panel text-accent font-bold shadow-sm'
                      : 'border-border/60 hover:border-accent/40 bg-panel/30 text-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-500 text-cyan" />
                    <span className="text-xs">Deep Blue Sea</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-muted">OCEAN</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: COMPANION PERSONALITY PREFERENCES */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4">
              <h3 className="text-lg font-bold font-outfit text-text flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose" /> Companion Attributes
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-muted">Companion AI Name</label>
                  <input
                    type="text"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-accent outline-none text-text"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-muted">Custom ElevenLabs Voice ID (Optional)</label>
                  <input
                    type="text"
                    value={elevenLabsVoiceId}
                    onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                    placeholder="e.g. pNInz6obpgDQGcFmaJcg"
                    className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-accent outline-none text-text"
                  />
                  <p className="text-[10px] text-muted ml-1">If provided, this Voice ID will be used for AI voice synthesis instead of default voices.</p>
                </div>
              </div>

              {/* Relationship Boundary Chips -> Replaced with Premium Cards */}
              <div className="space-y-4 pt-4 border-t border-border mt-4">
                <div className="space-y-1">
                  <label className="text-base font-bold text-text font-outfit flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" /> Companion Vibe & Persona
                  </label>
                  <p className="text-xs text-muted">Choose how CloserAI should emotionally connect with you.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'formal', emoji: '👔', label: 'Formal Professional', desc: 'Respectful, direct, and focused on tasks. Minimal emotional expression.' },
                    { value: 'friendly', emoji: '🤝', label: 'Casual Friendly', desc: 'Like a chill coworker or casual acquaintance. Light-hearted and helpful.' },
                    { value: 'warm', emoji: '💖', label: 'Warm Supportive', desc: 'Like a close friend who encourages you and actively supports your goals.' },
                    { value: 'family', emoji: '🏡', label: 'Loving Family', desc: 'Like a caring parent or sibling. Very protective and affectionate.' },
                    { value: 'very_caring', emoji: '🥺', label: 'Very Caring & Empathic', desc: 'Deeply emotional, affectionate, and deeply invested in your well-being.' },
                    { value: 'mentor', emoji: '🎯', label: 'Strict Mentor', desc: 'Disciplined and motivating. Pushes you hard to achieve your goals without excuses.' }
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setBoundary(opt.value)}
                      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 group ${
                        boundary === opt.value
                          ? 'bg-accent/10 border-accent shadow-[0_0_15px_rgba(var(--color-accent),0.15)]'
                          : 'bg-panel/40 border-border hover:bg-surface hover:border-accent/40'
                      }`}
                    >
                      <div className={`text-2xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border transition-colors ${
                        boundary === opt.value ? 'bg-accent/20 border-accent/30' : 'bg-surface border-border group-hover:bg-panel'
                      }`}>
                        {opt.emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-sm mb-1 transition-colors ${boundary === opt.value ? 'text-accent' : 'text-text'}`}>
                          {opt.label}
                        </h4>
                        <p className="text-xs text-muted leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: SYSTEM NOTIFICATION SWITCH INDICATORS */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4">
              <h3 className="text-lg font-bold font-outfit text-text flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan" /> Notification Triggers
              </h3>

              <label className="flex items-center gap-3 p-4 bg-panel border border-border rounded-xl cursor-pointer hover:bg-panel/85 transition select-none">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-cyan focus:ring-cyan accent-cyan cursor-pointer"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-text">Push Notifications Enabled</span>
                  <span className="block text-[10px] text-muted">Receive auto-reminders and daily wellness notifications, \${userName}.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-panel border border-border rounded-xl cursor-pointer hover:bg-panel/85 transition select-none">
                <input
                  type="checkbox"
                  checked={offlineMode}
                  onChange={(e) => setOfflineMode(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-cyan focus:ring-cyan accent-cyan cursor-pointer"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-text">Full Local Brain (Offline Mode)</span>
                  <span className="block text-[10px] text-muted">Bypass cloud APIs and run securely on local Ollama engine (Port 11434).</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-panel border border-border rounded-xl cursor-pointer hover:bg-panel/85 transition select-none">
                <input
                  type="checkbox"
                  checked={morningReport}
                  onChange={(e) => setMorningReport(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-cyan focus:ring-cyan accent-cyan cursor-pointer"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-text">Autonomous Morning Report</span>
                  <span className="block text-[10px] text-muted">Allow {aiName || 'Closer'} to run daily background searches and send a morning intelligence brief.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-panel border border-rose-500/30 rounded-xl cursor-pointer hover:bg-rose-500/10 transition select-none">
                <input
                  type="checkbox"
                  checked={appStoreSafeMode}
                  onChange={(e) => setAppStoreSafeMode(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-rose-500 focus:ring-rose-500 accent-rose-500 cursor-pointer"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-rose-500 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> App Store Review Safe Mode
                  </span>
                  <span className="block text-[10px] text-muted">Temporarily disable dynamic Pyodide execution, background voice, and native OS capabilities to pass strict App Store review guidelines.</span>
                </div>
              </label>
            </div>

            {/* SECTION 4: TRUSTED CONTACTS SETUP */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4">
              <div className="flex gap-2 items-center">
                <ShieldAlert className="w-6 h-6 text-rose" />
                <div>
                  <h3 className="text-lg font-bold font-outfit text-text">Emergency Safety Contacts</h3>
                  <p className="text-muted text-[10px]">Configured numbers for wellness safety alerts if critical stress triggers occur, \${userName}.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact 1 */}
                <div className="space-y-3 p-4 bg-panel border border-border rounded-xl">
                  <span className="text-[10px] font-bold text-rose uppercase tracking-wider block">Primary Contact</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={contact1Name}
                      onChange={(e) => setContact1Name(e.target.value)}
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs outline-none text-text focus:border-rose"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={contact1Email}
                      onChange={(e) => setContact1Email(e.target.value)}
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs outline-none text-text focus:border-rose"
                    />
                  </div>
                </div>

                {/* Contact 2 */}
                <div className="space-y-3 p-4 bg-panel border border-border rounded-xl">
                  <span className="text-[10px] font-bold text-rose uppercase tracking-wider block">Secondary Contact</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={contact2Name}
                      onChange={(e) => setContact2Name(e.target.value)}
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs outline-none text-text focus:border-rose"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={contact2Email}
                      onChange={(e) => setContact2Email(e.target.value)}
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs outline-none text-text focus:border-rose"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: HARDWARE COMPANIONS */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4">
              <HardwareManager />
            </div>

            {/* SECTION 6: DATA PRIVACY & ACCOUNT */}
            <div className="p-6 rounded-2xl bg-surface border border-rose/20 shadow-card space-y-4">
              <div className="flex gap-2 items-center">
                <ShieldAlert className="w-6 h-6 text-rose" />
                <div>
                  <h3 className="text-lg font-bold font-outfit text-text">Data Privacy & Account</h3>
                  <p className="text-muted text-[10px]">Export or permanently delete all your personal data stored in CloserAI, \${userName}.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Data */}
                <div className="p-4 bg-panel border border-border rounded-xl space-y-2">
                  <span className="text-xs font-bold text-cyan block">📦 Export My Data</span>
                  <p className="text-[10px] text-muted leading-relaxed">
                    Download all your chats, memories, goals, and achievements as a JSON file.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="w-full mt-2 px-4 py-2.5 border border-cyan/40 text-cyan font-bold rounded-xl text-xs hover:bg-cyan/5 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    {isExporting ? 'Exporting...' : 'Export Data'}
                  </button>
                </div>

                {/* Delete Account */}
                <div className="p-4 bg-rose/5 border border-rose/20 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-rose block">⚠️ Delete My Account</span>
                  <p className="text-[10px] text-muted leading-relaxed">
                    Permanently erase all your data from CloserAI. This cannot be reversed, \${userName}.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteAccountClick}
                    disabled={isDeletingAccount}
                    className="w-full mt-2 px-4 py-2.5 border border-rose/40 text-rose font-bold rounded-xl text-xs hover:bg-rose/10 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isDeletingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-end pt-4">
               <button
                 type="submit"
                 disabled={isSaving}
                 className="px-6 py-3 bg-accent text-white font-bold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-card"
               >
                 {isSaving ? (
                   <>
                     <Loader2 className="w-4 h-4 animate-spin" /> Saving changes...
                   </>
                 ) : (
                   <>
                     <Save className="w-4 h-4" /> Save Companion Profile Settings
                   </>
                 )}
               </button>
            </div>

          </form>
        )}
      </main>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-rose/30 shadow-2xl rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="w-6 h-6 text-rose animate-pulse" />
              <h2 className="text-xl font-bold font-outfit text-rose">Confirm Account Deletion</h2>
            </div>
            <p className="text-sm text-muted mb-6">
              This action is permanent and cannot be undone. All your chats, memories, and progress will be erased forever. To proceed, please confirm your credentials.
            </p>

            <form onSubmit={confirmDeleteAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted">Email Address</label>
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-rose outline-none text-text"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted">Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 bg-panel border border-border rounded-xl text-sm focus:border-rose outline-none text-text"
                />
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-xs text-rose hover:underline font-bold">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 px-4 py-3 bg-panel hover:bg-surface border border-border text-text font-bold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount}
                  className="flex-1 px-4 py-3 bg-rose/10 hover:bg-rose/20 border border-rose/50 text-rose font-bold rounded-xl text-sm transition flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isDeletingAccount ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
