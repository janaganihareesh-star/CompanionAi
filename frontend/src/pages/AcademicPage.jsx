import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Loader2, Copy, BookOpen, Presentation, HelpCircle, FileText, Check } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const MODES = [
  { key: 'assignment', label: 'Assignment Helper', icon: <BookOpen size={16} />, desc: 'Research assignments & papers' },
  { key: 'report', label: 'Report Writer', icon: <FileText size={16} />, desc: 'Project or seminar reports' },
  { key: 'ppt', label: 'PPT slide Content', icon: <Presentation size={16} />, desc: 'Slide structures & notes' },
  { key: 'viva', label: 'Viva Voce Prep', icon: <HelpCircle size={16} />, desc: 'Subject specific exam questions' }
];

const LEVELS = [
  { key: 'high-school', label: 'High School / Intermediate' },
  { key: 'undergraduate', label: 'Undergraduate (UG)' },
  { key: 'graduate', label: 'Postgraduate (PG)' },
  { key: 'phd', label: 'Doctoral / Research' }
];

export default function AcademicPage() {
  const [activeMode, setActiveMode] = useState('assignment');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState(1000);
  const [level, setLevel] = useState('undergraduate');
  const [includeReferences, setIncludeReferences] = useState(true);
  const [reportType, setReportType] = useState('project'); // 'project' | 'seminar'
  const [slideCount, setSlideCount] = useState(10);
  const [audience, setAudience] = useState('students');
  const [questionCount, setQuestionCount] = useState(15);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedViva, setExpandedViva] = useState({});
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem('closer-token');

  const execute = async () => {
    setLoading(true);
    setResult(null);
    setExpandedViva({});
    try {
      let endpoint = `/api/academic/${activeMode}`;
      let payload = { level, language: 'English' };

      if (activeMode === 'assignment') {
        payload = { ...payload, subject, topic, wordCount, includeReferences };
      } else if (activeMode === 'report') {
        payload = { ...payload, type: reportType, subject, topic };
      } else if (activeMode === 'ppt') {
        endpoint = '/api/academic/ppt';
        payload = { ...payload, topic, slideCount, audience };
      } else if (activeMode === 'viva') {
        endpoint = '/api/academic/viva';
        payload = { ...payload, subject, topic, count: questionCount };
      }

      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Academic generation failed. Ensure backend and APIs are working.');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleVivaAnswer = (index) => {
    setExpandedViva(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="ac-page">
      <div className="ac-header">
        <div className="ac-badge">🎓 Academic Engine</div>
        <h1 className="ac-title">AI Academic Assistant</h1>
        <p className="ac-sub">Generate assignments, structure seminar reports, plan slides, or prep for viva voce exams</p>
      </div>

      {/* Modes tab */}
      <div className="ac-modes">
        {MODES.map(m => (
          <button key={m.key} className={`ac-mode-btn ${activeMode === m.key ? 'active' : ''}`} onClick={() => { setActiveMode(m.key); setResult(null); }}>
            {m.icon}
            <div>
              <strong>{m.label}</strong>
              <span>{m.desc}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="ac-grid">
        {/* Input panel */}
        <div className="ac-panel">
          <div className="ac-panel-title">Academic Details</div>
          <div className="ac-fields">
            
            <div className="ac-field-group">
              <label>Education Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)}>
                {LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
            </div>

            {activeMode !== 'ppt' && (
              <div className="ac-field-group">
                <label>Subject / Branch</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Computer Science, Mechanical Engineering..." />
              </div>
            )}

            <div className="ac-field-group">
              <label>Topic / Title</label>
              <textarea rows={3} value={topic} onChange={e => setTopic(e.target.value)} placeholder="Provide specific topic details for high-quality generation..." />
            </div>

            {/* Mode specific configs */}
            {activeMode === 'assignment' && (
              <>
                <div className="ac-field-group">
                  <label>Target Word Count ({wordCount} words)</label>
                  <input type="range" min={300} max={2500} step={100} value={wordCount} onChange={e => setWordCount(Number(e.target.value))} />
                </div>
                <div className="ac-checkbox-group">
                  <input type="checkbox" id="includeRefs" checked={includeReferences} onChange={e => setIncludeReferences(e.target.checked)} />
                  <label htmlFor="includeRefs">Include APA Citations & References</label>
                </div>
              </>
            )}

            {activeMode === 'report' && (
              <div className="ac-field-group">
                <label>Report Format Type</label>
                <select value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option value="project">Major Project / Thesis Report</option>
                  <option value="seminar">Technical Seminar Report</option>
                </select>
              </div>
            )}

            {activeMode === 'ppt' && (
              <>
                <div className="ac-field-group">
                  <label>Audience Style</label>
                  <select value={audience} onChange={e => setAudience(e.target.value)}>
                    <option value="students">Classroom / Students</option>
                    <option value="professors">Faculty / Panel Jury</option>
                    <option value="corporate">Corporate / Industrial</option>
                  </select>
                </div>
                <div className="ac-field-group">
                  <label>Slide Count ({slideCount} slides)</label>
                  <input type="number" min={5} max={20} value={slideCount} onChange={e => setSlideCount(Number(e.target.value))} />
                </div>
              </>
            )}

            {activeMode === 'viva' && (
              <div className="ac-field-group">
                <label>Number of Viva Questions ({questionCount})</label>
                <input type="number" min={5} max={30} value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} />
              </div>
            )}

            <button className="ac-generate-btn" onClick={execute} disabled={loading || !topic || (activeMode !== 'ppt' && !subject)}>
              {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : '🚀 Compile Academic Sheet'}
            </button>
          </div>
        </div>

        {/* Preview Output */}
        <div className="ac-panel">
          <div className="ac-panel-title">Output Preview</div>
          <div className="ac-output-box">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="ac-loader"><Loader2 size={32} className="spin" /><p>Analyzing databases & references...</p></div>
              ) : result ? (
                <motion.div className="ac-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  {/* ASSIGNMENT OUTPUT */}
                  {activeMode === 'assignment' && (
                    <div className="ac-result-block">
                      <div className="ac-result-header">
                        <div>
                          <h3 className="ac-result-title">{result.title}</h3>
                          <span className="ac-meta">Estimated Word Count: {result.wordCount} words</span>
                        </div>
                        <button className="ac-copy-btn" onClick={() => copy(result.content)}>
                          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      
                      {result.abstract && (
                        <div className="ac-abstract">
                          <strong>Abstract</strong>
                          <p>{result.abstract}</p>
                        </div>
                      )}

                      <div className="ac-markdown-view">
                        <pre className="ac-pre">{result.content}</pre>
                      </div>

                      {result.references?.length > 0 && (
                        <div className="ac-references">
                          <strong>Academic References (APA Format):</strong>
                          <ul>
                            {result.references.map((ref, idx) => <li key={idx}>{ref}</li>)}
                          </ul>
                        </div>
                      )}

                      {result.plagiarismTip && (
                        <div className="ac-tip-box">
                          💡 <strong>Plagiarism Prevention Tip:</strong> {result.plagiarismTip}
                        </div>
                      )}
                    </div>
                  )}

                  {/* REPORT OUTPUT */}
                  {activeMode === 'report' && (
                    <div className="ac-result-block">
                      <div className="ac-result-header">
                        <h3 className="ac-result-title">{result.title}</h3>
                        <button className="ac-copy-btn" onClick={() => copy(result.formattedText || JSON.stringify(result.sections, null, 2))}><Copy size={14} /> Copy</button>
                      </div>

                      {result.abstract && (
                        <div className="ac-abstract">
                          <strong>Report Abstract:</strong>
                          <p>{result.abstract}</p>
                        </div>
                      )}

                      <div className="ac-report-sections">
                        {(result.sections || []).map((sec, i) => (
                          <div key={i} className="ac-report-sec">
                            <h4>{sec.title || sec.heading}</h4>
                            <p>{sec.content}</p>
                          </div>
                        ))}
                      </div>

                      {result.references?.length > 0 && (
                        <div className="ac-references" style={{ marginTop: '16px' }}>
                          <strong>References:</strong>
                          <ul>
                            {result.references.map((ref, i) => <li key={i}>{ref}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PPT SLIDES OUTPUT */}
                  {activeMode === 'ppt' && (
                    <div className="ac-ppt-view">
                      <div className="ac-result-header" style={{ marginBottom: '16px' }}>
                        <div>
                          <h3 className="ac-result-title">{result.title}</h3>
                          <span className="ac-meta">Theme: {result.theme} | Slides: {result.totalSlides}</span>
                        </div>
                        <button className="ac-copy-btn" onClick={() => copy(JSON.stringify(result.slides, null, 2))}><Copy size={14} /> Copy Specs</button>
                      </div>

                      <div className="ac-slides-list">
                        {(result.slides || []).map((slide, i) => (
                          <div key={i} className="ac-slide-card">
                            <div className="ac-slide-hdr">
                              <span>Slide {slide.slideNumber}</span>
                              <span className="ac-slide-type">{slide.type}</span>
                            </div>
                            <h4 className="ac-slide-title">{slide.title}</h4>
                            <ul className="ac-slide-bullets">
                              {slide.bullets?.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                            </ul>
                            {slide.visualSuggestion && <p className="ac-slide-vis">🎨 <strong>Visual:</strong> {slide.visualSuggestion}</p>}
                            {slide.speakerNotes && <p className="ac-slide-notes">🗣️ <strong>Speaker Notes:</strong> {slide.speakerNotes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VIVA QUESTIONS OUTPUT */}
                  {activeMode === 'viva' && (
                    <div className="ac-viva-view">
                      <div className="ac-result-header" style={{ marginBottom: '16px' }}>
                        <div>
                          <h3 className="ac-result-title">Viva Voce Q&A Prep</h3>
                          <span className="ac-meta">Revision Topics: {result.keyTopicsToRevise?.join(', ')}</span>
                        </div>
                      </div>

                      <div className="ac-viva-list">
                        {(result.questions || []).map((q, i) => (
                          <div key={i} className="ac-viva-card">
                            <div className="ac-viva-question-row" onClick={() => toggleVivaAnswer(i)}>
                              <strong>Q{i + 1}. {q.question}</strong>
                              <span className={`ac-viva-difficulty ${q.difficulty}`}>{q.difficulty}</span>
                            </div>
                            <AnimatePresence>
                              {expandedViva[i] && (
                                <motion.div className="ac-viva-answer-box" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                  <p><strong>Answer:</strong> {q.expectedAnswer}</p>
                                  {q.followUp && <p className="ac-viva-followup">🎯 Follow-up hint: {q.followUp}</p>}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>

                      {result.examTips?.length > 0 && (
                        <div className="ac-tip-box" style={{ marginTop: '20px' }}>
                          <strong>📋 Faculty Exam Tips:</strong>
                          <ul>
                            {result.examTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="ac-placeholder">
                  <GraduationCap size={40} />
                  <p>Generated academic layouts will render here. Complete the fields to the left.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .ac-page { padding: 0; max-width: 1200px; margin: 0 auto; }
        .ac-header { text-align: center; margin-bottom: 28px; }
        .ac-badge { display: inline-block; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .ac-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #a7f3d0, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
        .ac-sub { color: var(--text-secondary, #94a3b8); font-size: 14px; }
        .ac-modes { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 24px; }
        .ac-mode-btn { background: var(--card-bg, rgba(255,255,255,0.03)); border: 1px solid var(--border, rgba(255,255,255,0.06)); border-radius: 12px; padding: 12px; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
        .ac-mode-btn:hover { border-color: rgba(16, 185, 129, 0.3); }
        .ac-mode-btn.active { background: rgba(16, 185, 129, 0.1); border-color: #10b981; }
        .ac-mode-btn strong { display: block; font-size: 13px; color: var(--text, #f1f5f9); }
        .ac-mode-btn span { display: block; font-size: 10px; color: var(--text-secondary, #64748b); }
        
        .ac-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; }
        .ac-panel { background: var(--card-bg, rgba(255, 255, 255, 0.03)); border: 1px solid var(--border, rgba(255, 255, 255, 0.07)); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; min-height: 480px; }
        .ac-panel-title { font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 12px; }
        .ac-fields { display: flex; flex-direction: column; gap: 14px; flex: 1; }
        .ac-field-group { display: flex; flex-direction: column; gap: 6px; }
        .ac-field-group label { font-size: 11px; font-weight: 700; color: var(--text-secondary, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px; }
        .ac-field-group textarea, .ac-field-group select, .ac-field-group input { background: var(--input-bg, rgba(255,255,255,0.05)); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; padding: 10px; color: var(--text, #f1f5f9); font-size: 13px; outline: none; }
        
        .ac-checkbox-group { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
        .ac-checkbox-group input { cursor: pointer; }
        .ac-checkbox-group label { font-size: 12px; color: var(--text-secondary, #cbd5e1); cursor: pointer; }
        
        .ac-generate-btn { background: linear-gradient(135deg, #059669, #047857); border: none; border-radius: 10px; padding: 12px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; margin-top: auto; }
        .ac-generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .ac-output-box { flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.15); border-radius: 10px; padding: 16px; overflow-y: auto; max-height: 520px; }
        .ac-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; }
        .ac-loader p { font-size: 13px; margin: 0; }
        .ac-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; text-align: center; }
        .ac-placeholder p { font-size: 13px; max-width: 240px; margin: 0; }
        
        .ac-result-block { display: flex; flex-direction: column; gap: 14px; }
        .ac-result-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; }
        .ac-result-title { font-size: 16px; font-weight: 800; color: #10b981; margin: 0; }
        .ac-meta { font-size: 11px; color: var(--text-secondary, #94a3b8); margin-top: 4px; display: block; }
        .ac-copy-btn { background: rgba(255,255,255,0.06); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 6px; padding: 6px 12px; font-size: 12px; color: var(--text, #cbd5e1); cursor: pointer; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .ac-copy-btn:hover { background: rgba(16, 185, 129, 0.15); border-color: #10b981; color: #10b981; }
        .ac-abstract { background: rgba(255,255,255,0.02); border-radius: 8px; padding: 12px; font-size: 12px; margin-bottom: 14px; border-left: 3px solid #10b981; }
        .ac-abstract strong { display: block; margin-bottom: 4px; color: #10b981; }
        .ac-abstract p { margin: 0; line-height: 1.5; color: var(--text-secondary, #cbd5e1); }
        .ac-pre { background: rgba(0,0,0,0.25); border: 1px solid var(--border, rgba(255,255,255,0.05)); border-radius: 8px; padding: 14px; font-size: 13px; font-family: monospace; white-space: pre-wrap; word-break: break-all; margin: 0; line-height: 1.6; }
        
        .ac-report-sections { display: flex; flex-direction: column; gap: 14px; }
        .ac-report-sec h4 { font-size: 14px; font-weight: 700; color: #10b981; margin: 0 0 6px; }
        .ac-report-sec p { font-size: 13px; line-height: 1.5; margin: 0; color: var(--text-secondary, #cbd5e1); }
        
        .ac-references { background: rgba(255,255,255,0.02); border-radius: 8px; padding: 12px; font-size: 11px; margin-top: 14px; }
        .ac-references strong { display: block; margin-bottom: 6px; }
        .ac-references ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
        .ac-references li { line-height: 1.4; color: var(--text-secondary, #94a3b8); }
        
        .ac-tip-box { background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 10px 12px; font-size: 12px; }
        
        .ac-slides-list { display: flex; flex-direction: column; gap: 16px; }
        .ac-slide-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; position: relative; }
        .ac-slide-hdr { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary, #64748b); border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 6px; margin-bottom: 10px; }
        .ac-slide-type { color: #10b981; }
        .ac-slide-title { font-size: 15px; font-weight: 700; margin: 0 0 10px; color: #10b981; }
        .ac-slide-bullets { margin: 0 0 12px; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
        .ac-slide-bullets li { font-size: 12px; line-height: 1.4; }
        .ac-slide-vis { font-size: 11px; margin: 0 0 6px; background: rgba(255,255,255,0.02); padding: 6px 8px; border-radius: 6px; color: var(--text-secondary, #94a3b8); }
        .ac-slide-notes { font-size: 11px; margin: 0; background: rgba(16, 185, 129, 0.05); padding: 8px 10px; border-radius: 6px; border-left: 2px solid #10b981; color: var(--text-secondary, #cbd5e1); }
        
        .ac-viva-list { display: flex; flex-direction: column; gap: 10px; }
        .ac-viva-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; overflow: hidden; }
        .ac-viva-question-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; cursor: pointer; transition: background 0.2s; }
        .ac-viva-question-row:hover { background: rgba(255,255,255,0.04); }
        .ac-viva-question-row strong { font-size: 13px; line-height: 1.4; }
        .ac-viva-difficulty { font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; flex-shrink: 0; }
        .ac-viva-difficulty.basic { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .ac-viva-difficulty.intermediate { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .ac-viva-difficulty.advanced { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .ac-viva-answer-box { background: rgba(0,0,0,0.15); padding: 12px; border-top: 1px solid rgba(255,255,255,0.03); font-size: 12px; display: flex; flex-direction: column; gap: 6px; }
        .ac-viva-answer-box p { margin: 0; line-height: 1.4; }
        .ac-viva-followup { color: #f59e0b; font-style: italic; }
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
      </main>
    </div>
  );
}
