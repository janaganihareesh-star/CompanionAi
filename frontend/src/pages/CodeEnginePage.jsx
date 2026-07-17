import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Loader2, Copy, Bug, Shield, Zap, TestTube, BookText, HelpCircle, Search } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import PyodideSandbox from '../components/PyodideSandbox';
import UniversalChartRenderer from '../components/UniversalChartRenderer';

const LANGS = ['javascript','typescript','python','java','c','cpp','csharp','go','rust','php','sql','kotlin','swift'];
const OPS = [
  { key: 'generate',      label: 'Generate',     icon: <Code2 size={14} />,     color: '#6366f1', endpoint: '/api/code/generate',      needsDesc: true },
  { key: 'debug',         label: 'Debug',         icon: <Bug size={14} />,       color: '#ef4444', endpoint: '/api/code/debug',         needsDesc: false },
  { key: 'review',        label: 'Review',        icon: <Search size={14} />,    color: '#f59e0b', endpoint: '/api/code/review',        needsDesc: false },
  { key: 'optimize',      label: 'Optimize',      icon: <Zap size={14} />,       color: '#22c55e', endpoint: '/api/code/optimize',      needsDesc: false },
  { key: 'security',      label: 'Security Audit',icon: <Shield size={14} />,    color: '#ec4899', endpoint: '/api/code/security',      needsDesc: false },
  { key: 'test-cases',    label: 'Unit Tests',    icon: <TestTube size={14} />,  color: '#0ea5e9', endpoint: '/api/code/test-cases',    needsDesc: false },
  { key: 'documentation', label: 'Generate Docs', icon: <BookText size={14} />,  color: '#8b5cf6', endpoint: '/api/code/documentation', needsDesc: false },
  { key: 'explain',       label: 'Explain Code',  icon: <HelpCircle size={14} />,color: '#06b6d4', endpoint: '/api/code/explain',       needsDesc: false },
];

