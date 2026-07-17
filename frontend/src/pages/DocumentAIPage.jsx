import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, X, Brain, MessageSquare, Globe, List, BookOpen, Table, BookMarked } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const OPS = [
  { key: 'summarize',   label: 'Summarize',   icon: <FileText size={15} />,    endpoint: '/api/document/summarize',   color: '#6366f1' },
  { key: 'explain',     label: 'Explain',     icon: <Brain size={15} />,        endpoint: '/api/document/explain',     color: '#ec4899' },
  { key: 'translate',   label: 'Translate',   icon: <Globe size={15} />,        endpoint: '/api/document/translate',   color: '#22c55e' },
  { key: 'mcq',         label: 'Generate MCQ', icon: <List size={15} />,         endpoint: '/api/document/mcq',         color: '#f59e0b' },
  { key: 'interview',   label: 'Interview Qs', icon: <MessageSquare size={15} />, endpoint: '/api/document/interview-questions', color: '#0ea5e9' },
  { key: 'notes',       label: 'Study Notes',  icon: <BookOpen size={15} />,     endpoint: '/api/document/notes',       color: '#8b5cf6' },
  { key: 'tables',      label: 'Extract Tables',icon: <Table size={15} />,       endpoint: '/api/document/extract-tables', color: '#06b6d4' },
];

const LANGS = ['Hindi','Telugu','Tamil','Kannada','Malayalam','Bengali','English','French','German','Spanish','Japanese','Chinese','Arabic'];

