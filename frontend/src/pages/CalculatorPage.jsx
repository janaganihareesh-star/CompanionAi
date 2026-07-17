import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Loader2, Play, CheckCircle2, XCircle, Info, HelpCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const TYPES = [
  { key: 'solve', label: 'Solve Problem', icon: '📝', desc: 'Step-by-step problem solver' },
  { key: 'formula', label: 'Explain Formula', icon: '📐', desc: 'Formula explanation and parameters' },
  { key: 'practice', label: 'Practice Arena', icon: '🎯', desc: 'AI practice problems & MCQs' }
];

const PROBLEM_CATEGORIES = [
  { key: 'aptitude', label: 'Aptitude & Logic' },
  { key: 'engineering', label: 'Engineering Math' },
  { key: 'statistics', label: 'Statistics & Probability' },
  { key: 'finance', label: 'Finance & Interest' },
  { key: 'general', label: 'General Mathematics' }
];

export default function CalculatorPage() {
  const [tab, setTab] = useState('solve');
  const [problem, setProblem] = useState('');
  const [category, setCategory] = useState('general');
  const [formula, setFormula] = useState('');
  const [practiceTopic, setPracticeTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [practiceCount, setPracticeCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Practice specific state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showSolutions, setShowSolutions] = useState({});

  const token = localStorage.getItem('closer-token');

  const run = async () => {
    setLoading(true);
    setResult(null);
    setSelectedAnswers({});
    setShowSolutions({});
    try {
      let endpoint = '/api/calculate';
      let payload = { showSteps: true };

      if (tab === 'solve') {
        payload = { ...payload, problem, type: category };
      } else if (tab === 'formula') {
        endpoint = '/api/calculate/formula';
        payload = { formula };
      } else if (tab === 'practice') {
        endpoint = '/api/calculate/practice';
        payload = { topic: practiceTopic, difficulty, count: practiceCount, type: category };
      }

      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Calculation failed. Ensure backend and Gemini config are active.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx, opt) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: opt }));
  };

  const handleToggleSolution = (qIdx) => {
    setShowSolutions(prev => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="cal-page">
      <div className="cal-header">
        <div className="cal-badge">🧮 Math Solver</div>
        <h1 className="cal-title">AI Calculation & Formula Engine</h1>
        <p className="cal-sub">Solve complex engineering mathematics, logic aptitude, financial interest, or revise formulas</p>
      </div>

      {/* Tabs */}
      <div className="cal-tabs">
        {TYPES.map(t => (
          <button key={t.key} className={`cal-tab ${tab === t.key ? 'active' : ''}`} onClick={() => { setTab(t.key); setResult(null); }}>
            <span className="cal-tab-emoji">{t.icon}</span>
            <div>
              <strong>{t.label}</strong>
              <span>{t.desc}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="cal-grid">
        {/* Input panel */}
        <div className="cal-panel">
          <div className="cal-panel-title">Inputs</div>
          <div className="cal-fields">

            {tab === 'solve' && (
              <>
                <div className="cal-field-group">
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {PROBLEM_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div className="cal-field-group">
                  <label>Math / Logic Problem</label>
                  <textarea rows={6} value={problem} onChange={e => setProblem(e.target.value)} placeholder="e.g. Find the general solution of the differential equation: dy/dx + 2y = e^-x or A train crosses a platform in 20 seconds..." />
                </div>
              </>
            )}

            {tab === 'formula' && (
              <div className="cal-field-group">
                <label>Mathematical Formula</label>
                <input value={formula} onChange={e => setFormula(e.target.value)} placeholder="e.g. quadratic formula, standard deviation, black-scholes..." />
              </div>
            )}

            {tab === 'practice' && (
              <>
                <div className="cal-field-group">
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {PROBLEM_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div className="cal-field-group">
                  <label>Topic Name</label>
                  <input value={practiceTopic} onChange={e => setPracticeTopic(e.target.value)} placeholder="e.g. Permutations, Integration by Parts, Compound Interest..." />
                </div>
                <div className="cal-field-group">
                  <label>Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option value="easy">Easy / Foundational</option>
                    <option value="medium">Medium / Intermediate</option>
                    <option value="hard">Hard / Advanced</option>
                  </select>
                </div>
                <div className="cal-field-group">
                  <label>Number of Questions</label>
                  <input type="number" min={3} max={10} value={practiceCount} onChange={e => setPracticeCount(Number(e.target.value))} />
                </div>
              </>
            )}

            <button className="cal-action-btn" onClick={run} disabled={loading || (tab === 'solve' && !problem) || (tab === 'formula' && !formula) || (tab === 'practice' && !practiceTopic)}>
              {loading ? <><Loader2 size={16} className="spin" /> Calculating...</> : '🚀 Run Calculations'}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="cal-panel">
          <div className="cal-panel-title">Calculation Details</div>
          <div className="cal-output-box">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="cal-loader"><Loader2 size={32} className="spin" /><p>Processing equations and variables...</p></div>
              ) : result ? (
                <motion.div className="cal-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  {/* SOLVE PROBLEM OUTPUT */}
                  {tab === 'solve' && (
                    <div className="cal-result-block">
                      <div className="cal-formula-badge">🧮 Formula: <span>{result.formula || 'General Derivation'}</span></div>
                      
                      <div className="cal-steps-timeline">
                        <strong>Step-by-Step Solution:</strong>
                        {result.steps?.map((step) => (
                          <div key={step.stepNumber} className="cal-step-node">
                            <span className="cal-step-num">{step.stepNumber}</span>
                            <div className="cal-step-body">
                              <p className="cal-step-desc">{step.description}</p>
                              {step.calculation && <pre className="cal-step-calc">{step.calculation}</pre>}
                              {step.result && <span className="cal-step-res">Result: {step.result}</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="cal-answer-card">
                        <span>Final Answer</span>
                        <strong>{result.finalAnswer}</strong>
                      </div>

                      {result.verification && <p className="cal-note"><strong>Verification:</strong> {result.verification}</p>}
                      {result.alternateMethod && <p className="cal-note"><strong>Alternative Method:</strong> {result.alternateMethod}</p>}
                    </div>
                  )}

                  {/* EXPLAIN FORMULA OUTPUT */}
                  {tab === 'formula' && (
                    <div className="cal-result-block">
                      <h3 className="cal-formula-name">{result.name}</h3>
                      <p className="cal-formula-exp">{result.explanation}</p>

                      {result.variables?.length > 0 && (
                        <div className="cal-vars-table">
                          <strong>Variables Breakdown:</strong>
                          <table>
                            <thead>
                              <tr>
                                <th>Symbol</th>
                                <th>Meaning</th>
                                <th>Unit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.variables.map((v, i) => (
                                <tr key={i}>
                                  <td style={{ fontWeight: 700, color: '#f59e0b' }}>{v.symbol}</td>
                                  <td>{v.meaning}</td>
                                  <td style={{ color: '#94a3b8' }}>{v.unit || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {result.when_to_use && <p className="cal-note" style={{ marginTop: 12 }}><strong>When to use:</strong> {result.when_to_use}</p>}
                      {result.derivation && <p className="cal-note"><strong>Derivation Context:</strong> {result.derivation}</p>}
                    </div>
                  )}

                  {/* PRACTICE ARENA OUTPUT */}
                  {tab === 'practice' && result.problems && (
                    <div className="cal-practice-list">
                      {result.problems.map((prob, qIdx) => {
                        const isCorrect = selectedAnswers[qIdx] === prob.correctAnswer;
                        const isSelected = selectedAnswers[qIdx] !== undefined;

                        return (
                          <div key={qIdx} className="cal-practice-card">
                            <div className="cal-practice-header">
                              <span>Problem {qIdx + 1}</span>
                              <span className="cal-practice-time">⏱ {prob.timeLimit || '2 min'}</span>
                            </div>
                            <p className="cal-practice-q"><strong>{prob.question}</strong></p>

                            <div className="cal-practice-opts">
                              {prob.options?.map((opt, oIdx) => {
                                const optLetter = String.fromCharCode(65 + oIdx); // A, B, C, D
                                const isThisSelected = selectedAnswers[qIdx] === opt;
                                const isThisCorrect = opt === prob.correctAnswer;

                                return (
                                  <button
                                    key={oIdx}
                                    className={`cal-practice-opt ${isThisSelected ? 'selected' : ''} ${isSelected && isThisCorrect ? 'correct' : ''} ${isThisSelected && !isThisCorrect ? 'incorrect' : ''}`}
                                    onClick={() => !isSelected && handleSelectOption(qIdx, opt)}
                                    disabled={isSelected}
                                  >
                                    <span>{optLetter}.</span> {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {isSelected && (
                              <div className="cal-practice-feedback">
                                <div className="flex items-center gap-2">
                                  {isCorrect ? <CheckCircle2 size={16} className="text-emerald" /> : <XCircle size={16} className="text-rose" />}
                                  <span className={isCorrect ? 'text-emerald' : 'text-rose'}>
                                    {isCorrect ? 'Correct Answer!' : `Incorrect! Correct: ${prob.correctAnswer}`}
                                  </span>
                                </div>
                                <button className="cal-solution-toggle" onClick={() => handleToggleSolution(qIdx)}>
                                  {showSolutions[qIdx] ? 'Hide Steps' : 'Show step-by-step Solution'}
                                </button>

                                <AnimatePresence>
                                  {showSolutions[qIdx] && (
                                    <motion.div className="cal-practice-sol" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                      <strong>Explanation:</strong>
                                      <p>Formula used: {prob.formula}</p>
                                      <ul>
                                        {prob.solution?.steps?.map((step, sIdx) => <li key={sIdx}>{step}</li>)}
                                      </ul>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="cal-placeholder">
                  <Calculator size={40} />
                  <p>Step-by-step math solver or practice questions will render here.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .cal-page { padding: 0; max-width: 1100px; margin: 0 auto; }
        .cal-header { text-align: center; margin-bottom: 28px; }
        .cal-badge { display: inline-block; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .cal-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #fef08a, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
        .cal-sub { color: var(--text-secondary, #94a3b8); font-size: 14px; }
        .cal-tabs { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 24px; }
        .cal-tab { background: var(--card-bg, rgba(255,255,255,0.03)); border: 1px solid var(--border, rgba(255,255,255,0.06)); border-radius: 12px; padding: 12px; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
        .cal-tab:hover { border-color: rgba(245, 158, 11, 0.3); }
        .cal-tab.active { background: rgba(245, 158, 11, 0.1); border-color: #f59e0b; }
        .cal-tab-emoji { font-size: 20px; }
        .cal-tab strong { display: block; font-size: 13px; color: var(--text, #f1f5f9); }
        .cal-tab span { display: block; font-size: 10px; color: var(--text-secondary, #64748b); }
        
        .cal-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; }
        .cal-panel { background: var(--card-bg, rgba(255, 255, 255, 0.03)); border: 1px solid var(--border, rgba(255, 255, 255, 0.07)); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; min-height: 440px; }
        .cal-panel-title { font-size: 14px; font-weight: 700; color: #f59e0b; margin-bottom: 12px; }
        .cal-fields { display: flex; flex-direction: column; gap: 14px; flex: 1; }
        .cal-field-group { display: flex; flex-direction: column; gap: 6px; }
        .cal-field-group label { font-size: 11px; font-weight: 700; color: var(--text-secondary, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px; }
        .cal-field-group textarea, .cal-field-group select, .cal-field-group input { background: var(--input-bg, rgba(255,255,255,0.05)); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; padding: 10px; color: var(--text, #f1f5f9); font-size: 13px; outline: none; }
        
        .cal-action-btn { background: linear-gradient(135deg, #d97706, #b45309); border: none; border-radius: 10px; padding: 12px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; margin-top: auto; }
        .cal-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .cal-output-box { flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.15); border-radius: 10px; padding: 16px; overflow-y: auto; max-height: 500px; }
        .cal-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; }
        .cal-loader p { font-size: 13px; margin: 0; }
        .cal-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; text-align: center; }
        .cal-placeholder p { font-size: 13px; max-width: 240px; margin: 0; }
        
        .cal-result-block { display: flex; flex-direction: column; gap: 14px; }
        .cal-formula-badge { font-size: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; }
        .cal-formula-badge span { color: #f59e0b; font-weight: 700; font-family: monospace; }
        
        .cal-steps-timeline { display: flex; flex-direction: column; gap: 12px; }
        .cal-steps-timeline strong { font-size: 13px; color: var(--text-secondary, #cbd5e1); display: block; margin-bottom: 4px; }
        .cal-step-node { display: flex; gap: 12px; border-left: 2px dashed rgba(245, 158, 11, 0.2); padding-left: 14px; position: relative; margin-left: 6px; }
        .cal-step-num { position: absolute; left: -9px; top: 0; width: 16px; height: 16px; background: #f59e0b; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
        .cal-step-body { flex: 1; font-size: 13px; }
        .cal-step-desc { margin: 0 0 6px; line-height: 1.4; color: var(--text, #cbd5e1); }
        .cal-step-calc { background: rgba(0,0,0,0.2); font-family: monospace; font-size: 11px; padding: 6px 10px; border-radius: 6px; color: #fde68a; margin: 0 0 6px; overflow-x: auto; }
        .cal-step-res { font-size: 11px; font-weight: 700; color: #22c55e; }
        
        .cal-answer-card { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; align-items: center; margin-top: 14px; }
        .cal-answer-card span { font-size: 11px; text-transform: uppercase; color: #fbbf24; font-weight: 700; }
        .cal-answer-card strong { font-size: 20px; color: #22c55e; }
        .cal-note { font-size: 12px; color: var(--text-secondary, #94a3b8); margin: 0; line-height: 1.4; }
        
        .cal-formula-name { font-size: 16px; font-weight: 800; color: #f59e0b; margin: 0 0 6px; }
        .cal-formula-exp { font-size: 13px; line-height: 1.5; color: var(--text-secondary, #cbd5e1); margin: 0 0 16px; }
        
        .cal-vars-table strong { font-size: 12px; display: block; margin-bottom: 6px; }
        .cal-vars-table table { width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; }
        .cal-vars-table th { background: rgba(0,0,0,0.2); padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .cal-vars-table td { padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.01); }
        
        .cal-practice-list { display: flex; flex-direction: column; gap: 16px; }
        .cal-practice-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; }
        .cal-practice-header { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-secondary, #64748b); text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 6px; margin-bottom: 10px; }
        .cal-practice-q { font-size: 13px; margin: 0 0 12px; line-height: 1.4; }
        .cal-practice-opts { display: grid; grid-template-columns: 1fr; gap: 6px; }
        .cal-practice-opt { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 12px; font-size: 12px; text-align: left; cursor: pointer; color: var(--text, #cbd5e1); transition: all 0.2s; }
        .cal-practice-opt span { font-weight: 700; color: #f59e0b; margin-right: 6px; }
        .cal-practice-opt:hover { background: rgba(255,255,255,0.06); }
        .cal-practice-opt.selected { border-color: #f59e0b; background: rgba(245, 158, 11, 0.08); }
        .cal-practice-opt.correct { background: rgba(34, 197, 94, 0.15); border-color: #22c55e; color: #22c55e; }
        .cal-practice-opt.incorrect { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #ef4444; }
        
        .cal-practice-feedback { margin-top: 12px; font-size: 12px; display: flex; flex-direction: column; gap: 8px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; }
        .cal-solution-toggle { background: none; border: none; font-size: 11px; font-weight: 600; color: #fbbf24; cursor: pointer; text-align: left; padding: 0; width: fit-content; text-decoration: underline; }
        .cal-practice-sol { border-top: 1px solid rgba(255,255,255,0.04); margin-top: 8px; padding-top: 8px; color: var(--text-secondary, #94a3b8); }
        .cal-practice-sol strong { display: block; color: var(--text, #cbd5e1); margin-bottom: 4px; }
        .cal-practice-sol ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
        .text-emerald { color: #22c55e; }
        .text-rose { color: #ef4444; }
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
      </main>
    </div>
  );
}
