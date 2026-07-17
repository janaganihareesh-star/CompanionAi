import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Loader2, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const SCRIPT_TABS = [
  { key: 'email', label: '📧 Email Counter', desc: 'Formal written counter-offer' },
  { key: 'call',  label: '📞 Phone Script',  desc: 'Talking points for the call' },
  { key: 'counter', label: '🔄 Counter-Counter', desc: 'When they say no...' }
];

export default function SalaryEnginePage() {
  const [tab, setTab] = useState('research');
  const [loading, setLoading] = useState(false);
  const [researchForm, setResearchForm] = useState({ role: '', location: '', experience: '', skills: '' });
  const [scriptForm, setScriptForm] = useState({ offeredSalary: '', targetSalary: '', role: '', company: '' });
  const [salaryData, setSalaryData] = useState(null);
  const [scripts, setScripts] = useState(null);
  const [activeScript, setActiveScript] = useState('email');
  const [expandedFactor, setExpandedFactor] = useState(null);

  const token = localStorage.getItem('closer-token');

  const doResearch = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/career/salary/research', {
        ...researchForm,
        skills: researchForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSalaryData(data.salary);
    } catch { alert('Research failed.'); }
    finally { setLoading(false); }
  };

  const doScript = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/career/salary/script', scriptForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScripts(data.negotiation);
    } catch { alert('Script generation failed.'); }
    finally { setLoading(false); }
  };

  const formatINR = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

  const rangePercent = (val, min, max) => Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));

  return (
    <div className="se-page">
      <div className="se-header">
        <div className="se-badge">💰 Salary Engine</div>
        <h1 className="se-title">Know Your Worth. Negotiate Confidently.</h1>
        <p className="se-sub">Market research + 3 negotiation scripts — email, phone, and counter-counter</p>
      </div>

      {/* Tabs */}
      <div className="se-tabs">
        <button className={`se-tab ${tab === 'research' ? 'active' : ''}`} onClick={() => setTab('research')}>📊 Market Research</button>
        <button className={`se-tab ${tab === 'script' ? 'active' : ''}`} onClick={() => setTab('script')}>📝 Negotiation Scripts</button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

          {/* RESEARCH TAB */}
          {tab === 'research' && (
            <div className="se-body">
              {!salaryData ? (
                <div className="se-form">
                  <div className="se-grid-2">
                    <div>
                      <label className="se-label">Role *</label>
                      <input className="se-input" placeholder="Full Stack Developer" value={researchForm.role} onChange={e => setResearchForm(f => ({ ...f, role: e.target.value }))} />
                    </div>
                    <div>
                      <label className="se-label">Location</label>
                      <input className="se-input" placeholder="Bangalore / Hyderabad / Remote India" value={researchForm.location} onChange={e => setResearchForm(f => ({ ...f, location: e.target.value }))} />
                    </div>
                  </div>
                  <div className="se-grid-2">
                    <div>
                      <label className="se-label">Years of Experience</label>
                      <input className="se-input" type="number" placeholder="3" value={researchForm.experience} onChange={e => setResearchForm(f => ({ ...f, experience: e.target.value }))} />
                    </div>
                    <div>
                      <label className="se-label">Key Skills (comma separated)</label>
                      <input className="se-input" placeholder="React, Node, AWS" value={researchForm.skills} onChange={e => setResearchForm(f => ({ ...f, skills: e.target.value }))} />
                    </div>
                  </div>
                  <button className="se-btn" onClick={doResearch} disabled={loading || !researchForm.role}>
                    {loading ? <><Loader2 size={16} className="spin" /> Researching...</> : '🔍 Research Market Salary'}
                  </button>
                </div>
              ) : (
                <div className="se-result">
                  {/* Range Bar */}
                  <div className="se-range-card">
                    <h3>Market Range for {researchForm.role}</h3>
                    <div className="se-range-bar-wrap">
                      <div className="se-range-bar">
                        <div className="se-range-fill" />
                        {/* Markers */}
                        <div className="se-marker" style={{ left: '0%' }}>
                          <div className="se-marker-dot min" />
                          <span>Min<br />{formatINR(salaryData.marketRange?.min)}</span>
                        </div>
                        <div className="se-marker" style={{ left: `${rangePercent(salaryData.marketRange?.median, salaryData.marketRange?.min, salaryData.marketRange?.max)}%` }}>
                          <div className="se-marker-dot median" />
                          <span>Median<br />{formatINR(salaryData.marketRange?.median)}</span>
                        </div>
                        <div className="se-marker" style={{ left: '100%' }}>
                          <div className="se-marker-dot max" />
                          <span>Max<br />{formatINR(salaryData.marketRange?.max)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="se-targets">
                      <div className="se-target-item green">
                        <span>🎯 Target Ask</span>
                        <strong>{formatINR(salaryData.negotiationTarget)}</strong>
                      </div>
                      <div className="se-target-item rose">
                        <span>⛔ Walk Away</span>
                        <strong>{formatINR(salaryData.walkAwayPoint)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Premium Skills Bonus */}
                  {salaryData.premiumSkillsBonus && Object.keys(salaryData.premiumSkillsBonus).length > 0 && (
                    <div className="se-card">
                      <h4>💎 Premium Skills Bonus</h4>
                      <div className="se-chips">
                        {Object.entries(salaryData.premiumSkillsBonus).map(([skill, bonus]) => (
                          <span key={skill} className="se-chip green">{skill}: +{bonus}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Company Size */}
                  {salaryData.companySizeAdjustment && (
                    <div className="se-card">
                      <h4>🏢 By Company Size</h4>
                      <div className="se-size-grid">
                        {Object.entries(salaryData.companySizeAdjustment).map(([size, val]) => (
                          <div key={size} className="se-size-item">
                            <span className="se-size-label">{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                            <span className="se-size-val">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Factors */}
                  {salaryData.salaryFactors?.length > 0 && (
                    <div className="se-card">
                      <h4>📌 Factors That Affect Your Range</h4>
                      <ul className="se-list">
                        {salaryData.salaryFactors.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}

                  <button className="se-reset" onClick={() => setSalaryData(null)}>← New Search</button>
                </div>
              )}
            </div>
          )}

          {/* SCRIPTS TAB */}
          {tab === 'script' && (
            <div className="se-body">
              {!scripts ? (
                <div className="se-form">
                  <div className="se-grid-2">
                    <div>
                      <label className="se-label">Offered Salary *</label>
                      <input className="se-input" placeholder="₹8,00,000" value={scriptForm.offeredSalary} onChange={e => setScriptForm(f => ({ ...f, offeredSalary: e.target.value }))} />
                    </div>
                    <div>
                      <label className="se-label">Your Target Salary *</label>
                      <input className="se-input" placeholder="₹11,00,000" value={scriptForm.targetSalary} onChange={e => setScriptForm(f => ({ ...f, targetSalary: e.target.value }))} />
                    </div>
                  </div>
                  <div className="se-grid-2">
                    <div>
                      <label className="se-label">Role</label>
                      <input className="se-input" placeholder="Software Engineer" value={scriptForm.role} onChange={e => setScriptForm(f => ({ ...f, role: e.target.value }))} />
                    </div>
                    <div>
                      <label className="se-label">Company</label>
                      <input className="se-input" placeholder="Company name" value={scriptForm.company} onChange={e => setScriptForm(f => ({ ...f, company: e.target.value }))} />
                    </div>
                  </div>
                  <div className="se-tip-box">
                    💡 GOLDEN RULE: After stating your number — <strong>STOP TALKING</strong>. Let them respond first.
                  </div>
                  <button className="se-btn" onClick={doScript} disabled={loading || !scriptForm.offeredSalary || !scriptForm.targetSalary}>
                    {loading ? <><Loader2 size={16} className="spin" /> Generating scripts...</> : '✍️ Generate 3 Negotiation Scripts'}
                  </button>
                </div>
              ) : (
                <div className="se-result">
                  <div className="se-script-tabs">
                    {SCRIPT_TABS.map(t => (
                      <button key={t.key} className={`se-script-tab ${activeScript === t.key ? 'active' : ''}`} onClick={() => setActiveScript(t.key)}>
                        <span>{t.label}</span>
                        <span className="se-script-desc">{t.desc}</span>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={activeScript} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="se-script-body">
                      <div className="se-script-text">{scripts.scripts?.[activeScript] || 'Script not available.'}</div>
                      <button className="se-copy-btn" onClick={() => navigator.clipboard.writeText(scripts.scripts?.[activeScript] || '')}>
                        <Copy size={14} /> Copy Script
                      </button>
                    </motion.div>
                  </AnimatePresence>

                  {scripts.redFlags?.length > 0 && (
                    <div className="se-card" style={{ marginTop: 16 }}>
                      <h4>🚨 Red Flags to Watch in Offer Letter</h4>
                      <ul className="se-list red">
                        {scripts.redFlags.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}

                  <button className="se-reset" onClick={() => setScripts(null)}>← Try Different Offer</button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        .se-page { padding:32px 24px; max-width:860px; margin:0 auto; }
        .se-header { text-align:center; margin-bottom:32px; }
        .se-badge { display:inline-block; background:rgba(34,197,94,.15); color:#22c55e; border:1px solid rgba(34,197,94,.3); border-radius:20px; padding:6px 16px; font-size:13px; font-weight:600; margin-bottom:12px; }
        .se-title { font-size:30px; font-weight:800; background:linear-gradient(135deg,#bbf7d0,#6ee7b7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 8px; }
        .se-sub { color:var(--text-secondary,#94a3b8); font-size:14px; }
        .se-tabs { display:flex; gap:10px; margin-bottom:28px; border-bottom:1px solid var(--border,rgba(255,255,255,.08)); padding-bottom:2px; }
        .se-tab { background:none; border:none; padding:12px 20px; font-size:14px; font-weight:600; color:var(--text-secondary,#64748b); cursor:pointer; border-bottom:2px solid transparent; transition:all .2s; }
        .se-tab.active { color:#22c55e; border-bottom-color:#22c55e; }
        .se-form { display:flex; flex-direction:column; gap:14px; }
        .se-result { display:flex; flex-direction:column; gap:16px; }
        .se-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .se-label { font-size:13px; font-weight:600; color:var(--text-secondary,#94a3b8); margin-bottom:6px; display:block; }
        .se-input { background:var(--input-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:12px 14px; color:var(--text,#f1f5f9); font-size:14px; outline:none; width:100%; box-sizing:border-box; }
        .se-btn { background:linear-gradient(135deg,#059669,#047857); border:none; border-radius:12px; padding:14px 28px; color:white; font-size:15px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; justify-content:center; }
        .se-tip-box { background:rgba(245,158,11,.1); border:1px solid rgba(245,158,11,.3); border-radius:10px; padding:12px 16px; font-size:13px; color:#fbbf24; }
        .se-range-card { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:16px; padding:24px; }
        .se-range-card h3 { margin:0 0 24px; font-size:16px; font-weight:700; }
        .se-range-bar-wrap { padding:0 16px 40px; position:relative; }
        .se-range-bar { height:10px; background:linear-gradient(90deg,#ef4444,#f59e0b,#22c55e); border-radius:8px; position:relative; }
        .se-range-fill { display:none; }
        .se-marker { position:absolute; top:-2px; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; }
        .se-marker-dot { width:16px; height:16px; border-radius:50%; border:3px solid var(--card-bg,#1e1e2e); margin-bottom:8px; }
        .se-marker-dot.min { background:#ef4444; }
        .se-marker-dot.median { background:#f59e0b; }
        .se-marker-dot.max { background:#22c55e; }
        .se-marker span { font-size:11px; text-align:center; color:var(--text-secondary,#94a3b8); white-space:nowrap; position:absolute; top:28px; }
        .se-targets { display:flex; gap:12px; margin-top:16px; }
        .se-target-item { flex:1; padding:14px; border-radius:12px; display:flex; flex-direction:column; gap:4px; }
        .se-target-item.green { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.3); }
        .se-target-item.rose { background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.3); }
        .se-target-item span { font-size:12px; color:var(--text-secondary,#94a3b8); }
        .se-target-item strong { font-size:20px; font-weight:800; }
        .se-target-item.green strong { color:#22c55e; }
        .se-target-item.rose strong { color:#ef4444; }
        .se-card { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:14px; padding:18px; }
        .se-card h4 { margin:0 0 12px; font-size:14px; font-weight:700; }
        .se-chips { display:flex; flex-wrap:wrap; gap:8px; }
        .se-chip { padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600; }
        .se-chip.green { background:rgba(34,197,94,.15); color:#22c55e; }
        .se-size-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .se-size-item { background:rgba(0,0,0,.2); border-radius:10px; padding:12px; text-align:center; }
        .se-size-label { display:block; font-size:12px; color:var(--text-secondary,#64748b); margin-bottom:4px; }
        .se-size-val { font-size:14px; font-weight:700; }
        .se-list { margin:0; padding-left:20px; display:flex; flex-direction:column; gap:6px; }
        .se-list li { font-size:13px; line-height:1.5; }
        .se-list.red li { color:#fca5a5; }
        .se-script-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
        .se-script-tab { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:12px; padding:12px; cursor:pointer; display:flex; flex-direction:column; gap:3px; text-align:center; font-size:13px; font-weight:600; transition:all .2s; }
        .se-script-tab.active { background:rgba(34,197,94,.12); border-color:rgba(34,197,94,.4); color:#22c55e; }
        .se-script-desc { font-size:11px; color:var(--text-secondary,#64748b); font-weight:400; }
        .se-script-body { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:14px; padding:20px; }
        .se-script-text { font-size:14px; line-height:1.8; white-space:pre-line; color:var(--text,#f1f5f9); margin-bottom:16px; }
        .se-copy-btn { background:rgba(99,102,241,.15); border:1px solid rgba(99,102,241,.3); border-radius:8px; padding:8px 16px; color:#818cf8; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .se-reset { background:none; border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:10px 18px; color:var(--text-secondary,#94a3b8); font-size:13px; cursor:pointer; width:fit-content; }
        .se-body { min-height:400px; }
        .spin { animation:spin 1s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
