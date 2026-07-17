import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Loader2, Copy, ChevronDown } from 'lucide-react';
import axios from 'axios';

const STACKS = [
  { key: 'MERN', label: 'MERN Stack', emoji: '⚡', desc: 'MongoDB + Express + React + Node' },
  { key: 'NextJS', label: 'Next.js', emoji: '▲', desc: 'Fullstack React framework' },
  { key: 'Django+React', label: 'Django + React', emoji: '🐍', desc: 'Python backend + React frontend' },
  { key: 'FastAPI', label: 'FastAPI', emoji: '🚀', desc: 'Python async API + any frontend' },
  { key: 'MEAN', label: 'MEAN Stack', emoji: '🅰️', desc: 'MongoDB + Express + Angular + Node' },
  { key: 'Mobile(RN)', label: 'React Native', emoji: '📱', desc: 'Cross-platform mobile app' }
];
const DOMAINS = ['Any', 'E-Commerce', 'Social', 'EdTech', 'Health', 'FinTech', 'SaaS', 'Game'];
const EXPERIENCE = ['beginner', 'intermediate', 'advanced'];

const TABS = ['Ideas', 'Architecture', 'Database', 'APIs', 'Deployment'];

export default function ProjectBuilderPage() {
  const [tab, setTab] = useState(0);
  const [stack, setStack] = useState('MERN');
  const [domain, setDomain] = useState('Any');
  const [experience, setExperience] = useState('intermediate');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});

  const token = localStorage.getItem('closer-token');
  const call = async (endpoint, body, key) => {
    setLoading(l => ({ ...l, [key]: true }));
    try {
      const { data } = await axios.post(`/api/project/${endpoint}`, body, { headers: { Authorization: `Bearer ${token}` } });
      setResults(r => ({ ...r, [key]: data }));
    } catch { alert(`${key} generation failed.`); }
    finally { setLoading(l => ({ ...l, [key]: false })); }
  };

  const projectName = selectedIdea?.name || 'My Project';
  const features = selectedIdea?.mvpFeatures || [];

  const impactColor = (v) => v === 'high' ? '#22c55e' : v === 'medium' ? '#f59e0b' : '#94a3b8';
  const diffColor = (v) => v === 'easy' ? '#22c55e' : v === 'medium' ? '#f59e0b' : '#ef4444';

  return (
    <div className="pb-page">
      <div className="pb-header">
        <div className="pb-badge">🏗️ Project Builder</div>
        <h1 className="pb-title">One Input. Full Blueprint.</h1>
        <p className="pb-sub">From project idea to architecture + DB schema + APIs + deployment — complete in minutes</p>
      </div>

      {/* Tab navigator */}
      <div className="pb-tabs">
        {TABS.map((t, i) => (
          <button key={t} className={`pb-tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>
            <span className="pb-tab-num">{i + 1}</span> {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-body">

          {/* TAB 0 — Ideas */}
          {tab === 0 && (
            <div>
              <div className="pb-config">
                <div>
                  <label className="pb-label">Stack</label>
                  <div className="pb-stack-grid">
                    {STACKS.map(s => (
                      <button key={s.key} className={`pb-stack-card ${stack === s.key ? 'active' : ''}`} onClick={() => setStack(s.key)}>
                        <span className="pb-stack-emoji">{s.emoji}</span>
                        <div>
                          <div className="pb-stack-name">{s.label}</div>
                          <div className="pb-stack-desc">{s.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pb-config-row">
                  <div>
                    <label className="pb-label">Domain</label>
                    <div className="pb-pills">
                      {DOMAINS.map(d => <button key={d} className={`pb-pill ${domain === d ? 'active' : ''}`} onClick={() => setDomain(d)}>{d}</button>)}
                    </div>
                  </div>
                  <div>
                    <label className="pb-label">Experience</label>
                    <div className="pb-pills">
                      {EXPERIENCE.map(e => <button key={e} className={`pb-pill ${experience === e ? 'active' : ''}`} onClick={() => setExperience(e)}>{e.charAt(0).toUpperCase() + e.slice(1)}</button>)}
                    </div>
                  </div>
                </div>
                <button className="pb-btn" onClick={() => call('idea', { stack, domain: domain === 'Any' ? '' : domain, experience }, 'ideas')} disabled={loading.ideas}>
                  {loading.ideas ? <><Loader2 size={16} className="spin" /> Generating ideas...</> : '💡 Generate 5 Project Ideas'}
                </button>
              </div>

              {results.ideas?.ideas && (
                <motion.div className="pb-ideas-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {results.ideas.ideas.map((idea, i) => (
                    <motion.div key={i} className={`pb-idea-card ${selectedIdea?.name === idea.name ? 'selected' : ''}`}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.02 }} onClick={() => setSelectedIdea(idea)}>
                      <div className="pb-idea-top">
                        <h3 className="pb-idea-name">{idea.name}</h3>
                        <div className="pb-idea-badges">
                          <span className="pb-badge-small" style={{ color: impactColor(idea.resumeImpact) }}>
                            ⭐ {idea.resumeImpact}
                          </span>
                          <span className="pb-badge-small" style={{ color: diffColor(idea.difficulty) }}>
                            {idea.difficulty}
                          </span>
                          <span className="pb-badge-small">⏱ {idea.estimatedDays}d</span>
                        </div>
                      </div>
                      <p className="pb-idea-tagline">{idea.tagline}</p>
                      <p className="pb-idea-desc">💡 {idea.uniqueFeature}</p>
                      {selectedIdea?.name === idea.name && (
                        <div className="pb-idea-selected-badge">✓ Selected — continue to Architecture →</div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 1 — Architecture */}
          {tab === 1 && (
            <div>
              <div className="pb-panel-header">
                <span>Project: <strong>{projectName}</strong></span>
                <button className="pb-btn-sm" onClick={() => call('architecture', { projectName, stack, features }, 'arch')} disabled={loading.arch}>
                  {loading.arch ? <><Loader2 size={14} className="spin" /> Generating...</> : '⚡ Generate Architecture'}
                </button>
              </div>
              {results.arch?.architecture && (
                <div className="pb-result-block">
                  <div className="pb-code-block">
                    <div className="pb-code-header">📐 Architecture Diagram<button className="pb-copy-sm" onClick={() => navigator.clipboard.writeText(results.arch.architecture.architectureDiagram)}><Copy size={12} /></button></div>
                    <pre className="pb-code">{results.arch.architecture.architectureDiagram}</pre>
                  </div>
                  <div className="pb-code-block">
                    <div className="pb-code-header">📁 Frontend Structure<button className="pb-copy-sm" onClick={() => navigator.clipboard.writeText(results.arch.architecture.folderStructure?.frontend?.structure)}><Copy size={12} /></button></div>
                    <pre className="pb-code">{results.arch.architecture.folderStructure?.frontend?.structure}</pre>
                  </div>
                  <div className="pb-code-block">
                    <div className="pb-code-header">📁 Backend Structure<button className="pb-copy-sm" onClick={() => navigator.clipboard.writeText(results.arch.architecture.folderStructure?.backend?.structure)}><Copy size={12} /></button></div>
                    <pre className="pb-code">{results.arch.architecture.folderStructure?.backend?.structure}</pre>
                  </div>
                  {results.arch.architecture.bashCommands && (
                    <div className="pb-code-block">
                      <div className="pb-code-header">🖥️ Scaffold Commands<button className="pb-copy-sm" onClick={() => navigator.clipboard.writeText(results.arch.architecture.bashCommands)}><Copy size={12} /></button></div>
                      <pre className="pb-code">{results.arch.architecture.bashCommands}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2 — Database */}
          {tab === 2 && (
            <div>
              <div className="pb-panel-header">
                <span>Schema for: <strong>{projectName}</strong></span>
                <button className="pb-btn-sm" onClick={() => call('database', { projectName, features, dbType: 'mongodb', scale: 'medium' }, 'db')} disabled={loading.db}>
                  {loading.db ? <><Loader2 size={14} className="spin" /> Generating...</> : '🗃️ Generate Schema'}
                </button>
              </div>
              {results.db?.schema?.models?.map((model, i) => (
                <div key={i} className="pb-model-card">
                  <h4 className="pb-model-name">{model.name}</h4>
                  <div className="pb-code-block" style={{ marginTop: 12 }}>
                    <div className="pb-code-header">Schema Code<button className="pb-copy-sm" onClick={() => navigator.clipboard.writeText(model.codeSnippet)}><Copy size={12} /></button></div>
                    <pre className="pb-code">{model.codeSnippet}</pre>
                  </div>
                  {model.relationships?.length > 0 && (
                    <div className="pb-relations">
                      {model.relationships.map((r, j) => (
                        <span key={j} className="pb-relation-chip">{model.name} {r.type} {r.model}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3 — APIs */}
          {tab === 3 && (
            <div>
              <div className="pb-panel-header">
                <span>API Design for: <strong>{projectName}</strong></span>
                <button className="pb-btn-sm" onClick={() => call('apis', { projectName, features, authType: 'jwt' }, 'apis')} disabled={loading.apis}>
                  {loading.apis ? <><Loader2 size={14} className="spin" /> Generating...</> : '📡 Generate API Design'}
                </button>
              </div>
              {results.apis?.apis?.endpoints && (
                <div className="pb-api-table">
                  {results.apis.apis.endpoints.map((ep, i) => (
                    <div key={i} className="pb-api-row">
                      <span className={`pb-method pb-method-${ep.method?.toLowerCase()}`}>{ep.method}</span>
                      <span className="pb-path">{ep.path}</span>
                      <span className="pb-ep-desc">{ep.description}</span>
                      {ep.auth && <span className="pb-auth-badge">🔒</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4 — Deployment */}
          {tab === 4 && (
            <div>
              <div className="pb-panel-header">
                <span>Deployment for: <strong>{projectName}</strong></span>
                <button className="pb-btn-sm" onClick={() => call('deployment', { stack, projectType: 'startup-mvp', budget: 'free' }, 'deploy')} disabled={loading.deploy}>
                  {loading.deploy ? <><Loader2 size={14} className="spin" /> Generating...</> : '🚀 Generate Deployment Guide'}
                </button>
              </div>
              {results.deploy?.deployment?.phases?.map((phase, i) => (
                <div key={i} className="pb-phase-card">
                  <h4 className="pb-phase-name">{phase.phase}</h4>
                  <div className="pb-phase-env">
                    {Object.entries(phase.environment || {}).map(([k, v]) => (
                      <div key={k} className="pb-env-item"><span className="pb-env-key">{k}:</span> {v}</div>
                    ))}
                  </div>
                  {phase.steps?.length > 0 && (
                    <ul className="pb-steps-list">
                      {phase.steps.map((s, j) => <li key={j}>{s}</li>)}
                    </ul>
                  )}
                </div>
              ))}
              {results.deploy?.deployment?.cicdPipeline?.yamlSnippet && (
                <div className="pb-code-block" style={{ marginTop: 16 }}>
                  <div className="pb-code-header">⚙️ GitHub Actions YAML<button className="pb-copy-sm" onClick={() => navigator.clipboard.writeText(results.deploy.deployment.cicdPipeline.yamlSnippet)}><Copy size={12} /></button></div>
                  <pre className="pb-code">{results.deploy.deployment.cicdPipeline.yamlSnippet}</pre>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        .pb-page { padding:32px 24px; max-width:1000px; margin:0 auto; }
        .pb-header { text-align:center; margin-bottom:32px; }
        .pb-badge { display:inline-block; background:rgba(245,158,11,.15); color:#fbbf24; border:1px solid rgba(245,158,11,.3); border-radius:20px; padding:6px 16px; font-size:13px; font-weight:600; margin-bottom:12px; }
        .pb-title { font-size:30px; font-weight:800; background:linear-gradient(135deg,#fde68a,#fb923c); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 8px; }
        .pb-sub { color:var(--text-secondary,#94a3b8); font-size:14px; }
        .pb-tabs { display:flex; gap:6px; margin-bottom:28px; border-bottom:1px solid var(--border,rgba(255,255,255,.08)); padding-bottom:2px; overflow-x:auto; }
        .pb-tab { background:none; border:none; padding:10px 16px; font-size:13px; font-weight:600; color:var(--text-secondary,#64748b); cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; display:flex; align-items:center; gap:6px; }
        .pb-tab.active { color:#f59e0b; border-bottom-color:#f59e0b; }
        .pb-tab-num { background:rgba(245,158,11,.2); color:#f59e0b; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:11px; }
        .pb-body { min-height:400px; }
        .pb-config { display:flex; flex-direction:column; gap:20px; margin-bottom:28px; }
        .pb-label { font-size:13px; font-weight:600; color:var(--text-secondary,#94a3b8); margin-bottom:10px; display:block; }
        .pb-stack-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:10px; }
        .pb-stack-card { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:12px; padding:12px; cursor:pointer; display:flex; gap:10px; align-items:center; transition:all .2s; text-align:left; }
        .pb-stack-card.active { background:rgba(245,158,11,.1); border-color:rgba(245,158,11,.5); }
        .pb-stack-emoji { font-size:20px; }
        .pb-stack-name { font-size:13px; font-weight:700; }
        .pb-stack-desc { font-size:11px; color:var(--text-secondary,#64748b); }
        .pb-config-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .pb-pills { display:flex; flex-wrap:wrap; gap:8px; }
        .pb-pill { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:20px; padding:6px 14px; font-size:13px; cursor:pointer; transition:all .2s; }
        .pb-pill.active { background:rgba(245,158,11,.15); border-color:rgba(245,158,11,.5); color:#f59e0b; }
        .pb-btn { background:linear-gradient(135deg,#d97706,#b45309); border:none; border-radius:12px; padding:14px 28px; color:white; font-size:15px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; justify-content:center; }
        .pb-btn-sm { background:linear-gradient(135deg,#d97706,#b45309); border:none; border-radius:10px; padding:10px 20px; color:white; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .pb-ideas-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; margin-top:20px; }
        .pb-idea-card { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:16px; padding:20px; cursor:pointer; transition:all .2s; }
        .pb-idea-card.selected { border-color:rgba(245,158,11,.6); background:rgba(245,158,11,.06); }
        .pb-idea-card:hover { border-color:rgba(245,158,11,.3); }
        .pb-idea-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; }
        .pb-idea-name { font-size:16px; font-weight:700; margin:0; }
        .pb-idea-badges { display:flex; flex-direction:column; gap:3px; align-items:flex-end; }
        .pb-badge-small { font-size:11px; font-weight:600; }
        .pb-idea-tagline { font-size:13px; color:var(--text-secondary,#94a3b8); margin:0 0 8px; }
        .pb-idea-desc { font-size:12px; color:var(--text-secondary,#64748b); margin:0; line-height:1.4; }
        .pb-idea-selected-badge { margin-top:12px; font-size:12px; color:#f59e0b; font-weight:600; }
        .pb-panel-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; font-size:14px; }
        .pb-result-block { display:flex; flex-direction:column; gap:16px; }
        .pb-code-block { background:rgba(0,0,0,.25); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:12px; overflow:hidden; }
        .pb-code-header { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:rgba(0,0,0,.2); font-size:13px; font-weight:600; border-bottom:1px solid var(--border,rgba(255,255,255,.06)); }
        .pb-code { padding:16px; margin:0; font-size:12px; font-family:monospace; overflow-x:auto; white-space:pre; max-height:350px; overflow-y:auto; }
        .pb-copy-sm { background:rgba(255,255,255,.08); border:none; border-radius:6px; padding:4px 8px; cursor:pointer; color:var(--text-secondary,#94a3b8); }
        .pb-model-card { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:14px; padding:18px; margin-bottom:14px; }
        .pb-model-name { font-size:15px; font-weight:700; margin:0 0 4px; color:#fbbf24; }
        .pb-relations { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
        .pb-relation-chip { background:rgba(99,102,241,.15); color:#818cf8; border-radius:20px; padding:4px 10px; font-size:12px; }
        .pb-api-table { display:flex; flex-direction:column; gap:1px; background:var(--border,rgba(255,255,255,.06)); border-radius:14px; overflow:hidden; }
        .pb-api-row { background:var(--card-bg,rgba(15,15,25,1)); padding:12px 16px; display:flex; align-items:center; gap:12px; font-size:13px; }
        .pb-method { font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; flex-shrink:0; }
        .pb-method-get { background:rgba(34,197,94,.15); color:#22c55e; }
        .pb-method-post { background:rgba(99,102,241,.15); color:#818cf8; }
        .pb-method-put,.pb-method-patch { background:rgba(245,158,11,.15); color:#f59e0b; }
        .pb-method-delete { background:rgba(239,68,68,.15); color:#ef4444; }
        .pb-path { font-family:monospace; color:#fbbf24; flex-shrink:0; }
        .pb-ep-desc { color:var(--text-secondary,#64748b); font-size:12px; }
        .pb-auth-badge { margin-left:auto; font-size:12px; }
        .pb-phase-card { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:14px; padding:18px; margin-bottom:14px; }
        .pb-phase-name { font-size:15px; font-weight:700; margin:0 0 10px; color:#fbbf24; }
        .pb-phase-env { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; margin-bottom:12px; }
        .pb-env-item { font-size:12px; }
        .pb-env-key { font-weight:700; color:var(--text-secondary,#94a3b8); }
        .pb-steps-list { margin:0; padding-left:20px; display:flex; flex-direction:column; gap:6px; }
        .pb-steps-list li { font-size:13px; }
        .spin { animation:spin 1s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
