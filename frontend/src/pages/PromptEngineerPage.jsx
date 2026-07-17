import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Loader2, Copy, Sparkles, Bug, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const AI_SYSTEMS = [
  { key: 'chatgpt', label: 'ChatGPT / GPT-4', type: 'llm' },
  { key: 'gemini', label: 'Gemini (Google)', type: 'llm' },
  { key: 'claude', label: 'Claude (Anthropic)', type: 'llm' },
  { key: 'cursor', label: 'Cursor (IDE)', type: 'code' },
  { key: 'bolt', label: 'Bolt.new', type: 'code' },
  { key: 'lovable', label: 'Lovable.dev', type: 'ui' },
  { key: 'midjourney', label: 'Midjourney', type: 'image' },
  { key: 'flux', label: 'Flux Image', type: 'image' },
  { key: 'stablediffusion', label: 'Stable Diffusion', type: 'image' },
  { key: 'dalle', label: 'DALL-E 3', type: 'image' }
];

export default function PromptEngineerPage() {
  const [tab, setTab] = useState('generate'); // 'generate' | 'optimize' | 'debug' | 'templates'
  const [targetAI, setTargetAI] = useState('chatgpt');
  const [goal, setGoal] = useState('');
  const [style, setStyle] = useState('standard');
  const [existingPrompt, setExistingPrompt] = useState('');
  const [problem, setProblem] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [actualOutput, setActualOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const token = localStorage.getItem('closer-token');

  useEffect(() => {
    if (tab === 'templates') {
      fetchTemplates();
    }
  }, [tab]);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const { data } = await axios.get('/api/prompts/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(data.templates || []);
    } catch (e) {
      console.error(e);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const execute = async () => {
    setLoading(true);
    setResult(null);
    try {
      let endpoint = '/api/prompts/generate';
      let payload = { goal, targetAI, style };

      if (tab === 'optimize') {
        endpoint = '/api/prompts/optimize';
        payload = { existingPrompt, targetAI, goal };
      } else if (tab === 'debug') {
        endpoint = '/api/prompts/debug';
        payload = { prompt: existingPrompt, targetAI, problem, expectedOutput, actualOutput };
      }

      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Operation failed. Make sure backend and GEMINI_API_KEY are ready.');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (tmpl) => {
    setTab('generate');
    setGoal(tmpl.template);
    setResult(null);
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="pe-page">
          <div className="pe-header">
        <div className="pe-badge">🪄 Prompt Engineer</div>
        <h1 className="pe-title">AI Prompt Optimization Engine</h1>
        <p className="pe-sub">Generate, optimize, and debug prompts for text, code, UI, or image generators</p>
      </div>

      {/* Tabs */}
      <div className="pe-tabs">
        <button className={`pe-tab ${tab === 'generate' ? 'active' : ''}`} onClick={() => { setTab('generate'); setResult(null); }}><Sparkles size={14} /> Generate Prompt</button>
        <button className={`pe-tab ${tab === 'optimize' ? 'active' : ''}`} onClick={() => { setTab('optimize'); setResult(null); }}><Wand2 size={14} /> Optimize Prompt</button>
        <button className={`pe-tab ${tab === 'debug' ? 'active' : ''}`} onClick={() => { setTab('debug'); setResult(null); }}><Bug size={14} /> Debug Prompt</button>
        <button className={`pe-tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => { setTab('templates'); setResult(null); }}><HelpCircle size={14} /> System Templates</button>
      </div>

      <div className="pe-grid">
        {/* Input panel */}
        <div className="pe-panel">
          <div className="pe-panel-title">Inputs</div>

          <div className="pe-fields">
            {tab !== 'templates' && (
              <div className="pe-field-group">
                <label>Target AI System</label>
                <select value={targetAI} onChange={(e) => setTargetAI(e.target.value)}>
                  {AI_SYSTEMS.map(ai => <option key={ai.key} value={ai.key}>{ai.label}</option>)}
                </select>
              </div>
            )}

            {tab === 'generate' && (
              <>
                <div className="pe-field-group">
                  <label>What is your goal? (What should the AI do?)</label>
                  <textarea rows={6} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Write a script that checks website uptime and sends email reports on downtime..." />
                </div>
                <div className="pe-field-group">
                  <label>Prompt Tone/Style</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)}>
                    <option value="standard">Standard / Professional</option>
                    <option value="detailed">Very Detailed & Comprehensive</option>
                    <option value="few-shot">Few-Shot (Includes mock examples)</option>
                    <option value="minimalist">Minimalist / Direct</option>
                  </select>
                </div>
              </>
            )}

            {tab === 'optimize' && (
              <>
                <div className="pe-field-group">
                  <label>Original Prompt</label>
                  <textarea rows={5} value={existingPrompt} onChange={(e) => setExistingPrompt(e.target.value)} placeholder="Paste the prompt you want to optimize here..." />
                </div>
                <div className="pe-field-group">
                  <label>Optimization Goal (Optional)</label>
                  <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Make it more concise, get output in JSON format..." />
                </div>
              </>
            )}

            {tab === 'debug' && (
              <>
                <div className="pe-field-group">
                  <label>Broken Prompt</label>
                  <textarea rows={4} value={existingPrompt} onChange={(e) => setExistingPrompt(e.target.value)} placeholder="Paste the prompt that behaves incorrectly..." />
                </div>
                <div className="pe-field-group">
                  <label>Describe the problem</label>
                  <input value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. Gives wrong formatting / forgets the role..." />
                </div>
                <div className="pe-field-group">
                  <label>Expected Output (Optional)</label>
                  <textarea rows={2} value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} placeholder="What should the AI output look like?..." />
                </div>
                <div className="pe-field-group">
                  <label>Actual Output (Optional)</label>
                  <textarea rows={2} value={actualOutput} onChange={(e) => setActualOutput(e.target.value)} placeholder="What did the AI actually output?..." />
                </div>
              </>
            )}

            {tab === 'templates' && (
              <div className="pe-templates-list">
                {templatesLoading ? (
                  <div className="pe-loader"><Loader2 size={24} className="spin" /> Loading system templates...</div>
                ) : templates.length > 0 ? (
                  templates.map(t => (
                    <div key={t.key} className="pe-template-card" onClick={() => loadTemplate(t)}>
                      <span className="pe-template-emoji">{t.emoji || '⚙️'}</span>
                      <div className="pe-template-info">
                        <strong>{t.name}</strong>
                        <pre className="pe-template-preview">{t.template.substring(0, 100)}...</pre>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pe-empty">No templates found.</div>
                )}
              </div>
            )}

            {tab !== 'templates' && (
              <button className="pe-action-btn" onClick={execute} disabled={loading || (tab === 'generate' && !goal) || (tab === 'optimize' && !existingPrompt) || (tab === 'debug' && !existingPrompt)}>
                {loading ? <><Loader2 size={16} className="spin" /> Processing...</> : `🪄 Run Prompt Engine`}
              </button>
            )}
          </div>
        </div>

        {/* Output panel */}
        <div className="pe-panel">
          <div className="pe-panel-title">Result Output</div>

          <div className="pe-output-box">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="pe-loader"><Loader2 size={32} className="spin" /><p>Engineering prompt with AI...</p></div>
              ) : result ? (
                <motion.div className="pe-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  {/* GENERATE RESULT */}
                  {tab === 'generate' && result.generatedPrompt && (
                    <div className="pe-result-block">
                      <div className="pe-result-actions">
                        <strong>Copy Optimized Prompt</strong>
                        <button className="pe-icon-btn" onClick={() => navigator.clipboard.writeText(result.generatedPrompt)} title="Copy Prompt"><Copy size={14} /> Copy</button>
                      </div>
                      <pre className="pe-prompt-pre">{result.generatedPrompt}</pre>

                      {result.negativePrompt && (
                        <div className="pe-info-block warning" style={{ marginTop: '12px' }}>
                          <strong>⚠️ Negative Prompt (Midjourney / StableDiffusion)</strong>
                          <pre className="pe-prompt-pre" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>{result.negativePrompt}</pre>
                        </div>
                      )}

                      {result.keyTechniques?.length > 0 && (
                        <div className="pe-techniques">
                          <strong>Engineering Techniques Applied:</strong>
                          <div className="pe-chips">
                            {result.keyTechniques.map(t => <span key={t} className="pe-chip">{t}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* OPTIMIZE RESULT */}
                  {tab === 'optimize' && result.optimizedPrompt && (
                    <div className="pe-result-block">
                      {result.scoreOriginal !== undefined && (
                        <div className="pe-scores-row">
                          <div className="pe-score-item">
                            <span>Original Quality</span>
                            <strong style={{ color: '#ef4444' }}>{result.scoreOriginal}/100</strong>
                          </div>
                          <div className="pe-score-item">
                            <span>Optimized Quality</span>
                            <strong style={{ color: '#22c55e' }}>{result.scoreOptimized}/100</strong>
                          </div>
                        </div>
                      )}

                      <div className="pe-result-actions" style={{ marginTop: '16px' }}>
                        <strong>Optimized Prompt</strong>
                        <button className="pe-icon-btn" onClick={() => navigator.clipboard.writeText(result.optimizedPrompt)}><Copy size={14} /> Copy</button>
                      </div>
                      <pre className="pe-prompt-pre">{result.optimizedPrompt}</pre>

                      {result.improvements?.length > 0 && (
                        <div className="pe-improvements-list">
                          <strong>Improvements Made:</strong>
                          {result.improvements.map((imp, i) => (
                            <div key={i} className="pe-improvement-card">
                              <span className="pe-imp-what">🔧 {imp.what}</span>
                              <p className="pe-imp-why">{imp.why}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DEBUG RESULT */}
                  {tab === 'debug' && result.debuggedPrompt && (
                    <div className="pe-result-block">
                      <div className="pe-diagnosis">
                        <strong>Diagnosis Report</strong>
                        <p>{result.diagnosis}</p>
                      </div>

                      <div className="pe-result-actions" style={{ marginTop: '16px' }}>
                        <strong>Corrected Prompt</strong>
                        <button className="pe-icon-btn" onClick={() => navigator.clipboard.writeText(result.debuggedPrompt)}><Copy size={14} /> Copy</button>
                      </div>
                      <pre className="pe-prompt-pre">{result.debuggedPrompt}</pre>

                      {result.issues?.length > 0 && (
                        <div className="pe-issues-list">
                          <strong>Detected Prompt Issues:</strong>
                          {result.issues.map((iss, i) => (
                            <div key={i} className="pe-issue-card">
                              <div className="pe-issue-hdr">
                                <span className={`pe-sev-badge ${iss.severity}`}>{iss.severity}</span>
                                <strong>{iss.issue}</strong>
                              </div>
                              <p className="pe-issue-fix">💡 Fix: {iss.fix}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="pe-placeholder">
                  <Wand2 size={40} />
                  <p>Your AI-optimized prompt will render here. Choose a mode on the left to start.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .pe-page { padding: 0; max-width: 1100px; margin: 0 auto; }
        .pe-header { text-align: center; margin-bottom: 28px; }
        .pe-badge { display: inline-block; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .pe-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #fde68a, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
        .pe-sub { color: var(--text-secondary, #94a3b8); font-size: 14px; }
        .pe-tabs { display: flex; gap: 8px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap; }
        .pe-tab { background: var(--card-bg, rgba(255, 255, 255, 0.04)); border: 1px solid var(--border, rgba(255, 255, 255, 0.08)); border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--text-secondary, #94a3b8); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .pe-tab.active { background: rgba(245, 158, 11, 0.12); color: #fbbf24; border-color: rgba(245, 158, 11, 0.4); }
        .pe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .pe-panel { background: var(--card-bg, rgba(255, 255, 255, 0.03)); border: 1px solid var(--border, rgba(255, 255, 255, 0.07)); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; height: 100%; min-height: 480px; }
        .pe-panel-title { font-size: 14px; font-weight: 700; color: #fbbf24; margin-bottom: 12px; }
        .pe-fields { display: flex; flex-direction: column; gap: 14px; flex: 1; }
        .pe-field-group { display: flex; flex-direction: column; gap: 6px; }
        .pe-field-group label { font-size: 11px; font-weight: 700; color: var(--text-secondary, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px; }
        .pe-field-group textarea, .pe-field-group select, .pe-field-group input { background: var(--input-bg, rgba(255,255,255,0.05)); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; padding: 10px; color: var(--text, #f1f5f9); font-size: 13px; outline: none; }
        .pe-field-group textarea { resize: none; }
        .pe-action-btn { background: linear-gradient(135deg, #d97706, #b45309); border: none; border-radius: 10px; padding: 12px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; margin-top: auto; }
        .pe-output-box { flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.15); border-radius: 10px; padding: 16px; overflow-y: auto; }
        .pe-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; }
        .pe-loader p { font-size: 13px; margin: 0; }
        .pe-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; text-align: center; }
        .pe-placeholder p { font-size: 13px; max-width: 240px; margin: 0; }
        .pe-result { display: flex; flex-direction: column; height: 100%; }
        .pe-result-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .pe-icon-btn { background: rgba(255,255,255,0.06); border: none; border-radius: 6px; padding: 5px 10px; color: var(--text-secondary, #94a3b8); cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 12px; }
        .pe-icon-btn:hover { background: rgba(255,255,255,0.1); color: var(--text, #f1f5f9); }
        .pe-prompt-pre { background: rgba(0,0,0,0.25); border: 1px solid var(--border, rgba(255,255,255,0.06)); border-radius: 8px; padding: 14px; font-size: 12px; font-family: monospace; white-space: pre-wrap; word-break: break-all; margin: 0; line-height: 1.5; color: #fbbf24; max-height: 300px; overflow-y: auto; }
        .pe-techniques { margin-top: 16px; }
        .pe-techniques strong { font-size: 12px; display: block; margin-bottom: 6px; color: var(--text-secondary, #94a3b8); }
        .pe-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .pe-chip { background: rgba(245, 158, 11, 0.15); color: #fbbf24; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
        
        .pe-scores-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .pe-score-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 10px; text-align: center; }
        .pe-score-item span { font-size: 10px; color: var(--text-secondary, #64748b); text-transform: uppercase; display: block; margin-bottom: 4px; }
        .pe-score-item strong { font-size: 18px; }

        .pe-improvements-list { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
        .pe-improvements-list strong { font-size: 12px; display: block; color: var(--text-secondary, #94a3b8); }
        .pe-improvement-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 10px; }
        .pe-imp-what { font-size: 12px; font-weight: 700; color: #fbbf24; }
        .pe-imp-why { font-size: 12px; color: var(--text-secondary, #94a3b8); margin: 4px 0 0; }

        .pe-diagnosis { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 8px; padding: 12px; }
        .pe-diagnosis strong { font-size: 12px; display: block; color: #ef4444; margin-bottom: 4px; }
        .pe-diagnosis p { margin: 0; font-size: 12px; color: var(--text-secondary, #94a3b8); line-height: 1.5; }

        .pe-issues-list { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
        .pe-issues-list strong { font-size: 12px; display: block; color: var(--text-secondary, #94a3b8); }
        .pe-issue-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 10px; }
        .pe-issue-hdr { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 4px; }
        .pe-sev-badge { font-size: 9px; text-transform: uppercase; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
        .pe-sev-badge.high { background: rgba(239,68,68,0.15); color: #ef4444; }
        .pe-sev-badge.medium { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .pe-sev-badge.low { background: rgba(99,102,241,0.15); color: #818cf8; }
        .pe-issue-fix { font-size: 12px; color: #22c55e; margin: 0; }

        .pe-templates-list { display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; max-height: 380px; }
        .pe-template-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s; }
        .pe-template-card:hover { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.3); }
        .pe-template-emoji { font-size: 20px; }
        .pe-template-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
        .pe-template-info strong { font-size: 13px; }
        .pe-template-preview { font-size: 10px; color: var(--text-secondary, #64748b); margin: 0; font-family: monospace; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
      </main>
    </div>
  );
}
