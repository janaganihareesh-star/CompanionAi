import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, Trash2, Check, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['health', 'learning', 'career', 'mental', 'social', 'other'];
const CAT_COLORS = { health: '#22c55e', learning: '#6366f1', career: '#f59e0b', mental: '#ec4899', social: '#0ea5e9', other: '#94a3b8' };

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', type: 'build', frequency: 'daily', targetDays: 66, category: 'learning', color: '#6366f1', reminderTime: '' });

  const token = localStorage.getItem('closer-token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/productivity/habits', { headers });
      setHabits(data.habits || []);
    } catch { console.error('Load habits failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addHabit = async () => {
    try {
      await axios.post('/api/productivity/habits', form, { headers });
      setShowAdd(false);
      setForm({ name: '', description: '', type: 'build', frequency: 'daily', targetDays: 66, category: 'learning', color: '#6366f1', reminderTime: '' });
      load();
    } catch { alert('Failed to create habit.'); }
  };

  const complete = async (id) => {
    setCompleting(id);
    try {
      await axios.put(`/api/productivity/habits/${id}/complete`, {}, { headers });
      load();
    } finally { setCompleting(null); }
  };

  const deleteHabit = async (id) => {
    if (!window.confirm('Remove this habit?')) return;
    await axios.delete(`/api/productivity/habits/${id}`, { headers });
    load();
  };

  // Build last 30 days calendar dots
  const buildDots = (habit) => {
    const dots = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(); day.setDate(day.getDate() - i);
      const dayStr = day.toDateString();
      const done = (habit.completedDates || []).some(d => new Date(d).toDateString() === dayStr);
      const missed = (habit.missedDates || []).some(d => new Date(d).toDateString() === dayStr);
      dots.push({ day, done, missed });
    }
    return dots;
  };

  return (
    <div className="ht-page">
      <div className="ht-header">
        <div>
          <div className="ht-badge">🔥 Habit Tracker</div>
          <h1 className="ht-title">Build Habits That Stick</h1>
          <p className="ht-sub">66 days to make it automatic. Start today.</p>
        </div>
        <button className="ht-add-btn" onClick={() => setShowAdd(true)}><Plus size={18} /> New Habit</button>
      </div>

      {loading ? (
        <div className="ht-loading"><Loader2 size={24} className="spin" /></div>
      ) : habits.length === 0 ? (
        <div className="ht-empty">
          <div className="ht-empty-icon">🌱</div>
          <h3>No habits yet</h3>
          <p>Start your first habit today — consistency compounds!</p>
          <button className="ht-add-btn" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Your First Habit</button>
        </div>
      ) : (
        <div className="ht-grid">
          {habits.map(habit => {
            const dots = buildDots(habit);
            const color = CAT_COLORS[habit.category] || '#6366f1';
            const progress = Math.min(100, Math.round((habit.streak / (habit.targetDays || 66)) * 100));

            return (
              <motion.div key={habit._id} className="ht-card" layout>
                <div className="ht-card-top">
                  <div className="ht-card-left">
                    <div className="ht-habit-dot" style={{ background: color }} />
                    <div>
                      <h3 className="ht-habit-name">{habit.name}</h3>
                      <div className="ht-habit-meta">
                        <span className="ht-cat-badge" style={{ color, background: `${color}20` }}>{habit.category}</span>
                        <span className="ht-freq">{habit.frequency}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ht-card-actions">
                    {habit.streak >= 3 && (
                      <div className="ht-streak">
                        <Flame size={16} className="ht-flame" /> {habit.streak}
                      </div>
                    )}
                    <button className={`ht-check-btn ${habit.completedToday ? 'done' : ''}`}
                      onClick={() => !habit.completedToday && complete(habit._id)}
                      disabled={completing === habit._id || habit.completedToday}
                    >
                      {completing === habit._id ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                    </button>
                    <button className="ht-delete-btn" onClick={() => deleteHabit(habit._id)}><Trash2 size={13} /></button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="ht-progress-wrap">
                  <div className="ht-progress-bar" style={{ width: `${progress}%`, background: color }} />
                </div>
                <div className="ht-progress-label">{habit.streak} / {habit.targetDays || 66} days ({progress}%)</div>

                {/* 30-day dots */}
                <div className="ht-dots">
                  {dots.map((d, i) => (
                    <div key={i} className="ht-dot"
                      style={{ background: d.done ? color : d.missed ? '#ef4444' : 'rgba(255,255,255,0.07)' }}
                      title={d.day.toLocaleDateString()}
                    />
                  ))}
                </div>

                {habit.completedToday && (
                  <div className="ht-today-done">✅ Done today! Streak: {habit.streak} days</div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="ht-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)}>
            <motion.div className="ht-modal" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <h3>New Habit</h3>
              <input className="ht-input" placeholder="Habit name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className="ht-input" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div className="ht-modal-row">
                <select className="ht-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="build">Build Habit</option>
                  <option value="break">Break Habit</option>
                </select>
                <select className="ht-select" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="ht-modal-row">
                <select className="ht-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <input className="ht-input" type="number" placeholder="Target days (66 recommended)" value={form.targetDays} onChange={e => setForm(f => ({ ...f, targetDays: Number(e.target.value) }))} />
              </div>
              <div className="ht-modal-row">
                <div className="ht-color-row">
                  <label className="ht-label-sm">Color</label>
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="ht-color-pick" />
                </div>
                <div>
                  <label className="ht-label-sm">Reminder time</label>
                  <input type="time" className="ht-input" value={form.reminderTime} onChange={e => setForm(f => ({ ...f, reminderTime: e.target.value }))} />
                </div>
              </div>
              <div className="ht-modal-actions">
                <button className="ht-cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="ht-save-btn" onClick={addHabit} disabled={!form.name}>Start Habit 🔥</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .ht-page { padding:32px 24px; max-width:1000px; margin:0 auto; }
        .ht-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:32px; flex-wrap:wrap; gap:16px; }
        .ht-badge { display:inline-block; background:rgba(239,68,68,.15); color:#f87171; border:1px solid rgba(239,68,68,.3); border-radius:20px; padding:6px 16px; font-size:13px; font-weight:600; margin-bottom:10px; }
        .ht-title { font-size:28px; font-weight:800; background:linear-gradient(135deg,#fca5a5,#f87171); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 6px; }
        .ht-sub { color:var(--text-secondary,#94a3b8); font-size:14px; margin:0; }
        .ht-add-btn { background:linear-gradient(135deg,#dc2626,#b91c1c); border:none; border-radius:12px; padding:12px 20px; color:white; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .ht-loading { display:flex; justify-content:center; padding:80px; }
        .ht-empty { text-align:center; padding:80px 20px; }
        .ht-empty-icon { font-size:48px; margin-bottom:16px; }
        .ht-empty h3 { font-size:20px; font-weight:700; margin:0 0 8px; }
        .ht-empty p { color:var(--text-secondary,#94a3b8); font-size:14px; margin:0 0 20px; }
        .ht-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:18px; }
        .ht-card { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:16px; padding:20px; }
        .ht-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
        .ht-card-left { display:flex; gap:12px; align-items:flex-start; }
        .ht-habit-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; margin-top:4px; }
        .ht-habit-name { font-size:16px; font-weight:700; margin:0 0 6px; }
        .ht-habit-meta { display:flex; gap:8px; align-items:center; }
        .ht-cat-badge { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
        .ht-freq { font-size:11px; color:var(--text-secondary,#64748b); }
        .ht-card-actions { display:flex; align-items:center; gap:8px; }
        .ht-streak { display:flex; align-items:center; gap:3px; font-size:14px; font-weight:700; color:#f97316; }
        .ht-flame { animation:flicker 1.5s infinite alternate; }
        @keyframes flicker { 0%{filter:brightness(1)} 100%{filter:brightness(1.4)} }
        .ht-check-btn { width:34px; height:34px; border-radius:50%; border:2px solid var(--border,rgba(255,255,255,.15)); background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-secondary,#64748b); transition:all .2s; }
        .ht-check-btn.done { background:#22c55e; border-color:#22c55e; color:white; }
        .ht-delete-btn { background:none; border:none; color:var(--text-secondary,#64748b); cursor:pointer; padding:4px; border-radius:6px; display:flex; }
        .ht-progress-wrap { height:5px; background:rgba(255,255,255,.07); border-radius:3px; margin-bottom:5px; overflow:hidden; }
        .ht-progress-bar { height:100%; border-radius:3px; transition:width .5s ease; }
        .ht-progress-label { font-size:11px; color:var(--text-secondary,#64748b); margin-bottom:12px; }
        .ht-dots { display:flex; flex-wrap:wrap; gap:3px; }
        .ht-dot { width:8px; height:8px; border-radius:2px; flex-shrink:0; }
        .ht-today-done { margin-top:10px; font-size:12px; color:#22c55e; font-weight:600; }
        .ht-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
        .ht-modal { background:var(--page-bg,#0f0f1a); border:1px solid var(--border,rgba(255,255,255,.12)); border-radius:20px; padding:28px; width:100%; max-width:480px; display:flex; flex-direction:column; gap:12px; }
        .ht-modal h3 { margin:0 0 8px; font-size:18px; font-weight:700; }
        .ht-input { background:var(--input-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:11px 14px; color:var(--text,#f1f5f9); font-size:14px; outline:none; width:100%; box-sizing:border-box; }
        .ht-select { background:var(--input-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:11px 14px; color:var(--text,#f1f5f9); font-size:14px; outline:none; flex:1; }
        .ht-modal-row { display:flex; gap:10px; }
        .ht-label-sm { font-size:12px; color:var(--text-secondary,#64748b); margin-bottom:5px; display:block; }
        .ht-color-row { display:flex; flex-direction:column; flex:0 0 80px; }
        .ht-color-pick { height:42px; border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:8px; cursor:pointer; background:none; width:60px; padding:2px; }
        .ht-modal-actions { display:flex; gap:10px; margin-top:8px; }
        .ht-cancel-btn { flex:1; background:var(--card-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:12px; font-size:14px; cursor:pointer; color:var(--text-secondary,#94a3b8); }
        .ht-save-btn { flex:2; background:linear-gradient(135deg,#dc2626,#b91c1c); border:none; border-radius:10px; padding:12px; color:white; font-size:14px; font-weight:600; cursor:pointer; }
        .ht-save-btn:disabled { opacity:.5; }
        .spin { animation:spin 1s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
