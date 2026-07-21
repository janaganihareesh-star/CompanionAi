import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import AIAvatar from '../components/AIAvatar';
import { fetchPreferences } from '../store/settingsSlice';
import axios from 'axios';
import learningService from '../services/learningService';
import {
  GraduationCap,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  Trophy,
  Compass,
  Briefcase,
  BookOpen,
  Award,
  ChevronRight,
  Flame,
  Check,
  Undo
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const EDUCATION_LEVELS = [
  { value: 'school', label: 'School Student' },
  { value: 'high_school', label: 'High School Student' },
  { value: 'intermediate', label: 'Intermediate Student' },
  { value: 'polytechnic', label: 'Polytechnic Student' },
  { value: 'diploma', label: 'Diploma Student' },
  { value: 'degree', label: 'Degree Student' },
  { value: 'btech', label: 'B.Tech Student' },
  { value: 'mtech', label: 'M.Tech Student' },
  { value: 'mbbs', label: 'MBBS Student' },
  { value: 'medical', label: 'Medical Student' },
  { value: 'pharmacy', label: 'Pharmacy Student' },
  { value: 'nursing', label: 'Nursing Student' },
  { value: 'law', label: 'Law Student' },
  { value: 'mba', label: 'MBA Student' },
  { value: 'ca', label: 'CA Student' },
  { value: 'upsc', label: 'UPSC Aspirant' },
  { value: 'ssc', label: 'SSC Aspirant' },
  { value: 'banking', label: 'Banking Aspirant' },
  { value: 'railway', label: 'Railway Aspirant' },
  { value: 'state_exams', label: 'State Govt Exam Aspirant' },
  { value: 'competitive_exams', label: 'Competitive Exam Aspirant' },
  { value: 'professional', label: 'Working Professional' },
  { value: 'lifelong_learner', label: 'Lifelong Learner' }
];

const LANGUAGES = [
  'English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam',
  'Bengali', 'Marathi', 'Gujarati', 'Odia', 'Punjabi', 'Urdu', 'Sanskrit'
];

const TELUGU_DIALECTS = [
  { value: 'standard', label: 'Standard Telugu' },
  { value: 'telangana', label: 'Telangana Dialect' },
  { value: 'rayalaseema', label: 'Rayalaseema Dialect' },
  { value: 'coastal_andhra', label: 'Coastal Andhra Dialect' },
  { value: 'chittoor', label: 'Chittoor Dialect' },
  { value: 'godavari', label: 'Godavari Dialect' }
];

const LEARNING_STYLES = [
  { value: 'theory', label: 'Theory / Conceptual' },
  { value: 'practical', label: 'Practical / Code Examples' },
  { value: 'visual', label: 'Visual / ASCII Diagrams' },
  { value: 'fast', label: 'Fast Paced Summary' },
  { value: 'slow', label: 'Slow Step-by-Step' }
];

const LANGUAGE_CODE_MAP = {
  'English': 'en',
  'Telugu': 'te',
  'Hindi': 'hi',
  'Tamil': 'ta',
  'Kannada': 'kn',
  'Malayalam': 'ml',
  'Bengali': 'bn',
  'Marathi': 'mr',
  'Gujarati': 'gu',
  'Odia': 'or',
  'Punjabi': 'pa',
  'Urdu': 'ur',
  'Sanskrit': 'sa'
};

export default function LearningPage() {
  const user = useSelector((state) => state.auth.user);
  const userName = user ? user.fullName.split(' ')[0] : 'Friend';
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const userPreferences = useSelector((state) => state.settings.preferences);

  // Profile preferences states
  const [eduLevel, setEduLevel] = useState('btech');
  const [learningStyle, setLearningStyle] = useState('practical');
  const [speed, setSpeed] = useState('medium');
  const [lang, setLang] = useState('English');
  const [dialect, setDialect] = useState('standard');
  const [subjectsText, setSubjectsText] = useState('');
  const [isSavingPref, setIsSavingPref] = useState(false);

  // Conversational Tutor States
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: `Hello, ${userName}! I am your AI Learning Mentor. Ask me any conceptual doubt, request a quiz, or ask for a personalized study plan. Let's learn together! 🎓`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [playingAudioIdx, setPlayingAudioIdx] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  const messagesEndRef = useRef(null);

  // Sync preferences on load
  useEffect(() => {
    dispatch(fetchPreferences());
  }, [dispatch]);

  useEffect(() => {
    if (userPreferences) {
      setEduLevel(userPreferences.educationLevel || 'btech');
      setLearningStyle(userPreferences.learningStyle || 'practical');
      setSpeed(userPreferences.learningSpeed || 'medium');
      setLang(userPreferences.language || 'English');
      setDialect(userPreferences.teluguDialect || 'standard');
      setSubjectsText(userPreferences.learningSubjects?.join(', ') || '');
    }
  }, [userPreferences]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Save learning preferences handler
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setIsSavingPref(true);
    try {
      const processedSubjects = subjectsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');

      const updates = {
        educationLevel: eduLevel,
        learningStyle: learningStyle,
        learningSpeed: speed,
        language: lang,
        teluguDialect: dialect,
        learningSubjects: processedSubjects
      };

      await axios.put('/api/profile/preferences', updates, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('AI Learning Profile updated! 🧠');
      dispatch(fetchPreferences());
    } catch (err) {
      toast.error('Failed to update learning preferences.');
    } finally {
      setIsSavingPref(false);
    }
  };

  // Tutor chat handler
  const handleSendTutorMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const userText = inputText.trim();
    setInputText('');

    // Append user message
    const updatedMessages = [...messages, { role: 'user', text: userText }];
    setMessages(updatedMessages);
    setIsGenerating(true);

    try {
      // Map message history to Gemini contents format
      const historyPayload = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await learningService.chatTutor(userText, historyPayload, token);

      setMessages((prev) => [...prev, { role: 'model', text: res.reply }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tutor failed to respond.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Play Playback Text-to-Speech
  const handlePlayAudio = (text, idx) => {
    if (audioObj && playingAudioIdx === idx) {
      audioObj.pause();
      setAudioObj(null);
      setPlayingAudioIdx(null);
      return;
    }

    if (audioObj) {
      audioObj.pause();
    }

    // Clean markdown
    const cleanText = text.replace(/[*_#`~[\]]/g, '').substring(0, 200);
    const langCode = LANGUAGE_CODE_MAP[lang] || 'en';
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(cleanText)}&tl=${langCode}`;

    const newAudio = new Audio(ttsUrl);
    newAudio.play().then(() => {
      setAudioObj(newAudio);
      setPlayingAudioIdx(idx);
    }).catch(() => {
      toast.error('Voice playback failed on this browser.');
    });

    newAudio.onended = () => {
      setPlayingAudioIdx(null);
      setAudioObj(null);
    };
  };

  // Quick prompt templates
  const triggerQuickPrompt = (template) => {
    setInputText(template);
  };

  const companionName = userPreferences?.aiName || 'Companion';

  const quickShortcuts = [
    {
      label: '📚 Learn Concept',
      prompt: 'Explain OOP concepts with simple practical coding examples.',
      icon: BookOpen,
      color: 'text-cyan bg-cyan/10 border-cyan/20'
    },
    {
      label: '📝 Generate Quiz',
      prompt: 'Create a 3-question multiple-choice quiz on SQL joins. Let me answer.',
      icon: Award,
      color: 'text-amber bg-amber/10 border-amber/20'
    },
    {
      label: '💼 Mock Interview',
      prompt: 'Conduct a mock interview for a frontend React developer. Ask one query first.',
      icon: Briefcase,
      color: 'text-rose bg-rose/10 border-rose/20'
    },
    {
      label: '🗺️ Study Roadmap',
      prompt: 'Give me a step-by-step roadmap to learn machine learning from scratch.',
      icon: Compass,
      color: 'text-emerald bg-emerald/10 border-emerald/20'
    }
  ];

  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden">
      <Sidebar />

      {/* Main Workspace Split */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Dynamic Chat Sandbox */}
        <div className="flex-1 flex flex-col h-full bg-bg justify-between relative overflow-hidden border-r border-border/40">
          
          {/* Top Panel Header */}
          <div className="bg-surface border-b border-border/40 p-4 flex justify-between items-center z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan/10 text-cyan rounded-xl">
                <GraduationCap className="w-6 h-6 animate-bounce" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-text font-outfit text-sm">AI Learning Tutor</h4>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">
                  Personalized Academic Mentor
                </p>
              </div>
            </div>

            {/* Streak Counter display */}
            <div className="flex items-center gap-1.5 bg-amber/10 border border-amber/20 px-3 py-1 rounded-xl text-amber text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber animate-pulse" />
              <span>Study Streak Active</span>
            </div>
          </div>

          {/* Quick Actions overlay when conversation is fresh */}
          {messages.length === 1 && (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface border-b border-border/30">
              {quickShortcuts.map((short, index) => {
                const Icon = short.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => triggerQuickPrompt(short.prompt)}
                    className={`p-3 rounded-xl border cursor-pointer text-left space-y-1.5 transition ${short.color}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="block text-xs font-bold text-text">{short.label}</span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Messages Scroll Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isModel = msg.role === 'model';
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 max-w-[80%] ${
                      isModel ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'
                    }`}
                  >
                    {isModel ? (
                      <AIAvatar size="w-9 h-9" emoji="🤖" status="online" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm select-none flex-shrink-0">
                        🧑
                      </div>
                    )}

                    <div className="space-y-1">
                      <div
                        className={`p-4 rounded-2xl border text-xs leading-relaxed max-w-full overflow-x-auto whitespace-pre-wrap font-medium shadow-sm text-left ${
                          isModel
                            ? 'bg-surface border-border text-text'
                            : 'bg-accent border-accent text-white rounded-tr-none'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* TTS speaker icon for model messages */}
                      {isModel && (
                        <div className="flex justify-start">
                          <button
                            onClick={() => handlePlayAudio(msg.text, index)}
                            className={`p-1.5 rounded-lg border border-border hover:bg-panel transition cursor-pointer flex items-center gap-1 text-[9px] font-bold ${
                              playingAudioIdx === index ? 'text-cyan border-cyan/30 bg-cyan/5' : 'text-muted'
                            }`}
                            title="Read response aloud"
                          >
                            {playingAudioIdx === index ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-cyan animate-pulse" />
                                <span>Stop Reading</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Read Aloud</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isGenerating && (
              <div className="flex gap-3 mr-auto items-center">
                <AIAvatar size="w-9 h-9" emoji="🤖" status="online" />
                <div className="p-4 rounded-2xl bg-surface border border-border text-xs text-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '0.4s' }} />
                  <span className="text-xs font-semibold">Tutor is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form input bar */}
          <div className="bg-surface border-t border-border/40 p-4">
            <form onSubmit={handleSendTutorMessage} className="flex gap-2 items-center">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendTutorMessage(e);
                  }
                }}
                placeholder={`Ask ${companionName} any question (e.g. explain Python decorator, ca taxation guidelines...)`}
                className="flex-1 bg-panel border border-border text-text rounded-xl px-4 py-3 placeholder:text-muted focus:border-cyan outline-none resize-none h-12 transition text-sm leading-relaxed max-h-24"
              />
              
              <button
                type="submit"
                disabled={!inputText.trim() || isGenerating}
                className="p-3 bg-cyan text-white rounded-xl hover:opacity-90 transition disabled:opacity-40 cursor-pointer flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Tutor Profile Configurations */}
        <div className="w-80 bg-surface border-l border-border/40 h-full flex flex-col justify-between overflow-y-auto p-4 space-y-6">
          <div className="space-y-4 text-left">
            <h3 className="font-extrabold font-outfit text-base flex items-center gap-1.5 text-text border-b border-border/40 pb-3">
              <Settings className="w-5 h-5 text-cyan animate-spin-slow" />
              <span>Tutor Settings Profile</span>
            </h3>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs font-semibold text-text">
              
              {/* Level Dropdown */}
              <div className="space-y-1.5">
                <label className="text-muted block">Education Level</label>
                <select
                  value={eduLevel}
                  onChange={(e) => setEduLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-panel border border-border rounded-xl focus:border-cyan outline-none text-text cursor-pointer"
                >
                  {EDUCATION_LEVELS.map((el) => (
                    <option key={el.value} value={el.value} className="bg-surface text-text">
                      {el.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Selection */}
              <div className="space-y-1.5">
                <label className="text-muted block">Teaching Language</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full px-3 py-2 bg-panel border border-border rounded-xl focus:border-cyan outline-none text-text cursor-pointer"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l} className="bg-surface text-text">
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dialect Selection for Telugu */}
              {lang === 'Telugu' && (
                <div className="space-y-1.5">
                  <label className="text-muted block">Telugu Dialect</label>
                  <select
                    value={dialect}
                    onChange={(e) => setDialect(e.target.value)}
                    className="w-full px-3 py-2 bg-panel border border-border rounded-xl focus:border-cyan outline-none text-text cursor-pointer animate-fadeIn"
                  >
                    {TELUGU_DIALECTS.map((td) => (
                      <option key={td.value} value={td.value} className="bg-surface text-text">
                        {td.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Learning Style */}
              <div className="space-y-1.5">
                <label className="text-muted block">Preferred Explanation Style</label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-panel border border-border rounded-xl focus:border-cyan outline-none text-text cursor-pointer"
                >
                  {LEARNING_STYLES.map((ls) => (
                    <option key={ls.value} value={ls.value} className="bg-surface text-text">
                      {ls.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Learning Speed */}
              <div className="space-y-1.5">
                <label className="text-muted block">Tutor Speed</label>
                <div className="flex gap-2">
                  {['slow', 'medium', 'fast'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      className={`flex-1 py-1.5 border rounded-lg text-center capitalize cursor-pointer transition ${
                        speed === s
                          ? 'border-cyan bg-cyan/15 text-cyan'
                          : 'bg-panel border-border text-muted hover:border-cyan/40'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subjects / Interests */}
              <div className="space-y-1.5">
                <label className="text-muted block">Subjects of Interest</label>
                <input
                  type="text"
                  value={subjectsText}
                  onChange={(e) => setSubjectsText(e.target.value)}
                  placeholder="e.g. Physics, Anatomy, DSA, UPSC"
                  className="w-full px-3 py-2 bg-panel border border-border rounded-xl focus:border-cyan outline-none text-text text-xs"
                />
                <span className="text-[10px] text-muted leading-tight block">
                  Separate multiple subjects with commas.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPref}
                  className="w-full py-2.5 bg-cyan text-white font-bold rounded-xl hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSavingPref ? (
                    'Saving Settings...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Tutor Profile
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Quick guidelines reminder info block */}
          <div className="p-3 bg-cyan/5 border border-cyan/10 rounded-xl space-y-1 text-[10px] text-muted text-left font-medium leading-relaxed">
            <span className="block font-bold text-cyan flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Tutor Tip
            </span>
            <p>
              Your AI dynamically tailvers calculations, code fragments, or dialect terms according to your profile updates.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