export default function DocumentAIPage() {
  const [docText, setDocText] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [op, setOp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [targetLang, setTargetLang] = useState('Telugu');
  const fileRef = useRef();
  const token = localStorage.getItem('closer-token');

  const handleFile = async (file) => {
    setFileName(file.name);
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await axios.post('/api/document/upload', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setDocText(data.extractedText || '');
    } catch { alert('File upload failed.'); }
    finally { setUploading(false); }
  };

  const run = async (operation) => {
    if (!docText) return alert('Please upload a document first.');
    setOp(operation.key);
    setLoading(true);
    setResult(null);
    try {
      const body = { text: docText, ...(operation.key === 'translate' ? { targetLanguage: targetLang } : {}) };
      const { data } = await axios.post(operation.endpoint, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult({ op: operation.key, label: operation.label, data });
    } catch { alert('Operation failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="dai-page">
          <div className="dai-header">
        <div className="dai-badge">🧠 Document AI</div>
        <h1 className="dai-title">Upload. Analyze. Understand.</h1>
        <p className="dai-sub">PDF, DOCX, Excel — summarize, explain, translate, generate MCQs and more</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`dai-upload ${docText ? 'success' : ''}`}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => !docText && fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" hidden accept=".pdf,.docx,.xlsx,.txt,.csv" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
        {uploading ? (
          <><Loader2 size={32} className="spin" /><p>Extracting text...</p></>
        ) : docText ? (
          <div className="dai-uploaded">
            <FileText size={28} className="dai-file-icon" />
            <div>
              <strong>{fileName}</strong>
              <p>{docText.trim().split(/\s+/).length.toLocaleString()} words extracted</p>
            </div>
            <button className="dai-clear" onClick={(e) => { e.stopPropagation(); setDocText(''); setFileName(''); setResult(null); }}><X size={14} /></button>
          </div>
        ) : (
          <>
            <Upload size={36} />
            <p>Drop PDF, DOCX, Excel here or click to browse</p>
            <span>Max 10MB</span>
          </>
        )}
      </div>

      {/* Or paste text */}
      {!docText && (
        <div style={{ margin: '16px 0' }}>
          <textarea className="dai-paste" rows={5} placeholder="Or paste document text here..." onChange={e => setDocText(e.target.value)} />
        </div>
      )}

      {/* Operations grid */}
      <div className="dai-ops">
        {OPS.map(o => (
          <motion.button key={o.key} className="dai-op-btn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => run(o)} disabled={loading && op === o.key}
            style={{ '--op-color': o.color }}>
            <span className="dai-op-icon" style={{ background: `${o.color}20`, color: o.color }}>{o.icon}</span>
            <span>{o.label}</span>
            {loading && op === o.key && <Loader2 size={13} className="spin" />}
          </motion.button>
        ))}
        {/* Language selector for translate */}
        <div className="dai-translate-row">
          <Globe size={13} style={{ color: '#22c55e' }} />
          <select className="dai-lang-sel" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
            {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Result display */}
      <AnimatePresence>
        {result && (
          <motion.div className="dai-result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h3 className="dai-result-title">{result.label} Result</h3>

            {result.op === 'summarize' && (
              <>
                <div className="dai-result-summary">{result.data.summary}</div>
                {result.data.keyPoints?.length > 0 && (
                  <div><h4>Key Points</h4><ul className="dai-result-list">{result.data.keyPoints.map((p,i)=><li key={i}>{p}</li>)}</ul></div>
                )}
              </>
            )}

            {result.op === 'explain' && (
              <>
                <div className="dai-result-summary">{result.data.explanation}</div>
                {result.data.keyTerms?.length > 0 && (
                  <div className="dai-term-chips">
                    {result.data.keyTerms.map((t,i)=>(
                      <div key={i} className="dai-term-chip"><span className="dai-term">{t.term}:</span> {t.definition}</div>
                    ))}
                  </div>
                )}
              </>
            )}

            {result.op === 'translate' && (
              <pre className="dai-translated">{result.data.translatedDocument || result.data.translatedText}</pre>
            )}

            {result.op === 'mcq' && (
              <div className="dai-mcq-list">
                {result.data.mcqs?.map((q,i)=>(
                  <div key={i} className="dai-mcq-card">
                    <p className="dai-mcq-q"><strong>Q{i+1}.</strong> {q.question}</p>
                    <div className="dai-mcq-opts">
                      {Object.entries(q.options||{}).map(([k,v])=>(
                        <span key={k} className={`dai-mcq-opt ${k===q.correctAnswer?'correct':''}`}>{k}. {v}</span>
                      ))}
                    </div>
                    <p className="dai-mcq-exp">✅ {q.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {(result.op === 'interview' || result.op === 'notes' || result.op === 'tables') && (
              <pre className="dai-raw">{JSON.stringify(result.data, null, 2)}</pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .dai-page { padding:0; max-width:860px; margin:0 auto; }
        .dai-header { text-align:center; margin-bottom:28px; }
        .dai-badge { display:inline-block; background:rgba(236,72,153,.15); color:#f472b6; border:1px solid rgba(236,72,153,.3); border-radius:20px; padding:6px 16px; font-size:13px; font-weight:600; margin-bottom:12px; }
        .dai-title { font-size:28px; font-weight:800; background:linear-gradient(135deg,#fda4af,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 8px; }
        .dai-sub { color:var(--text-secondary,#94a3b8); font-size:14px; }
        .dai-upload { border:2px dashed var(--border,rgba(255,255,255,.15)); border-radius:16px; padding:40px 24px; text-align:center; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:10px; color:var(--text-secondary,#94a3b8); transition:border-color .2s; }
        .dai-upload:hover { border-color:rgba(236,72,153,.5); }
        .dai-upload.success { border-color:rgba(34,197,94,.4); border-style:solid; cursor:default; }
        .dai-upload p { margin:0; font-size:15px; }
        .dai-upload span { font-size:12px; }
        .dai-uploaded { display:flex; align-items:center; gap:14px; text-align:left; }
        .dai-file-icon { color:#22c55e; flex-shrink:0; }
        .dai-uploaded strong { display:block; font-size:15px; }
        .dai-uploaded p { font-size:12px; color:var(--text-secondary,#64748b); margin:2px 0 0; }
        .dai-clear { background:rgba(239,68,68,.15); border:none; border-radius:6px; padding:6px; color:#ef4444; cursor:pointer; margin-left:auto; }
        .dai-paste { width:100%; background:var(--input-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:12px; padding:14px; color:var(--text,#f1f5f9); font-size:14px; outline:none; resize:vertical; box-sizing:border-box; }
        .dai-ops { display:flex; flex-wrap:wrap; gap:10px; margin:20px 0; align-items:center; }
        .dai-op-btn { background:var(--card-bg,rgba(255,255,255,.05)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:12px; padding:10px 16px; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:var(--text,#f1f5f9); transition:all .2s; }
        .dai-op-btn:hover { border-color:var(--op-color); background:color-mix(in srgb, var(--op-color) 12%, transparent); }
        .dai-op-icon { width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
        .dai-translate-row { display:flex; align-items:center; gap:6px; }
        .dai-lang-sel { background:var(--input-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:8px; padding:8px 12px; color:var(--text,#f1f5f9); font-size:13px; outline:none; }
        .dai-result { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:16px; padding:24px; margin-top:16px; }
        .dai-result-title { font-size:16px; font-weight:700; margin:0 0 16px; }
        .dai-result-summary { font-size:14px; line-height:1.7; margin-bottom:16px; }
        .dai-result-list { padding-left:20px; display:flex; flex-direction:column; gap:6px; }
        .dai-result-list li { font-size:13px; line-height:1.5; }
        .dai-term-chips { display:flex; flex-direction:column; gap:8px; margin-top:12px; }
        .dai-term-chip { background:rgba(99,102,241,.08); border-radius:8px; padding:8px 12px; font-size:13px; }
        .dai-term { font-weight:700; color:#818cf8; }
        .dai-translated { white-space:pre-wrap; font-size:14px; line-height:1.7; }
        .dai-mcq-list { display:flex; flex-direction:column; gap:16px; }
        .dai-mcq-card { background:rgba(0,0,0,.15); border-radius:12px; padding:16px; }
        .dai-mcq-q { margin:0 0 10px; font-size:14px; font-weight:600; }
        .dai-mcq-opts { display:flex; flex-direction:column; gap:5px; margin-bottom:10px; }
        .dai-mcq-opt { font-size:13px; padding:6px 10px; border-radius:6px; background:rgba(255,255,255,.04); }
        .dai-mcq-opt.correct { background:rgba(34,197,94,.15); color:#22c55e; font-weight:600; }
        .dai-mcq-exp { font-size:12px; color:var(--text-secondary,#64748b); margin:0; }
        .dai-raw { font-size:11px; font-family:monospace; max-height:400px; overflow-y:auto; background:rgba(0,0,0,.2); border-radius:8px; padding:14px; }
        .spin { animation:spin 1s linear infinite; } @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
        </div>
      </main>
    </div>
  );
}
