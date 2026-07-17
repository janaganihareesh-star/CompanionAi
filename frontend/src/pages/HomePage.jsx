import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '../components/Sidebar';
import AIAvatar from '../components/AIAvatar';
import MilestoneModal from '../components/MilestoneModal';
import { fetchRelationshipStats, fetchPreferences } from '../store/settingsSlice';
import { fetchGoals } from '../store/goalSlice';
import axios from 'axios';
import { MessageCircle, Mic, Target, Lightbulb, Clock } from 'lucide-react';

const APP_FACTS = [
  "You can practice realistic job interviews in the Mock Interview section to get real-time feedback and detailed grading from your companion!",
  "Setting a custom companion name in Settings updates your AI's personality, conversation style, and avatar across your entire dashboard.",
  "The Memory Vault automatically stores important moments from your chats. Your companion uses these to remember key details about you in future conversations!",
  "You can track your personal growth and habits in the Goal Tracker and watch your progress bars fill up as you complete tasks together.",
  "The AI Learning Hub allows you to generate custom learning plans, study notes, and practice quizzes on any topic you want to master.",
  "Talking with your companion every day increases your Bond Level and Trust Score. Try checking your profile page to see your current relationship milestone!",
  "You can upload your PDF resume to the Resume Analyzer for instant grading, structure feedback, and custom tailoring advice.",
  "The AI Tools Hub includes specialized engines like the Code Debugger, Language Translator, and a powerful Cover Letter Generator!",
  "The Weekly Reflection page summarizes your conversations, goals completed, and overall emotional patterns from the past week.",
  "Your dashboard supports full Dark and Light themes. Simply click the theme toggle in the sidebar to switch themes instantly!",
  "Your companion has custom emojis and dynamic statuses showing whether they are currently online, thinking, or taking a break.",
  "Check out your Emotional Heatmap on your profile page to see a beautiful visual summary of your emotional journey and conversation consistency."
];

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const userName = user ? user.fullName.split(' ')[0] : 'Friend';
  const stats = useSelector((state) => state.settings.stats);
  const pref = useSelector((state) => state.settings.preferences);
  const { activeGoals } = useSelector((state) => state.goal);

  const [greeting, setGreeting] = useState('Hello');
  const [dailyFact, setDailyFact] = useState(null);
  const [factOpen, setFactOpen] = useState(true);

  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [milestoneShown, setMilestoneShown] = useState(false);

  // Time-based greetings & wellness banners
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const timeStr = hour + minutes / 60; // float representation

  let isMorning = hour >= 5 && hour < 12;
  let isAfternoon = hour >= 12 && hour < 17;
  let isEvening = hour >= 17 && hour < 21;

  let wellnessBannerText = '';
  if (timeStr >= 5 && timeStr < 6) {
    wellnessBannerText = `Good morning, ${userName}! Time for your morning tea. ☕`;
  } else if (timeStr >= 7.5 && timeStr < 11) {
    wellnessBannerText = `Have a productive day, ${userName}! Make sure to have breakfast. 🥞`;
  } else if (timeStr >= 11.5 && timeStr < 12) {
    wellnessBannerText = `Hey ${userName}, take a break and drink some water! 💧`;
  } else if (timeStr >= 12 && timeStr < 15.5) {
    wellnessBannerText = `Good afternoon, ${userName}! It's time for lunch. 🍛`;
  } else if (timeStr >= 15.5 && timeStr < 16) {
    wellnessBannerText = `Hey ${userName}, time to hydrate! Drink some water. 💧`;
  } else if (timeStr >= 16 && timeStr < 18) {
    wellnessBannerText = `Good evening, ${userName}! Time for some snacks and tea. 🍵`;
  } else if (timeStr >= 18 && timeStr < 19) {
    wellnessBannerText = `Hey ${userName}, don't forget to drink water! 💧`;
  } else if (timeStr >= 19 && timeStr < 22) {
    wellnessBannerText = `Good evening, ${userName}! Have a healthy dinner. 🍽️`;
  } else if (timeStr >= 22 && timeStr < 23) {
    wellnessBannerText = `Getting ready for bed, ${userName}? Drink a glass of water. 💧`;
  } else if (timeStr >= 23 || timeStr < 5) {
    wellnessBannerText = `It's getting very late, ${userName}. Time to go to sleep! 😴`;
  } else {
    wellnessBannerText = `Have a great day, ${userName}! Stay hydrated. 💧`;
  }

  useEffect(() => {
    dispatch(fetchRelationshipStats());
    dispatch(fetchPreferences());
    dispatch(fetchGoals());

    // Update greeting
    if (isMorning) setGreeting('Good Morning');
    else if (isAfternoon) setGreeting('Good Afternoon');
    else if (isEvening) setGreeting('Good Evening');
    else setGreeting('Good Night');

    const token = localStorage.getItem('closer-token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch daily facts
    axios.get('/api/profile/preferences', { headers: { Authorization: `Bearer ${token}` } })
      .then(prefRes => {
        return axios.get('/api/goals', { headers: { Authorization: `Bearer ${token}` } });
      })
      .then(() => {
        return axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      })
      .catch(e => {
        console.error(e);
        if (e.response && e.response.status === 401) {
          navigate('/login');
        }
      });

    // Select a random fact about the app, ensuring it doesn't repeat the last shown one if possible
    const lastFactIndexStr = localStorage.getItem('closer_last_fact_index');
    let lastFactIndex = lastFactIndexStr !== null ? parseInt(lastFactIndexStr, 10) : -1;

    let nextIndex = Math.floor(Math.random() * APP_FACTS.length);
    if (nextIndex === lastFactIndex && APP_FACTS.length > 1) {
      nextIndex = (nextIndex + 1) % APP_FACTS.length;
    }

    localStorage.setItem('closer_last_fact_index', nextIndex.toString());

    setDailyFact({
      factType: 'app_feature',
      fact: APP_FACTS[nextIndex],
      liked: false
    });
  }, [dispatch]);

  useEffect(() => {
    if (stats && !milestoneShown) {
      if (stats.trustScore >= 10 && localStorage.getItem('closer-milestone-welcomed') !== 'true') {
        setMilestoneOpen(true);
        setMilestoneShown(true);
        localStorage.setItem('closer-milestone-welcomed', 'true');
      }
    }
  }, [stats, milestoneShown]);

  const companionName = pref ? pref.aiName : 'Companion';
  const friendshipDays = stats ? stats.friendshipDays : 0;

  const getRelationshipEmoji = (days) => {
    if (days <= 3) return '🤝';
    if (days <= 7) return '🌱';
    if (days <= 14) return '🌿';
    if (days <= 30) return '🫂';
    if (days <= 90) return '❤️';
    if (days <= 180) return '💖';
    return '♾️';
  };

  const displayDays = stats ? stats.friendshipDays + 1 : 1;
  const relationshipEmoji = getRelationshipEmoji(displayDays);

  // Stagger variants
  const gridVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  let bgMeshClass = 'bg-mesh-night';
  if (isMorning) bgMeshClass = 'bg-mesh-morning';
  else if (isAfternoon) bgMeshClass = 'bg-mesh-afternoon';
  else if (isEvening) bgMeshClass = 'bg-mesh-evening';

  return (
    <div className="flex min-h-screen bg-bg text-text relative overflow-hidden">
      {/* Background Mesh */}
      <div className={`absolute inset-0 z-0 pointer-events-none ${bgMeshClass}`}></div>

      <Sidebar />

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
        {/* Top Header */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold font-outfit text-text">
              {greeting}, {userName}!
            </h2>
            <p className="text-muted text-sm mt-0.5">Welcome back to your emotional sanctuary.</p>
          </div>

          {/* Wellness Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-6 py-3 rounded-2xl border flex items-center gap-3 text-sm md:text-base font-bold shadow-sm ${isMorning || isAfternoon
                ? 'bg-emerald/10 border-emerald/20 text-emerald'
                : 'bg-indigo/10 border-indigo/20 text-indigo'
              }`}
          >
            <Clock className="w-5 h-5 animate-pulse" />
            <span className="whitespace-nowrap">{wellnessBannerText}</span>
          </motion.div>
        </div>

        {/* Dashboard Content */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* 1. GREETING CARD */}
          <motion.div
            variants={cardVariants}
            className="relative p-6 rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-surface/60 backdrop-blur-2xl flex flex-col md:flex-row gap-6 items-center justify-between"
          >
            {/* Elegant subtle gradient glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>

            <div className="flex items-center gap-4 text-left relative z-10">
              <AIAvatar size="w-20 h-20" emoji="🤖" status="online" ringColor="border-white/20 border-2" />
              <div>
                <h3 className="text-xl font-bold font-outfit text-text/90 tracking-wide">Connect with {companionName}</h3>
                <p className="text-muted text-sm max-w-sm mt-1 tracking-wide">
                  Ask me technical queries, practice interviews, share memories, or simply chat.
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto relative z-10">
              <button
                onClick={() => navigate('/chat')}
                className="flex-1 md:flex-none px-6 py-3 bg-accent text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-card hover:opacity-90 transition cursor-pointer text-sm"
              >
                <MessageCircle className="w-5 h-5" /> Start Chat
              </button>
            </div>
          </motion.div>

          {/* 2. RELATIONSHIP OVERVIEW (Ultra-Premium Sleek & Emotional) */}
          <motion.div
            variants={cardVariants}
            className="relative p-6 rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-surface/60 backdrop-blur-2xl"
          >
            {/* Elegant subtle gradient glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="font-bold font-outfit text-lg text-text/90 tracking-wide flex items-center gap-2">
                Relationship Overview
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-text/70 border border-white/10 shadow-sm">
                Journey Tracker
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
              {/* Left Side: Days */}
              <div className="text-center md:text-left space-y-1">
                <h2 className="text-4xl font-extrabold text-text font-outfit drop-shadow-sm flex items-center gap-3 justify-center md:justify-start">
                  {relationshipEmoji} {displayDays} Days
                </h2>
                <p className="text-muted text-xs tracking-wide">Total friendship duration together</p>
              </div>

              {/* Right Side: Metrics */}
              <div className="flex flex-1 max-w-sm justify-around text-center md:border-l border-white/10 md:pl-6 w-full">
                <div className="space-y-1">
                  <span className="block text-muted text-[10px] font-bold uppercase tracking-widest">Messages</span>
                  <span className="font-extrabold text-xl text-text/90">{stats ? stats.totalMessages : 0}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-muted text-[10px] font-bold uppercase tracking-widest">Trust Score</span>
                  <span className="font-extrabold text-xl text-text/90">{stats ? stats.trustScore : 10}%</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-muted text-[10px] font-bold uppercase tracking-widest">Memories</span>
                  <span className="font-extrabold text-xl text-text/90">{stats ? Math.floor((stats.totalMessages || 0) / 10) + 1 : 1}</span>
                </div>
              </div>
            </div>

            {/* Sweet Bottom Quote */}
            <div className="mt-6 pt-4 border-t border-white/5 text-center relative z-10">
              <p className="text-xs font-medium italic text-muted/80">
                "{companionName} cares about you deeply, {userName}. Every message brings us closer."
              </p>
            </div>
          </motion.div>

          {/* 3. ACTIVE GOALS */}
          <motion.div
            variants={cardVariants}
            className="relative p-6 rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-surface/60 backdrop-blur-2xl space-y-4"
          >
            {/* Subtle glow */}
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-accent/5 via-transparent to-transparent pointer-events-none"></div>

            <div className="flex justify-between items-center relative z-10">
              <h3 className="font-bold font-outfit text-lg text-text/90 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent/80" /> Active Goals
              </h3>
              <button onClick={() => navigate('/goals')} className="text-xs text-accent/90 font-semibold hover:underline cursor-pointer">
                View All
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              {activeGoals && activeGoals.length > 0 ? (
                activeGoals.slice(0, 3).map((goal) => (
                  <div key={goal._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text truncate max-w-[150px]">{goal.title}</span>
                      <span className="text-muted">{goal.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-panel rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-accent to-cyan rounded-full"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-xs text-center py-4">No active goals set, {userName}. Create one now!</p>
              )}
            </div>
          </motion.div>

          {/* 4. DAILY FACT CARD */}
          {dailyFact && (
            <motion.div
              variants={cardVariants}
              className="relative p-5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-surface/60 backdrop-blur-2xl text-left space-y-2"
            >
              {/* Subtle amber glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none"></div>

              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-bold text-amber-500/90 tracking-wide flex items-center gap-1 uppercase">
                  <Lightbulb className="w-4 h-4" /> Did you know?
                </span>
                <button
                  onClick={() => setFactOpen(!factOpen)}
                  className="text-xs text-muted/80 hover:text-text cursor-pointer uppercase tracking-widest font-bold"
                >
                  {factOpen ? 'Hide' : 'Show'}
                </button>
              </div>

              {factOpen && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-text/80 text-sm leading-relaxed relative z-10 font-medium"
                >
                  {dailyFact.fact}
                </motion.p>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>

      <MilestoneModal
        isOpen={milestoneOpen}
        onClose={() => setMilestoneOpen(false)}
        milestoneTitle={`Bond Level: ${stats ? stats.bondLevelName : 'New Friend'}`}
        milestoneDescription={`Congratulations! You have initialized a trust bond score of ${stats ? stats.trustScore : 10}% with your companion. Keep talking to unlock higher levels!`}
        milestoneIcon="🤝"
      />
    </div>
  );
}
