import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import ProfileCard from '../components/ProfileCard';
import { fetchPreferences, fetchRelationshipStats } from '../store/settingsSlice';
import axios from 'axios';
import {
  User,
  Heart,
  Smile,
  Calendar,
  MessageSquare,
  Award,
  Clock,
  Sparkles,
  Camera,
  Loader2,
  CalendarDays
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);
  const userName = user ? user.fullName.split(' ')[0] : 'Friend';
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  
  const { preferences, stats } = useSelector((state) => state.settings);

  // Local state
  const [journeyData, setJourneyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [fullName, setFullName] = useState(user ? user.fullName : '');

  // Profile icon/avatar selections
  const [profileEmoji, setProfileEmoji] = useState('🧑‍💻');
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);

  const emojis = ['🧑‍💻', '🧙‍♂️', '🦁', '🌟', '🎸', '🌌', '🦊', '🎨', '🚀', '☕', '🐱', '🕶️'];

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      // Fetch Preferences, Stats
      dispatch(fetchPreferences());
      dispatch(fetchRelationshipStats());

      // Fetch journey timeline
      const journeyRes = await axios.get('/api/relationship/journey', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJourneyData(journeyRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfileData();
    }
  }, [token, dispatch]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      // Simple update via standard preferences upsert or profile endpoint
      await axios.put('/api/profile/preferences', { userNickname: fullName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Nickname updated in your companion brain!');
      setShowEditName(false);
      dispatch(fetchPreferences());
    } catch (err) {
      toast.error('Failed to update name.');
    }
  };

  const generateGraph = () => {
    const weeks = [];
    let currentWeek = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 365);
    
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);
    
    const totalDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const months = [];
    let lastMonth = -1;
    
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      if (d <= today) {
        currentWeek.push(d);
        if (d.getDate() === 1 || i === 0) {
           if (d.getMonth() !== lastMonth) {
             months.push({ label: d.toLocaleString('default', { month: 'short' }), colIndex: weeks.length });
             lastMonth = d.getMonth();
           }
        }
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    return { weeks, months };
  };

  const { weeks, months } = React.useMemo(() => generateGraph(), [stats, journeyData]);

  const getDayColor = (date) => {
    if (!date) return { color: 'transparent', title: '' };
    
    const today = new Date();
    const joinDateStr = journeyData?.firstMessageDate || journeyData?.stats?.friendshipStartDate || stats?.friendshipStartDate;
    if (!joinDateStr) return { color: 'var(--bg-secondary)', title: `${date.toDateString()}: No Data` };
    
    const joinDate = new Date(joinDateStr);
    const normalizedJoinDate = new Date(joinDate.getFullYear(), joinDate.getMonth(), joinDate.getDate());
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (normalizedDate < normalizedJoinDate) {
      return { color: 'var(--bg-secondary)', title: `${date.toDateString()}: Before Joining` };
    }
    if (normalizedDate > normalizedToday) {
      return { color: 'var(--bg-secondary)', title: `${date.toDateString()}: Future` };
    }
    
    // Fetch genuine message count for this date from the backend
    const y = normalizedDate.getFullYear();
    const m = String(normalizedDate.getMonth() + 1).padStart(2, '0');
    const d = String(normalizedDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    const count = journeyData?.dailyActivity?.[dateStr] || 0;

    if (count === 0) return { color: 'var(--bg-secondary)', title: `${date.toDateString()}: 0 Messages` };
    if (count < 5) return { color: '#EF4444', title: `${date.toDateString()}: ${count} Messages (Light)` }; 
    if (count < 15) return { color: '#ea580c', title: `${date.toDateString()}: ${count} Messages (Medium)` }; 
    return { color: '#16a34a', title: `${date.toDateString()}: ${count} Messages (Heavy)` }; 
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Header */}
        <div>
          <h2 className="text-3xl font-extrabold font-outfit text-text flex items-center gap-2">
            <User className="w-8 h-8 text-accent animate-pulse" /> My Companion Profile
          </h2>
          <p className="text-muted text-sm mt-0.5">Understand your emotional trends and view companion journey milestones, {userName}.</p>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="text-muted text-sm">Compiling profile insights...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* COLUMN 1: USER SUMMARY */}
            <div className="lg:col-span-1 space-y-6">
              
              <ProfileCard
                profileEmoji={profileEmoji}
                setProfileEmoji={setProfileEmoji}
                showEmojiSelector={showEmojiSelector}
                setShowEmojiSelector={setShowEmojiSelector}
                emojis={emojis}
                showEditName={showEditName}
                setShowEditName={setShowEditName}
                fullName={fullName}
                setFullName={setFullName}
                handleUpdateName={handleUpdateName}
                preferences={preferences}
                user={user}
                stats={stats}
              />
              
              {/* EMOTION HEATMAP */}
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-5">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <h3 className="font-bold font-outfit text-xl flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-accent" /> Emotional Heatmap
                  </h3>
                </div>
                
                <div className="pt-2 pb-2 w-full flex justify-center">
                  {(() => {
                    const year = new Date().getFullYear();
                    const monthIndex = new Date().getMonth();
                    const date = new Date(year, monthIndex, 1);
                    const startDay = date.getDay(); 
                    const startCol = startDay === 0 ? 6 : startDay - 1; // Mon=0, Sun=6
                    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                    const monthName = date.toLocaleString('default', { month: 'long' });
                    
                    return (
                      <div className="bg-panel/20 border border-border/50 rounded-xl p-3 shadow-sm w-full max-w-[260px] mx-auto">
                        <h4 className="font-bold text-text mb-3 text-center tracking-wider text-xs uppercase flex items-center justify-center gap-2">
                          {monthName} <span className="text-accent">{year}</span>
                        </h4>
                        <div className="grid grid-cols-7 gap-1">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-[9px] font-extrabold text-muted uppercase tracking-wider mb-1">{d}</div>
                          ))}
                          
                          {/* Empty offset cells */}
                          {Array.from({ length: startCol }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                          ))}
                          
                          {/* Days of the month */}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const dateObj = new Date(year, monthIndex, dayNum);
                            const heatInfo = getDayColor(dateObj);
                            
                            return (
                              <div 
                                key={dayNum}
                                title={heatInfo.title}
                                className="aspect-square rounded-md cursor-pointer transition-all hover:scale-110 flex items-center justify-center border border-white/5 shadow-sm hover:z-10"
                                style={{ backgroundColor: heatInfo.color }}
                              >
                                <span className={`text-[10px] font-bold ${heatInfo.color === 'var(--bg-secondary)' ? 'text-muted/40' : 'text-white drop-shadow-md'}`}>
                                  {dayNum}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted justify-end pt-2">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--bg-secondary)' }} title="0 Messages"></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#EF4444' }} title="Less"></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ea580c' }} title="Medium"></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a' }} title="More"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: RELATIONSHIP MILESTONES TIMELINE */}
            <div className="lg:col-span-2 h-full">
              
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-5 h-full">
                <div className="flex justify-between items-center border-b border-border/40 pb-4">
                  <h3 className="font-bold font-outfit text-xl flex items-center gap-2">
                    <Award className="w-6 h-6 text-accent" /> Journey Milestones
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted font-bold">
                    <CalendarDays className="w-4 h-4" />
                    Joined: {journeyData ? new Date(journeyData.firstMessageDate || journeyData.stats?.friendshipStartDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                {/* Vertical Timeline */}
                <div className="relative pl-8 space-y-8 border-l-2 border-border">
                  
                  {(() => {
                    // Calculate genuine stats based on actual activity heatmap
                    const dailyMap = journeyData?.dailyActivity || {};
                    const genuineActiveDays = Object.keys(dailyMap).length || 0;
                    const genuineTotalMessages = Object.values(dailyMap).reduce((a, b) => a + b, 0) || 0;

                    const days = genuineActiveDays;
                    const msgs = genuineTotalMessages || stats?.totalMessages || 0;
                    const trust = stats?.trustScore || 0;
                    
                    const milestones = [];

                    // 1. Beginning
                    milestones.push({
                      id: 'first',
                      icon: '🌱',
                      borderColor: 'border-accent',
                      bgColor: 'bg-accent/10',
                      textColor: 'text-accent',
                      title: 'First Encounter',
                      status: 'Completed',
                      statusStyle: 'bg-panel border border-border text-muted',
                      desc: 'CloserAI Companion initialized. A new journey begins.'
                    });

                    // 2. Chat volume
                    if (msgs >= 50) {
                      milestones.push({
                        id: 'chat_expert',
                        icon: '💬',
                        borderColor: 'border-cyan',
                        bgColor: 'bg-cyan/10',
                        textColor: 'text-cyan',
                        title: 'Deep Conversationalist',
                        status: 'Unlocked',
                        statusStyle: 'bg-emerald/10 border border-emerald/20 text-emerald',
                        desc: `Exchanged deep thoughts and queries. You have sent over ${msgs} messages!`
                      });
                    } else if (msgs >= 10) {
                      milestones.push({
                        id: 'chat_active',
                        icon: '💭',
                        borderColor: 'border-cyan',
                        bgColor: 'bg-cyan/10',
                        textColor: 'text-cyan',
                        title: 'Active Chatter',
                        status: 'Unlocked',
                        statusStyle: 'bg-emerald/10 border border-emerald/20 text-emerald',
                        desc: `Exchanged thoughts and practice queries. Reached ${msgs} messages total.`
                      });
                    } else {
                      milestones.push({
                        id: 'chat_locked',
                        icon: '🔒',
                        borderColor: 'border-border',
                        bgColor: 'bg-panel',
                        textColor: 'text-muted',
                        title: 'Active Chatter',
                        status: 'Locked',
                        statusStyle: 'bg-panel border border-border text-muted',
                        desc: `Send at least 10 messages to unlock. Currently at ${msgs}.`
                      });
                    }

                    // 3. Daily streaks
                    if (days >= 30) {
                      milestones.push({
                        id: 'streak_30',
                        icon: '💎',
                        borderColor: 'border-indigo-400',
                        bgColor: 'bg-indigo-400/10',
                        textColor: 'text-indigo-400',
                        title: 'One Month Bond',
                        status: 'Unlocked',
                        statusStyle: 'bg-emerald/10 border border-emerald/20 text-emerald',
                        desc: `Incredible! Maintained a solid 30-day connection. Growing stronger!`
                      });
                    } else if (days >= 7) {
                      milestones.push({
                        id: 'streak_7',
                        icon: '🔥',
                        borderColor: 'border-indigo-400',
                        bgColor: 'bg-indigo-400/10',
                        textColor: 'text-indigo-400',
                        title: 'One Week Streak',
                        status: 'Unlocked',
                        statusStyle: 'bg-emerald/10 border border-emerald/20 text-emerald',
                        desc: `Built a reliable daily bond for 7 days. Keep it up!`
                      });
                    } else if (days >= 3) {
                      milestones.push({
                        id: 'streak_3',
                        icon: '🔥',
                        borderColor: 'border-indigo-400',
                        bgColor: 'bg-indigo-400/10',
                        textColor: 'text-indigo-400',
                        title: 'Consistent Connection',
                        status: 'Unlocked',
                        statusStyle: 'bg-emerald/10 border border-emerald/20 text-emerald',
                        desc: `Built a reliable daily bond for ${days} days.`
                      });
                    } else {
                      milestones.push({
                        id: 'streak_locked',
                        icon: '⏳',
                        borderColor: 'border-border',
                        bgColor: 'bg-panel',
                        textColor: 'text-muted',
                        title: 'Consistent Connection',
                        status: 'In Progress',
                        statusStyle: 'bg-amber/15 border border-amber/30 text-amber',
                        desc: `Chat for 3 days to unlock. Current: ${days} day(s).`
                      });
                    }

                    // 4. Trust/Bond Level
                    if (trust >= 80) {
                      milestones.push({
                        id: 'trust_80',
                        icon: '💖',
                        borderColor: 'border-rose-500',
                        bgColor: 'bg-rose-500/10',
                        textColor: 'text-rose-500',
                        title: trust >= 80 && stats?.bondLevel < 3 ? 'Soulmate Bond' : `Soulmate Bond: ${stats?.bondLevelName || 'Soulmate'}`,
                        status: 'Active Level',
                        statusStyle: 'bg-rose-500/15 border border-rose-500/30 text-rose-500',
                        desc: `Deepest level of trust and companionship. Trust level reached ${trust}%.`
                      });
                    } else {
                      milestones.push({
                        id: 'trust_current',
                        icon: '✨',
                        borderColor: 'border-amber',
                        bgColor: 'bg-amber/10',
                        textColor: 'text-amber',
                        title: `Bond Milestone: ${stats?.bondLevelName || 'New Friend'}`,
                        status: 'Active Level',
                        statusStyle: 'bg-amber/15 border border-amber/30 text-amber',
                        desc: `Building trust and companionship. Bond percentage level reached ${trust}%.`
                      });
                    }

                    return milestones.map((m) => (
                      <div key={m.id} className="relative">
                        <div className={`absolute -left-[41px] top-1.5 w-6 h-6 bg-panel border-2 ${m.borderColor} rounded-full flex items-center justify-center text-[10px]`}>
                          {m.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-text">{m.title}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${m.statusStyle}`}>
                              {m.status}
                            </span>
                          </div>
                          <p className="text-muted text-xs leading-relaxed">
                            {m.desc}
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
            


          </div>
        )}
      </main>
    </div>
  );
}
