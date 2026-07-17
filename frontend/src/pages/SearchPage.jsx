import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, Loader2, X, Clock, Pin, Trash2, ExternalLink, BookOpen, Newspaper, Globe, Shield, Code, Heart } from 'lucide-react';
import axios from 'axios';

const MODES = [
  { key: 'general', label: 'Search', icon: <Search size={15} />, color: '#6366f1' },
  { key: 'news',    label: 'News',   icon: <Newspaper size={15} />, color: '#ef4444' },
  { key: 'tech',    label: 'Tech',   icon: <Code size={15} />, color: '#06b6d4' },
  { key: 'visa',    label: 'Visa',   icon: <Globe size={15} />, color: '#22c55e' },
  { key: 'health',  label: 'Health', icon: <Heart size={15} />, color: '#ec4899' },
  { key: 'schemes', label: 'Schemes', icon: <Shield size={15} />, color: '#f59e0b' }
];

const PLACEHOLDERS = [
  'Latest AI developments...', 'Australia student visa process...',
  'Java 21 features explained...', 'PM Kisan Yojana eligibility...',
  'React 19 vs React 18...', 'Symptoms of vitamin D deficiency...'
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('general');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [deepMode, setDeepMode] = useState(false);
  const inputRef = useRef(null);

  const token = localStorage.getItem('closer-token');
  const headers = { Authorization: `Bearer ${token}` };

  // Rotate placeholders
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => { i = (i + 1) % PLACEHOLDERS.length; setPlaceholder(PLACEHOLDERS[i]); }, 3000);
    return () => clearInterval(iv);
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await axios.get('/api/search/history', { headers });
      setHistory(data.history || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadHistory(); }, []);

  const doSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setResult(null);
    setShowHistory(false);

    try {
      const endpoint = deepMode ? '/api/search/deep-research' : '/api/search/query';
      const body = deepMode
        ? { topic: q, outputFormat: 'report', depth: 'deep' }
        : { query: q, format: 'detailed', depth: 'surface' };

      const { data } = await axios.post(endpoint, body, { headers });
      setResult(data);
      loadHistory();
    } catch { alert('Search failed. Check API keys.'); }
    finally { setLoading(false); }
  };

  const togglePin = async (id) => {
    await axios.put(`/api/search/history/${id}/pin`, {}, { headers });
    loadHistory();
  };
  const deleteHistory = async (id) => {
    await axios.delete(`/api/search/history/${id}`, { headers });
    loadHistory();
  };

  const intentColor = (intent) => MODES.find(m => m.key === intent)?.color || '#6366f1';

  return (
    <div className="sp-page">
      {/* Header */}
      <div className="sp-header">
        <div className="sp-badge">🔍 Search Engine</div>
        <h1 className="sp-title">Real-Time Web Intelligence</h1>
        <p className="sp-sub">Search the web in your language — news, visa, tech, health, government schemes</p>
      </div>

      {/* Search Box */}
      <div className="sp-search-wrap">
        <div className="sp-search-box">
          <Search size={20} className="sp-search-icon" />
          <input
            ref={inputRef}
            className="sp-search-input"
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
          />
          {query && <button className="sp-clear" onClick={() => { setQuery(''); setResult(null); }}><X size={16} /></button>}
          <button className="sp-search-btn" onClick={() => doSearch()} disabled={loading || !query.trim()}>
            {loading ? <Loader2 size={16} className="spin" /> : 'Search'}
          </button>
        </div>

        {/* Mode quick buttons */}
        <div className="sp-modes">
          {MODES.map(m => (
            <button key={m.key} className={`sp-mode-btn ${mode === m.key ? 'active' : ''}`}
              style={{ '--mode-color': m.color }}
              onClick={() => { setMode(m.key); if (m.key !== 'general') setQuery(m.label + ': '); inputRef.current?.focus(); }}>
              {m.icon} {m.label}
            </button>
          ))}
          <button className={`sp-mode-btn deep ${deepMode ? 'active' : ''}`} onClick={() => setDeepMode(d => !d)}
            style={{ '--mode-color': '#a78bfa' }}>
            <BookOpen size={15} /> {deepMode ? 'Deep Research ✓' : 'Deep Research'}
          </button>
        </div>

        {/* History dropdown */}
        <AnimatePresence>
          {showHistory && history.length > 0 && !query && (
            <motion.div className="sp-history-drop" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onMouseLeave={() => setShowHistory(false)}>
              <div className="sp-history-header">
                <span><Clock size={13} /> Recent Searches</span>
              </div>
              {history.slice(0, 6).map(h => (
                <div key={h._id} className="sp-history-item" onClick={() => { setQuery(h.query); setShowHistory(false); }}>
                  <div style={{ color: intentColor(h.intent), marginRight: 8 }}>{MODES.find(m => m.key === h.intent)?.icon || <Search size={13} />}</div>
                  <span className="sp-history-q">{h.query}</span>
                  <div className="sp-history-actions">
                    <button onClick={e => { e.stopPropagation(); togglePin(h._id); }}><Pin size={12} style={{ color: h.isPinned ? '#f59e0b' : 'inherit' }} /></button>
                    <button onClick={e => { e.stopPropagation(); deleteHistory(h._id); }}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading */}
      {loading && (
        <div className="sp-loading">
          <Loader2 size={32} className="spin" />
          <p>{deepMode ? 'Analyzing multiple sources...' : 'Searching the web...'}</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div className="sp-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Quick search result */}
            {!deepMode && result.summary && (
              <>
                <div className="sp-result-card">
                  <div className="sp-result-header">
                    <span className="sp-intent-badge" style={{ color: intentColor(result.intent), background: `${intentColor(result.intent)}20` }}>
                      {result.intent}
                    </span>
                    <span className={`sp-confidence ${result.confidence}`}>{result.confidence} confidence</span>
                  </div>
                  <div className="sp-summary">{result.summary}</div>
                  {result.keyPoints?.length > 0 && (
                    <ul className="sp-key-points">
                      {result.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  )}
                  {result.disclaimer && (
                    <div className="sp-disclaimer">{result.disclaimer}</div>
                  )}
                </div>

                {/* Sources */}
                {result.sources?.length > 0 && (
                  <div className="sp-sources">
                    <h4>Sources</h4>
                    <div className="sp-sources-grid">
                      {result.sources.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noreferrer" className="sp-source-chip">
                          <span className="sp-source-domain">{s.domain}</span>
                          <span className="sp-source-title">{s.title}</span>
                          <ExternalLink size={11} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Deep research result */}
            {deepMode && result.report && (
              <div className="sp-deep-report">
                <h2 className="sp-report-title">{result.report.title || query}</h2>
                <div className="sp-report-toc">
                  {(result.report.tableOfContents || []).map((item, i) => (
                    <span key={i} className="sp-toc-item">{i + 1}. {item}</span>
                  ))}
                </div>

                <div className="sp-report-section">
                  <h3>Executive Summary</h3>
                  <p>{result.report.executiveSummary}</p>
                </div>

                {result.report.keyFindings?.length > 0 && (
                  <div className="sp-report-section">
                    <h3>Key Findings</h3>
                    {result.report.keyFindings.map((f, i) => (
                      <div key={i} className="sp-finding">
                        <span className="sp-finding-num">{i + 1}</span>
                        <div>
                          <p className="sp-finding-text">{f.finding}</p>
                          {f.source && <span className="sp-finding-source">— {f.source}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.report.currentState && (
                  <div className="sp-report-section">
                    <h3>Current State</h3>
                    <p>{result.report.currentState}</p>
                  </div>
                )}

                {result.report.implications && (
                  <div className="sp-report-section">
                    <h3>What This Means For You</h3>
                    <p>{result.report.implications}</p>
                  </div>
                )}

                {result.report.sources?.length > 0 && (
                  <div className="sp-sources">
                    <h4>Sources Analyzed</h4>
                    <div className="sp-sources-grid">
                      {result.report.sources.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noreferrer" className="sp-source-chip">
                          <span className="sp-source-title">{s.title}</span>
                          <ExternalLink size={11} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {result.subQuestionsAnalyzed?.length > 0 && (
                  <div className="sp-sub-qs">
                    <span>Sub-questions analyzed:</span>
                    {result.subQuestionsAnalyzed.map((q, i) => <span key={i} className="sp-sub-q">{q}</span>)}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .sp-page { padding:32px 24px; max-width:860px; margin:0 auto; }
        .sp-header { text-align:center; margin-bottom:36px; }
        .sp-badge { display:inline-block; background:rgba(99,102,241,.15); color:#818cf8; border:1px solid rgba(99,102,241,.3); border-radius:20px; padding:6px 16px; font-size:13px; font-weight:600; margin-bottom:12px; }
        .sp-title { font-size:30px; font-weight:800; background:linear-gradient(135deg,#c7d2fe,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 8px; }
        .sp-sub { color:var(--text-secondary,#94a3b8); font-size:14px; }
        .sp-search-wrap { position:relative; margin-bottom:32px; }
        .sp-search-box { display:flex; align-items:center; background:var(--card-bg,rgba(255,255,255,.06)); border:1px solid rgba(99,102,241,.4); border-radius:16px; padding:6px 6px 6px 16px; gap:10px; transition:border-color .2s; }
        .sp-search-box:focus-within { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.12); }
        .sp-search-icon { color:var(--text-secondary,#64748b); flex-shrink:0; }
        .sp-search-input { flex:1; background:none; border:none; outline:none; color:var(--text,#f1f5f9); font-size:16px; padding:8px 0; }
        .sp-clear { background:none; border:none; color:var(--text-secondary,#64748b); cursor:pointer; padding:4px; }
        .sp-search-btn { background:linear-gradient(135deg,#4f46e5,#7c3aed); border:none; border-radius:12px; padding:10px 20px; color:white; font-size:14px; font-weight:600; cursor:pointer; flex-shrink:0; display:flex; align-items:center; gap:6px; }
        .sp-search-btn:disabled { opacity:.5; }
        .sp-modes { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
        .sp-mode-btn { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:20px; padding:7px 14px; font-size:13px; font-weight:500; cursor:pointer; color:var(--text-secondary,#94a3b8); display:flex; align-items:center; gap:5px; transition:all .2s; }
        .sp-mode-btn.active { background:color-mix(in srgb, var(--mode-color) 15%, transparent); color:var(--mode-color); border-color:color-mix(in srgb, var(--mode-color) 40%, transparent); }
        .sp-history-drop { position:absolute; top:calc(100% + 8px); left:0; right:0; background:var(--page-bg,#0f0f1a); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:14px; z-index:100; overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,.4); }
        .sp-history-header { padding:10px 16px; font-size:12px; font-weight:600; color:var(--text-secondary,#64748b); display:flex; align-items:center; gap:6px; border-bottom:1px solid var(--border,rgba(255,255,255,.06)); }
        .sp-history-item { padding:10px 16px; display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; transition:background .15s; }
        .sp-history-item:hover { background:rgba(255,255,255,.04); }
        .sp-history-q { flex:1; color:var(--text,#f1f5f9); }
        .sp-history-actions { display:flex; gap:6px; }
        .sp-history-actions button { background:none; border:none; color:var(--text-secondary,#64748b); cursor:pointer; padding:2px; }
        .sp-loading { display:flex; flex-direction:column; align-items:center; gap:16px; padding:60px; color:var(--text-secondary,#94a3b8); }
        .sp-results { display:flex; flex-direction:column; gap:16px; }
        .sp-result-card { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:16px; padding:24px; }
        .sp-result-header { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
        .sp-intent-badge { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
        .sp-confidence { font-size:12px; color:var(--text-secondary,#64748b); }
        .sp-confidence.high { color:#22c55e; }
        .sp-confidence.medium { color:#f59e0b; }
        .sp-confidence.low { color:#ef4444; }
        .sp-summary { font-size:15px; line-height:1.7; color:var(--text,#f1f5f9); white-space:pre-line; }
        .sp-key-points { margin:16px 0 0; padding-left:20px; display:flex; flex-direction:column; gap:6px; }
        .sp-key-points li { font-size:13px; line-height:1.5; }
        .sp-disclaimer { margin-top:16px; padding:12px 16px; background:rgba(245,158,11,.1); border:1px solid rgba(245,158,11,.3); border-radius:10px; font-size:13px; color:#fbbf24; }
        .sp-sources { background:var(--card-bg,rgba(255,255,255,.03)); border:1px solid var(--border,rgba(255,255,255,.07)); border-radius:14px; padding:18px; }
        .sp-sources h4 { margin:0 0 12px; font-size:14px; font-weight:700; }
        .sp-sources-grid { display:flex; flex-wrap:wrap; gap:8px; }
        .sp-source-chip { background:rgba(99,102,241,.08); border:1px solid rgba(99,102,241,.2); border-radius:10px; padding:6px 12px; font-size:12px; display:flex; align-items:center; gap:6px; text-decoration:none; color:var(--text,#f1f5f9); transition:background .2s; }
        .sp-source-chip:hover { background:rgba(99,102,241,.15); }
        .sp-source-domain { color:#818cf8; font-weight:600; }
        .sp-source-title { color:var(--text-secondary,#94a3b8); }
        .sp-deep-report { display:flex; flex-direction:column; gap:20px; }
        .sp-report-title { font-size:24px; font-weight:800; margin:0; }
        .sp-report-toc { display:flex; flex-wrap:wrap; gap:8px; }
        .sp-toc-item { font-size:12px; color:#818cf8; background:rgba(99,102,241,.1); border-radius:20px; padding:4px 12px; }
        .sp-report-section { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.07)); border-radius:14px; padding:20px; }
        .sp-report-section h3 { margin:0 0 12px; font-size:16px; font-weight:700; color:#818cf8; }
        .sp-report-section p { margin:0; font-size:14px; line-height:1.7; }
        .sp-finding { display:flex; gap:12px; align-items:flex-start; margin-bottom:12px; }
        .sp-finding-num { background:rgba(99,102,241,.2); color:#818cf8; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; margin-top:2px; }
        .sp-finding-text { font-size:14px; line-height:1.5; margin:0 0 4px; }
        .sp-finding-source { font-size:12px; color:var(--text-secondary,#64748b); }
        .sp-sub-qs { display:flex; flex-wrap:wrap; gap:8px; align-items:center; font-size:12px; color:var(--text-secondary,#64748b); }
        .sp-sub-q { background:rgba(255,255,255,.05); border-radius:8px; padding:4px 10px; }
        .spin { animation:spin 1s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
