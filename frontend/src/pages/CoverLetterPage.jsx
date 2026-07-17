import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2, Copy, Download, Check } from 'lucide-react';
import axios from 'axios';

const TONES = [
  { key: 'professional', label: 'Professional', emoji: '🎯', desc: 'Formal, achievement-focused, clean language' },
  { key: 'friendly',     label: 'Friendly',     emoji: '😊', desc: 'Conversational, personality-forward, warm' },
  { key: 'bold',         label: 'Bold',          emoji: '⚡', desc: 'Confident opener, strong claims, high energy' }
];

export default function CoverLetterPage() {
  const [form, setForm] = useState({ resumeText: '', targetRole: '', companyName: '', jobDescription: '' });
  const [loading, setLoading] = useState(false);
  const [letters, setLetters] = useState(null);
  const [activeTab, setActiveTab] = useState('professional');
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem('closer-token');

  const generate = async () => {
    if (!form.resumeText || !form.targetRole || !form.companyName) {
      alert('Resume text, target role, and company name are required.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/career/cover-letter/generate', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLetters(data.coverLetters);
    } catch { alert('Generation failed. Check API key.'); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    if (!letters?.[activeTab]) return;
    navigator.clipboard.writeText(letters[activeTab].body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cl-page">
      <div className="cl-header">
        <div className="cl-badge">✉️ Cover Letter</div>
        <h1 className="cl-title">Cover Letters That Get Noticed</h1>
        <p className="cl-sub">Never start with "I am writing to apply." AI writes 3 tone variants — choose yours.</p>
      </div>

      {!letters ? (
        <div className="cl-form">
          <div className="cl-grid-2">
            <div>
              <label className="cl-label">Target Role *</label>
              <input className="cl-input" placeholder="Full Stack Developer" value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))} />
            </div>
            <div>
              <label className="cl-label">Company Name *</label>
              <input className="cl-input" placeholder="Google, Infosys, Startup Name..." value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
            </div>
          </div>

          <label className="cl-label">Your Resume Text *</label>
          <textarea className="cl-textarea" rows={8} placeholder="Paste your resume here (plain text)..." value={form.resumeText} onChange={e => setForm(f => ({ ...f, resumeText: e.target.value }))} />

          <label className="cl-label">Job Description (optional)</label>
          <textarea className="cl-textarea" rows={4} placeholder="Paste job description for better matching..." value={form.jobDescription} onChange={e => setForm(f => ({ ...f, jobDescription: e.target.value }))} />

          <button className="cl-btn" onClick={generate} disabled={loading}>
            {loading ? <><Loader2 size={16} className="spin" /> Writing 3 variants...</> : '✨ Generate 3 Cover Letters'}
          </button>
        </div>
      ) : (
        <div className="cl-result">
          {/* Tone selector */}
          <div className="cl-tone-tabs">
            {TONES.map(t => (
              <button key={t.key} className={`cl-tone-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                <span>{t.emoji}</span>
                <div>
                  <div className="cl-tone-name">{t.label}</div>
                  <div className="cl-tone-desc">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="cl-letter-card">
              {letters[activeTab] && (
                <>
                  <div className="cl-letter-subject">
                    <strong>Subject:</strong> {letters[activeTab].subject}
                    <span className="cl-word-count">{letters[activeTab].wordCount} words</span>
                  </div>
                  <div className="cl-letter-body">{letters[activeTab].body}</div>
                  <div className="cl-letter-actions">
                    <button className="cl-copy-btn" onClick={handleCopy}>
                      {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                    </button>
                    <button className="cl-download-btn" onClick={() => {
                      const blob = new Blob([`Subject: ${letters[activeTab].subject}\n\n${letters[activeTab].body}`], { type: 'text/plain' });
                      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                      a.download = `Cover_Letter_${activeTab}.txt`; a.click();
                    }}>
                      <Download size={14} /> Download
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <button className="cl-regenerate" onClick={() => setLetters(null)}>← Try Different Info</button>
        </div>
      )}

      <style>{`
        .cl-page { padding:32px 24px; max-width:800px; margin:0 auto; }
        .cl-header { text-align:center; margin-bottom:32px; }
        .cl-badge { display:inline-block; background:rgba(14,165,233,.15); color:#38bdf8; border:1px solid rgba(14,165,233,.3); border-radius:20px; padding:6px 16px; font-size:13px; font-weight:600; margin-bottom:12px; }
        .cl-title { font-size:30px; font-weight:800; background:linear-gradient(135deg,#bae6fd,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 8px; }
        .cl-sub { color:var(--text-secondary,#94a3b8); font-size:14px; }
        .cl-form, .cl-result { display:flex; flex-direction:column; gap:16px; }
        .cl-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .cl-label { font-size:13px; font-weight:600; color:var(--text-secondary,#94a3b8); margin-bottom:6px; display:block; }
        .cl-input { background:var(--input-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:12px 14px; color:var(--text,#f1f5f9); font-size:14px; outline:none; width:100%; box-sizing:border-box; }
        .cl-textarea { background:var(--input-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:12px 14px; color:var(--text,#f1f5f9); font-size:14px; outline:none; width:100%; box-sizing:border-box; resize:vertical; }
        .cl-btn { background:linear-gradient(135deg,#0ea5e9,#6366f1); border:none; border-radius:12px; padding:14px 28px; color:white; font-size:15px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; justify-content:center; }
        .cl-tone-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .cl-tone-tab { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:14px; padding:14px; cursor:pointer; display:flex; gap:10px; align-items:flex-start; text-align:left; transition:all .2s; }
        .cl-tone-tab.active { background:rgba(99,102,241,.15); border-color:rgba(99,102,241,.5); }
        .cl-tone-name { font-size:14px; font-weight:700; margin-bottom:2px; }
        .cl-tone-desc { font-size:11px; color:var(--text-secondary,#64748b); }
        .cl-letter-card { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:16px; padding:24px; }
        .cl-letter-subject { display:flex; align-items:center; justify-content:space-between; font-size:14px; background:rgba(0,0,0,.15); border-radius:8px; padding:10px 14px; margin-bottom:16px; }
        .cl-word-count { font-size:12px; color:var(--text-secondary,#64748b); }
        .cl-letter-body { font-size:14px; line-height:1.8; color:var(--text,#f1f5f9); white-space:pre-line; }
        .cl-letter-actions { display:flex; gap:10px; margin-top:16px; }
        .cl-copy-btn { background:rgba(99,102,241,.15); border:1px solid rgba(99,102,241,.3); border-radius:8px; padding:8px 16px; color:#818cf8; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .cl-download-btn { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.3); border-radius:8px; padding:8px 16px; color:#22c55e; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .cl-regenerate { background:none; border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:10px 18px; color:var(--text-secondary,#94a3b8); font-size:13px; cursor:pointer; }
        .spin { animation:spin 1s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