export default function CodeEnginePage() {
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeOp, setActiveOp] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const token = localStorage.getItem('closer-token');
  const appStoreSafeMode = useSelector((state) => state.settings?.preferences?.appStoreSafeMode || false);
  const currentOp = OPS.find(o => o.key === activeOp);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const body = currentOp.needsDesc
        ? { description, language: lang }
        : { code, language: lang, errorMessage: errorMsg };
      const { data } = await axios.post(currentOp.endpoint, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(data);
    } catch { alert('Operation failed. Check API key.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="ce-page">
          <div className="ce-header">
        <div className="ce-badge">💻 Code Engine</div>
        <h1 className="ce-title">AI-Powered Code Assistant</h1>
        <p className="ce-sub">Generate · Debug · Review · Optimize · Security · Tests · Docs — all in one</p>
      </div>

      {/* Op selector */}
      <div className="ce-ops">
        {OPS.map(o => (
          <button key={o.key} className={`ce-op ${activeOp === o.key ? 'active' : ''}`}
            onClick={() => { setActiveOp(o.key); setResult(null); }}
            style={{ '--c': o.color }}>
            <span style={{ color: o.color }}>{o.icon}</span> {o.label}
          </button>
        ))}
      </div>

      {/* Language selector */}
      <div className="ce-lang-row">
        <span className="ce-lang-label">Language:</span>
        <div className="ce-langs">
          {LANGS.map(l => (
            <button key={l} className={`ce-lang ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="ce-input-area">
        {currentOp?.needsDesc ? (
          <>
            <label className="ce-label">Describe what to build</label>
            <textarea className="ce-textarea" rows={4} placeholder="e.g. REST API endpoint for user authentication with JWT, include refresh tokens" value={description} onChange={e => setDescription(e.target.value)} />
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="ce-label" style={{ margin: 0 }}>Paste your code</label>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Monaco IDE Enabled</span>
            </div>
            <div style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Editor
                height="100%"
                language={lang}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  padding: { top: 16 }
                }}
              />
            </div>
            {lang === 'python' && !appStoreSafeMode && (
              <PyodideSandbox initialCode={code || "print('Hello from Pyodide!')"} />
            )}
            {lang === 'python' && appStoreSafeMode && (
              <div className="p-4 mt-4 rounded-xl border border-border bg-surface text-muted text-sm flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Live Execution is disabled in App Store Safe Mode
              </div>
            )}
            {activeOp === 'debug' && (
              <input className="ce-input" placeholder="Error message (optional)" value={errorMsg} onChange={e => setErrorMsg(e.target.value)} style={{ marginTop: '12px' }} />
            )}
          </>
        )}
        <button className="ce-run-btn" onClick={run} disabled={loading || (!currentOp?.needsDesc && !code) || (currentOp?.needsDesc && !description)}>
          {loading ? <><Loader2 size={16} className="spin" /> Running...</> : `🚀 ${currentOp?.label}`}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div className="ce-result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Score badge for review */}
            {result.overallScore !== undefined && (
              <div className="ce-score-row">
                <span>Overall Score:</span>
                <span className="ce-score" style={{ color: result.overallScore >= 80 ? '#22c55e' : result.overallScore >= 60 ? '#f59e0b' : '#ef4444' }}>
                  {result.overallScore}/100 ({result.grade})
                </span>
              </div>
            )}

            {/* Security risk */}
            {result.riskLevel && (
              <div className={`ce-risk-badge ${result.riskLevel}`}>{result.riskLevel.toUpperCase()} RISK — Score: {result.securityScore}/100</div>
            )}

            {/* Issues / bugs */}
            {(result.bugs || result.issues || result.vulnerabilities)?.length > 0 && (
              <div className="ce-issues">
                {(result.bugs || result.issues || result.vulnerabilities).map((b, i) => (
                  <div key={i} className={`ce-issue ce-issue-${b.severity}`}>
                    <div className="ce-issue-header">
                      <span className="ce-issue-type">{b.type || b.category}</span>
                      <span className={`ce-sev ${b.severity}`}>{b.severity}</span>
                      {b.line && <span className="ce-line">Line {b.line}</span>}
                    </div>
                    <p className="ce-issue-desc">{b.description}</p>
                    {b.fix && <p className="ce-issue-fix">💡 {b.fix}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Generated / fixed / optimized / documented / test code */}
            {(result.code || result.fixedCode || result.optimizedCode || result.documentedCode || result.testCode || result.refactoredCode || result.secureVersion) && (
              <div className="ce-code-block">
                <div className="ce-code-header">
                  {result.code ? 'Generated Code' : result.fixedCode ? 'Fixed Code' : result.optimizedCode ? 'Optimized Code' : result.documentedCode ? 'Documented Code' : result.testCode ? 'Test Code' : result.secureVersion ? 'Secure Code' : 'Refactored Code'}
                  <button className="ce-copy" onClick={() => navigator.clipboard.writeText(result.code || result.fixedCode || result.optimizedCode || result.documentedCode || result.testCode || result.refactoredCode || result.secureVersion)}><Copy size={12} /> Copy</button>
                </div>
                <pre className="ce-code">{result.code || result.fixedCode || result.optimizedCode || result.documentedCode || result.testCode || result.refactoredCode || result.secureVersion}</pre>
                {/* Try to parse any outputted code for Chart JSON */}
                <UniversalChartRenderer outputString={result.code || result.fixedCode || result.optimizedCode || ''} />
              </div>
            )}

            {/* Explanation */}
            {(result.explanation || result.overallExplanation || result.summary) && (
              <div className="ce-info-box">
                <strong>Explanation</strong>
                <p>{result.explanation || result.overallExplanation || result.summary}</p>
              </div>
            )}

            {/* Complexity */}
            {(result.timeComplexity || result.afterMetrics) && (
              <div className="ce-complexity-row">
                {result.timeComplexity && <span>⏱ Time: {result.timeComplexity}</span>}
                {result.spaceComplexity && <span>💾 Space: {result.spaceComplexity}</span>}
                {result.afterMetrics?.timeComplexity && <span>⏱ After: {result.afterMetrics.timeComplexity}</span>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .ce-page { padding:0; max-width:1000px; margin:0 auto; }
        .ce-header { text-align:center; margin-bottom:28px; }
        .ce-badge { display:inline-block; background:rgba(99,102,241,.15); color:#818cf8; border:1px solid rgba(99,102,241,.3); border-radius:20px; padding:6px 16px; font-size:13px; font-weight:600; margin-bottom:12px; }
        .ce-title { font-size:28px; font-weight:800; background:linear-gradient(135deg,#c7d2fe,#67e8f9); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 8px; }
        .ce-sub { color:var(--text-secondary,#94a3b8); font-size:14px; }
        .ce-ops { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
        .ce-op { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:10px; padding:8px 14px; font-size:13px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:6px; color:var(--text-secondary,#94a3b8); transition:all .2s; }
        .ce-op.active { background:color-mix(in srgb, var(--c) 15%, transparent); color:var(--c); border-color:color-mix(in srgb, var(--c) 40%, transparent); }
        .ce-lang-row { display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
        .ce-lang-label { font-size:13px; font-weight:600; color:var(--text-secondary,#94a3b8); }
        .ce-langs { display:flex; flex-wrap:wrap; gap:6px; }
        .ce-lang { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.06)); border-radius:8px; padding:5px 10px; font-size:12px; cursor:pointer; font-family:monospace; transition:all .15s; }
        .ce-lang.active { background:rgba(99,102,241,.2); color:#818cf8; border-color:rgba(99,102,241,.4); }
        .ce-input-area { display:flex; flex-direction:column; gap:10px; }
        .ce-label { font-size:13px; font-weight:600; color:var(--text-secondary,#94a3b8); }
        .ce-textarea, .ce-input { background:var(--input-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:12px 14px; color:var(--text,#f1f5f9); font-size:14px; outline:none; width:100%; box-sizing:border-box; }
        .ce-code-input { background:rgba(0,0,0,.3); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:14px; color:#e2e8f0; font-size:13px; font-family:monospace; outline:none; width:100%; box-sizing:border-box; resize:vertical; }
        .ce-run-btn { background:linear-gradient(135deg,#4f46e5,#7c3aed); border:none; border-radius:12px; padding:14px 28px; color:white; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; width:fit-content; }
        .ce-run-btn:disabled { opacity:.5; cursor:not-allowed; }
        .ce-result { display:flex; flex-direction:column; gap:16px; margin-top:24px; }
        .ce-score-row { display:flex; align-items:center; gap:12px; font-size:14px; background:var(--card-bg,rgba(255,255,255,.04)); border-radius:12px; padding:14px 18px; }
        .ce-score { font-size:22px; font-weight:800; }
        .ce-risk-badge { padding:10px 18px; border-radius:10px; font-size:13px; font-weight:700; }
        .ce-risk-badge.critical { background:rgba(239,68,68,.15); color:#ef4444; border:1px solid rgba(239,68,68,.3); }
        .ce-risk-badge.high { background:rgba(245,158,11,.15); color:#f59e0b; border:1px solid rgba(245,158,11,.3); }
        .ce-risk-badge.medium { background:rgba(99,102,241,.12); color:#818cf8; border:1px solid rgba(99,102,241,.3); }
        .ce-risk-badge.low,.ce-risk-badge.safe { background:rgba(34,197,94,.12); color:#22c55e; border:1px solid rgba(34,197,94,.3); }
        .ce-issues { display:flex; flex-direction:column; gap:10px; }
        .ce-issue { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.07)); border-radius:12px; padding:14px 16px; }
        .ce-issue-header { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
        .ce-issue-type { font-size:12px; font-weight:700; text-transform:uppercase; }
        .ce-sev { font-size:11px; padding:3px 8px; border-radius:20px; font-weight:600; }
        .ce-sev.critical { background:rgba(239,68,68,.15); color:#ef4444; }
        .ce-sev.high,.ce-sev.major { background:rgba(245,158,11,.15); color:#f59e0b; }
        .ce-sev.medium { background:rgba(99,102,241,.12); color:#818cf8; }
        .ce-sev.low,.ce-sev.minor,.ce-sev.info { background:rgba(34,197,94,.12); color:#22c55e; }
        .ce-line { font-size:11px; color:var(--text-secondary,#64748b); margin-left:auto; }
        .ce-issue-desc { font-size:13px; line-height:1.5; margin:0 0 4px; }
        .ce-issue-fix { font-size:13px; color:#22c55e; margin:0; }
        .ce-code-block { background:rgba(0,0,0,.25); border:1px solid var(--border,rgba(255,255,255,.07)); border-radius:12px; overflow:hidden; }
        .ce-code-header { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:rgba(0,0,0,.2); font-size:13px; font-weight:600; }
        .ce-copy { background:rgba(255,255,255,.08); border:none; border-radius:6px; padding:4px 10px; cursor:pointer; font-size:12px; color:var(--text-secondary,#94a3b8); display:flex; align-items:center; gap:4px; }
        .ce-code { padding:16px; margin:0; font-size:12px; font-family:monospace; overflow-x:auto; white-space:pre; max-height:500px; overflow-y:auto; }
        .ce-info-box { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.07)); border-radius:12px; padding:16px; }
        .ce-info-box strong { font-size:14px; display:block; margin-bottom:8px; }
        .ce-info-box p { font-size:13px; line-height:1.6; margin:0; }
        .ce-complexity-row { display:flex; gap:16px; font-size:13px; color:var(--text-secondary,#94a3b8); }
        .spin { animation:spin 1s linear infinite; } @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
        </div>
      </main>
    </div>
  );
}
