import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Loader2, Copy, Rocket, FileText, Presentation, TrendingUp, Users, Check } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const TABS = [
  { key: 'idea', label: 'Startup Ideas', icon: <Rocket size={15} />, desc: 'AI-generated startup concepts' },
  { key: 'plan', label: 'Business Plan', icon: <FileText size={15} />, desc: 'Full business plans & SWOT' },
  { key: 'pitch', label: 'Pitch Deck Content', icon: <Presentation size={15} />, desc: 'Slide layouts & investor script' },
  { key: 'marketing', label: 'Marketing Plan', icon: <TrendingUp size={15} />, desc: 'User persona & calendar funnel' },
  { key: 'competitor', label: 'Competitor Matrix', icon: <Users size={15} />, desc: 'Competitor compare matrix' }
];

export default function BusinessPage() {
  const [tab, setTab] = useState('idea');
  const [domain, setDomain] = useState('technology');
  const [budget, setBudget] = useState('bootstrap');
  const [targetMarket, setTargetMarket] = useState('India');
  const [skills, setSkills] = useState('');
  
  const [businessName, setBusinessName] = useState('');
  const [idea, setIdea] = useState('');
  const [timeline, setTimeline] = useState('1 year');
  const [askAmount, setAskAmount] = useState('$100K');
  const [stage, setStage] = useState('pre-seed');
  
  const [product, setProduct] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [marketingBudget, setMarketingBudget] = useState('₹50,000/month');
  const [channels, setChannels] = useState('social media, SEO');
  
  const [competitors, setCompetitors] = useState('');
  const [industry, setIndustry] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem('closer-token');

  const execute = async () => {
    setLoading(true);
    setResult(null);
    try {
      let endpoint = `/api/business/${tab}`;
      let payload = { language: 'English' };

      if (tab === 'idea') {
        payload = { ...payload, domain, budget, targetMarket, skills };
      } else if (tab === 'plan') {
        payload = { ...payload, businessName, idea, targetMarket, budget, timeline };
      } else if (tab === 'pitch') {
        payload = { ...payload, businessName, idea, askAmount, stage };
      } else if (tab === 'marketing') {
        payload = { ...payload, businessName, product, targetAudience, budget: marketingBudget, channels };
      } else if (tab === 'competitor') {
        payload = { ...payload, businessName, competitors: competitors.split(',').map(c => c.trim()), industry };
      }

      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Business generation failed. Check API config.');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const autoFillIdea = (startup) => {
    setBusinessName(startup.name);
    setIdea(startup.tagline + ' - ' + startup.solution);
    setProduct(startup.name + ' - ' + startup.solution);
    setTargetAudience(startup.targetUsers);
    setTab('plan');
    setResult(null);
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bus-page">
      <div className="bus-header">
        <div className="bus-badge">💼 Business Engine</div>
        <h1 className="bus-title">AI Startup & Business Planner</h1>
        <p className="bus-sub">Scaffold new business concepts, draft feasibility models, or prepare pitch decks for VCs</p>
      </div>

      {/* Tabs */}
      <div className="bus-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`bus-tab ${tab === t.key ? 'active' : ''}`} onClick={() => { setTab(t.key); setResult(null); }}>
            {t.icon}
            <div>
              <strong>{t.label}</strong>
              <span>{t.desc}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bus-grid">
        {/* Form Panel */}
        <div className="bus-panel">
          <div className="bus-panel-title">Business Config</div>
          <div className="bus-fields">
            
            {tab === 'idea' && (
              <>
                <div className="bus-field-group">
                  <label>Business Niche / Domain</label>
                  <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. AI healthcare, EdTech microlearning" />
                </div>
                <div className="bus-field-group">
                  <label>Funding Stage / Budget Style</label>
                  <select value={budget} onChange={e => setBudget(e.target.value)}>
                    <option value="bootstrap">Bootstrap / Zero-Budget</option>
                    <option value="seed">Seed Funding / Small Loan</option>
                    <option value="venture">VC Scale / Series A</option>
                  </select>
                </div>
                <div className="bus-field-group">
                  <label>Target Market Location</label>
                  <input value={targetMarket} onChange={e => setTargetMarket(e.target.value)} placeholder="e.g. India, USA, Global..." />
                </div>
                <div className="bus-field-group">
                  <label>Your Personal Skills (Optional)</label>
                  <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React development, Sales, Graphic Design..." />
                </div>
              </>
            )}

            {(tab === 'plan' || tab === 'pitch') && (
              <>
                <div className="bus-field-group">
                  <label>Business / Startup Name</label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Alpha Meds" />
                </div>
                <div className="bus-field-group">
                  <label>Describe your Startup Idea</label>
                  <textarea rows={4} value={idea} onChange={e => setIdea(e.target.value)} placeholder="What does your startup do? What problem does it solve?..." />
                </div>
              </>
            )}

            {tab === 'plan' && (
              <>
                <div className="bus-field-group">
                  <label>Target Market / Geography</label>
                  <input value={targetMarket} onChange={e => setTargetMarket(e.target.value)} placeholder="e.g. Tier-1 cities in India" />
                </div>
                <div className="bus-field-group">
                  <label>Initial Operating Capital</label>
                  <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. ₹5,00,000" />
                </div>
                <div className="bus-field-group">
                  <label>Break-even Timeline Target</label>
                  <input value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. 12 months" />
                </div>
              </>
            )}

            {tab === 'pitch' && (
              <>
                <div className="bus-field-group">
                  <label>Funding Ask Amount</label>
                  <input value={askAmount} onChange={e => setAskAmount(e.target.value)} placeholder="e.g. $250,000 for 10% equity" />
                </div>
                <div className="bus-field-group">
                  <label>Current Company Stage</label>
                  <select value={stage} onChange={e => setStage(e.target.value)}>
                    <option value="pre-seed">Pre-seed / Idea Stage</option>
                    <option value="mvp">MVP Launched / Alpha Testing</option>
                    <option value="seed">Seed Stage / Early Revenue</option>
                    <option value="growth">Growth Stage / scaling</option>
                  </select>
                </div>
              </>
            )}

            {tab === 'marketing' && (
              <>
                <div className="bus-field-group">
                  <label>Business / Brand Name</label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. CloserAI" />
                </div>
                <div className="bus-field-group">
                  <label>Product / Service description</label>
                  <textarea rows={3} value={product} onChange={e => setProduct(e.target.value)} placeholder="Describe the offering..." />
                </div>
                <div className="bus-field-group">
                  <label>Target Audience Persona</label>
                  <input value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g. GenZ college students, busy professionals..." />
                </div>
                <div className="bus-field-group">
                  <label>Monthly Marketing Budget</label>
                  <input value={marketingBudget} onChange={e => setMarketingBudget(e.target.value)} placeholder="e.g. ₹20,000/month" />
                </div>
                <div className="bus-field-group">
                  <label>Marketing Channels (comma separated)</label>
                  <input value={channels} onChange={e => setChannels(e.target.value)} placeholder="e.g. Instagram, Google Ads, LinkedIn SEO" />
                </div>
              </>
            )}

            {tab === 'competitor' && (
              <>
                <div className="bus-field-group">
                  <label>Your Startup Name</label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Alpha CRM" />
                </div>
                <div className="bus-field-group">
                  <label>Competitors Names (comma separated)</label>
                  <input value={competitors} onChange={e => setCompetitors(e.target.value)} placeholder="e.g. HubSpot, Salesforce, Zoho" />
                </div>
                <div className="bus-field-group">
                  <label>Industry sector</label>
                  <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. SaaS customer relationship management" />
                </div>
              </>
            )}

            <button className="bus-generate-btn" onClick={execute} disabled={loading || (tab === 'idea' && !domain) || (tab === 'plan' && (!businessName || !idea)) || (tab === 'pitch' && (!businessName || !idea)) || (tab === 'marketing' && (!businessName || !product)) || (tab === 'competitor' && (!businessName || !competitors))}>
              {loading ? <><Loader2 size={16} className="spin" /> Generating Plan...</> : '🚀 Build Business Model'}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bus-panel">
          <div className="bus-panel-title">Business Analytics output</div>
          <div className="bus-output-box">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="bus-loader"><Loader2 size={32} className="spin" /><p>Calculating financial projections & SWAT...</p></div>
              ) : result ? (
                <motion.div className="bus-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  {/* STARTUP IDEAS OUTPUT */}
                  {result.ideas && (
                    <div className="bus-ideas-list">
                      {result.ideas.map((startup, idx) => (
                        <div key={idx} className="bus-idea-card">
                          <div className="bus-idea-hdr">
                            <h4>{startup.name}</h4>
                            <span className={`bus-risk-badge ${startup.riskLevel}`}>{startup.riskLevel} risk</span>
                          </div>
                          <p className="bus-idea-tagline"><strong>Elevator Pitch:</strong> {startup.tagline}</p>
                          <p className="bus-idea-text"><strong>Problem:</strong> {startup.problem}</p>
                          <p className="bus-idea-text"><strong>Solution:</strong> {startup.solution}</p>
                          
                          <div className="bus-idea-grid-meta">
                            <div><span>Revenue Model:</span> {startup.revenueModel}</div>
                            <div><span>Cost estimate:</span> {startup.estimatedCost}</div>
                          </div>

                          <div className="bus-idea-actions">
                            <button className="bus-action-link" onClick={() => autoFillIdea(startup)}>Fill into Business Plan →</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* BUSINESS PLAN OUTPUT */}
                  {tab === 'plan' && result.swotAnalysis && (
                    <div className="bus-result-block">
                      <div className="bus-result-header">
                        <h3 className="bus-result-title">{businessName} — Business Feasibility Plan</h3>
                        <button className="bus-copy-btn" onClick={() => copy(result.formattedText || result)}>{copied ? <Check size={14} /> : <Copy size={14} />} Copy</button>
                      </div>

                      <div className="bus-section">
                        <strong>Executive Summary:</strong>
                        <p>{result.executiveSummary}</p>
                      </div>

                      {/* SWOT Matrix */}
                      <div className="bus-swot-matrix">
                        <div className="bus-swot-card strength">
                          <strong>Strengths:</strong>
                          <ul>{result.swotAnalysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                        <div className="bus-swot-card weakness">
                          <strong>Weaknesses:</strong>
                          <ul>{result.swotAnalysis.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}</ul>
                        </div>
                        <div className="bus-swot-card opportunity">
                          <strong>Opportunities:</strong>
                          <ul>{result.swotAnalysis.opportunities?.map((o, i) => <li key={i}>{o}</li>)}</ul>
                        </div>
                        <div className="bus-swot-card threat">
                          <strong>Threats:</strong>
                          <ul>{result.swotAnalysis.threats?.map((t, i) => <li key={i}>{t}</li>)}</ul>
                        </div>
                      </div>

                      <div className="bus-section">
                        <strong>Operational Financial Plan:</strong>
                        <div className="bus-financial-grid">
                          <div><span>Initial Cap:</span> {result.financialPlan?.initialInvestment}</div>
                          <div><span>Break-even:</span> {result.financialPlan?.breakEvenPoint}</div>
                          <div><span>Year 1 Revenue:</span> {result.financialPlan?.year1Revenue}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PITCH DECK SLIDES CONTENT */}
                  {result.slides && (
                    <div className="bus-pitch-view">
                      <div className="bus-result-header" style={{ marginBottom: '16px' }}>
                        <div>
                          <h3 className="bus-result-title">{businessName} Pitch Deck outline</h3>
                          <p className="bus-elevator"><strong>Elevator Pitch:</strong> "{result.elevatorPitch}"</p>
                        </div>
                        <button className="bus-copy-btn" onClick={() => copy(JSON.stringify(result.slides, null, 2))}><Copy size={14} /> Copy Specs</button>
                      </div>

                      <div className="bus-slides-list">
                        {result.slides.map((slide, i) => (
                          <div key={i} className="bus-slide-card">
                            <div className="bus-slide-hdr">
                              <span>Slide {slide.slideNumber}</span>
                              <span className="bus-slide-type">{slide.type}</span>
                            </div>
                            <h4 className="bus-slide-title">{slide.title}</h4>
                            <p className="bus-slide-content">{slide.content}</p>
                            <ul className="bus-slide-bullets">
                              {slide.keyPoints?.map((p, idx) => <li key={idx}>{p}</li>)}
                            </ul>
                            {slide.visualSuggestion && <p className="bus-slide-vis">🎨 <strong>Visual Concept:</strong> {slide.visualSuggestion}</p>}
                          </div>
                        ))}
                      </div>

                      {result.pitchScript && (
                        <div className="bus-script-section" style={{ marginTop: '20px' }}>
                          <strong>🗣️ 3-Minute Presentation Script:</strong>
                          <pre className="bus-pre-script">{result.pitchScript}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MARKETING PLAN OUTPUT */}
                  {tab === 'marketing' && result.funnelStrategy && (
                    <div className="bus-result-block">
                      <div className="bus-result-header">
                        <h3 className="bus-result-title">{businessName} Marketing Funnel</h3>
                        <button className="bus-copy-btn" onClick={() => copy(result)}><Copy size={14} /> Copy Specs</button>
                      </div>

                      {result.targetPersona && (
                        <div className="bus-persona-card">
                          <strong>Target Buyer Persona:</strong>
                          <div className="bus-persona-details">
                            <div>Name: {result.targetPersona.name} | Age: {result.targetPersona.age}</div>
                            <div>Pain points: {result.targetPersona.painPoints?.join(', ')}</div>
                          </div>
                        </div>
                      )}

                      <div className="bus-funnel">
                        <strong>Marketing Funnel:</strong>
                        <div className="bus-funnel-step"><span>Awareness:</span> {result.funnelStrategy.awareness}</div>
                        <div className="bus-funnel-step"><span>Consideration:</span> {result.funnelStrategy.consideration}</div>
                        <div className="bus-funnel-step"><span>Conversion:</span> {result.funnelStrategy.conversion}</div>
                      </div>
                    </div>
                  )}

                  {/* COMPETITOR MATRIX OUTPUT */}
                  {result.competitorsMatrix && (
                    <div className="bus-result-block">
                      <div className="bus-result-header">
                        <h3 className="bus-result-title">Competitive Landscape Matrix</h3>
                        <button className="bus-copy-btn" onClick={() => copy(result.competitorsMatrix)}><Copy size={14} /> Copy Matrix</button>
                      </div>

                      <div className="bus-matrix-grid">
                        {result.competitorsMatrix.map((comp, i) => (
                          <div key={i} className="bus-matrix-card">
                            <h4>{comp.name}</h4>
                            <div><span>Target Market:</span> {comp.targetMarket}</div>
                            <div><span>Pricing Model:</span> {comp.pricing}</div>
                            <div><span>Strengths:</span> {comp.strengths?.join(', ')}</div>
                            <div><span>Weaknesses:</span> {comp.weaknesses?.join(', ')}</div>
                          </div>
                        ))}
                      </div>

                      {result.differentiationStrategy && (
                        <div className="bus-section" style={{ marginTop: '16px' }}>
                          <strong>Proposed Differentiation Strategy:</strong>
                          <p>{result.differentiationStrategy}</p>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="bus-placeholder">
                  <Briefcase size={40} />
                  <p>Business proposals, pitch structures, and matrices will render here.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .bus-page { padding: 0; max-width: 1250px; margin: 0 auto; }
        .bus-header { text-align: center; margin-bottom: 28px; }
        .bus-badge { display: inline-block; background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .bus-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #ddd6fe, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
        .bus-sub { color: var(--text-secondary, #94a3b8); font-size: 14px; }
        .bus-tabs { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 24px; }
        .bus-tab { background: var(--card-bg, rgba(255,255,255,0.03)); border: 1px solid var(--border, rgba(255,255,255,0.06)); border-radius: 12px; padding: 12px; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
        .bus-tab:hover { border-color: rgba(139, 92, 246, 0.3); }
        .bus-tab.active { background: rgba(139, 92, 246, 0.1); border-color: #8b5cf6; }
        .bus-tab strong { display: block; font-size: 13px; color: var(--text, #f1f5f9); }
        .bus-tab span { display: block; font-size: 10px; color: var(--text-secondary, #64748b); }
        
        .bus-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 24px; }
        .bus-panel { background: var(--card-bg, rgba(255, 255, 255, 0.03)); border: 1px solid var(--border, rgba(255, 255, 255, 0.07)); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; min-height: 480px; }
        .bus-panel-title { font-size: 14px; font-weight: 700; color: #a78bfa; margin-bottom: 12px; }
        .bus-fields { display: flex; flex-direction: column; gap: 14px; flex: 1; }
        .bus-field-group { display: flex; flex-direction: column; gap: 6px; }
        .bus-field-group label { font-size: 11px; font-weight: 700; color: var(--text-secondary, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px; }
        .bus-field-group textarea, .bus-field-group select, .bus-field-group input { background: var(--input-bg, rgba(255,255,255,0.05)); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; padding: 10px; color: var(--text, #f1f5f9); font-size: 13px; outline: none; }
        
        .bus-generate-btn { background: linear-gradient(135deg, #7c3aed, #6d28d9); border: none; border-radius: 10px; padding: 12px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; margin-top: auto; }
        .bus-generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .bus-output-box { flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.15); border-radius: 10px; padding: 16px; overflow-y: auto; max-height: 520px; }
        .bus-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; }
        .bus-loader p { font-size: 13px; margin: 0; }
        .bus-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; text-align: center; }
        .bus-placeholder p { font-size: 13px; max-width: 240px; margin: 0; }
        
        .bus-ideas-list { display: flex; flex-direction: column; gap: 16px; }
        .bus-idea-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; }
        .bus-idea-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .bus-idea-hdr h4 { font-size: 15px; font-weight: 700; color: #a78bfa; margin: 0; }
        .bus-risk-badge { font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 20px; }
        .bus-risk-badge.low { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .bus-risk-badge.medium { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .bus-risk-badge.high { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .bus-idea-tagline { font-size: 13px; font-style: italic; color: var(--text-secondary, #cbd5e1); margin: 0 0 10px; }
        .bus-idea-text { font-size: 12px; margin: 0 0 6px; line-height: 1.4; color: var(--text-secondary, #cbd5e1); }
        .bus-idea-grid-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; margin-top: 10px; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; }
        .bus-idea-grid-meta span { font-weight: 700; color: #a78bfa; }
        .bus-idea-actions { display: flex; justify-content: flex-end; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 8px; }
        .bus-action-link { background: none; border: none; font-size: 12px; color: #a78bfa; font-weight: 600; cursor: pointer; text-decoration: underline; }
        
        .bus-result-block { display: flex; flex-direction: column; gap: 14px; }
        .bus-result-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; }
        .bus-result-title { font-size: 16px; font-weight: 800; color: #a78bfa; margin: 0; }
        .bus-elevator { font-size: 12px; color: #f59e0b; margin: 4px 0 0; font-style: italic; }
        .bus-copy-btn { background: rgba(255,255,255,0.06); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 6px; padding: 5px 10px; font-size: 12px; color: var(--text, #cbd5e1); cursor: pointer; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .bus-copy-btn:hover { background: rgba(139, 92, 246, 0.15); border-color: #a78bfa; color: #a78bfa; }
        
        .bus-section { font-size: 13px; line-height: 1.5; }
        .bus-section strong { display: block; margin-bottom: 6px; color: #a78bfa; }
        .bus-section p { margin: 0; color: var(--text-secondary, #cbd5e1); }
        
        .bus-swot-matrix { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
        .bus-swot-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 12px; font-size: 12px; }
        .bus-swot-card.strength { border-left: 3px solid #22c55e; }
        .bus-swot-card.weakness { border-left: 3px solid #ef4444; }
        .bus-swot-card.opportunity { border-left: 3px solid #0ea5e9; }
        .bus-swot-card.threat { border-left: 3px solid #f59e0b; }
        .bus-swot-card strong { display: block; margin-bottom: 6px; font-size: 13px; }
        .bus-swot-card ul { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
        
        .bus-financial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; }
        .bus-financial-grid span { font-weight: 700; color: #a78bfa; display: block; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
        
        .bus-slides-list { display: flex; flex-direction: column; gap: 16px; }
        .bus-slide-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; }
        .bus-slide-hdr { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary, #64748b); border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 6px; margin-bottom: 10px; }
        .bus-slide-type { color: #a78bfa; }
        .bus-slide-title { font-size: 14px; font-weight: 700; margin: 0 0 8px; color: #a78bfa; }
        .bus-slide-content { font-size: 12px; margin: 0 0 8px; line-height: 1.4; color: var(--text-secondary, #cbd5e1); }
        .bus-slide-bullets { margin: 0 0 10px; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; font-size: 11px; }
        .bus-slide-vis { font-size: 10px; color: var(--text-secondary, #64748b); font-style: italic; }
        .bus-pre-script { background: rgba(0,0,0,0.25); border: 1px solid var(--border, rgba(255,255,255,0.05)); border-radius: 8px; padding: 14px; font-size: 12px; font-family: monospace; white-space: pre-wrap; word-break: break-all; margin: 0; line-height: 1.5; max-height: 200px; overflow-y: auto; }
        
        .bus-persona-card { background: rgba(139, 92, 246, 0.05); border-left: 3px solid #8b5cf6; padding: 12px; border-radius: 0 8px 8px 0; font-size: 12px; margin-bottom: 12px; }
        .bus-persona-card strong { display: block; margin-bottom: 4px; color: #a78bfa; }
        .bus-funnel { display: flex; flex-direction: column; gap: 8px; }
        .bus-funnel-step { background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px; font-size: 12px; }
        .bus-funnel-step span { font-weight: 700; color: #a78bfa; }
        
        .bus-matrix-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
        .bus-matrix-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 10px; padding: 12px; font-size: 11px; display: flex; flex-direction: column; gap: 4px; }
        .bus-matrix-card h4 { font-size: 13px; font-weight: 700; margin: 0 0 6px; color: #a78bfa; }
        .bus-matrix-card span { font-weight: 700; }
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
      </main>
    </div>
  );
}
