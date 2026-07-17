import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Loader2, Copy, Search, Check, FileText, Share2, Youtube, Instagram, Linkedin } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const TYPES = [
  { key: 'blog', label: 'Blog Post', icon: <FileText size={16} />, desc: 'SEO-friendly blog articles' },
  { key: 'linkedin', label: 'LinkedIn Post', icon: <Linkedin size={16} />, desc: 'High-engagement personal/work posts' },
  { key: 'instagram', label: 'Instagram Caption', icon: <Instagram size={16} />, desc: 'Niche specific captions & hashtags' },
  { key: 'youtube', label: 'YouTube Script', icon: <Youtube size={16} />, desc: 'Full video scripts with hook & intro' },
  { key: 'productDescription', label: 'Product Copy', icon: <PenTool size={16} />, desc: 'Persuasive e-commerce listing copies' },
  { key: 'seoOptimize', label: 'SEO Optimizer', icon: <Search size={16} />, desc: 'Optimize existing content' }
];

const TONES = ['informative', 'authoritative', 'persuasive', 'casual', 'enthusiastic', 'humorous', 'creative'];
const MOODS = ['inspirational', 'funny', 'minimal', 'educational', 'promotional'];
const GOALS = ['engagement', 'leads', 'authority', 'traffic'];

export default function ContentCreatorPage() {
  const [activeType, setActiveType] = useState('blog');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('informative');
  const [length, setLength] = useState('medium');
  const [audience, setAudience] = useState('general');
  const [keywords, setKeywords] = useState('');
  const [goal, setGoal] = useState('engagement');
  const [mood, setMood] = useState('inspirational');
  const [niche, setNiche] = useState('tech');
  const [duration, setDuration] = useState('10 minutes');
  const [productName, setProductName] = useState('');
  const [productFeatures, setProductFeatures] = useState('');
  
  // SEO Optimizer states
  const [rawContent, setRawContent] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem('closer-token');

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      let endpoint = '/api/content/generate';
      let payload = { type: activeType, options: {} };

      if (activeType === 'blog' || activeType === 'article') {
        payload.options = { topic, tone, length, audience, language: 'English', keywords };
      } else if (activeType === 'linkedin') {
        payload.options = { topic, tone, goal, language: 'English' };
      } else if (activeType === 'instagram') {
        payload.options = { topic, mood, niche, language: 'English' };
      } else if (activeType === 'youtube') {
        payload.options = { topic, niche, duration, language: 'English' };
      } else if (activeType === 'productDescription') {
        payload = {
          type: 'productDescription',
          options: { productName, features: productFeatures, audience, tone, language: 'English' }
        };
      } else if (activeType === 'seoOptimize') {
        endpoint = '/api/content/seo-optimize';
        payload = { content: rawContent, targetKeyword };
      }

      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="cc-page">
      <div className="cc-header">
        <div className="cc-badge">✍️ Content Creator</div>
        <h1 className="cc-title">AI Content & SEO Engine</h1>
        <p className="cc-sub">Generate social media posts, full articles, video scripts, and optimize SEO density instantly</p>
      </div>

      {/* Select type */}
      <div className="cc-types">
        {TYPES.map(t => (
          <button key={t.key} className={`cc-type-btn ${activeType === t.key ? 'active' : ''}`} onClick={() => { setActiveType(t.key); setResult(null); }}>
            {t.icon}
            <div>
              <strong>{t.label}</strong>
              <span>{t.desc}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="cc-grid">
        {/* Form panel */}
        <div className="cc-panel">
          <div className="cc-panel-title">Customizations</div>
          <div className="cc-fields">

            {activeType !== 'seoOptimize' && activeType !== 'productDescription' && (
              <div className="cc-field-group">
                <label>Topic / Title / Idea</label>
                <textarea rows={3} value={topic} onChange={e => setTopic(e.target.value)} placeholder="What do you want to write about?..." />
              </div>
            )}

            {activeType === 'productDescription' && (
              <>
                <div className="cc-field-group">
                  <label>Product Name</label>
                  <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Alpha Sleep Tracker Smart Ring" />
                </div>
                <div className="cc-field-group">
                  <label>Key Product Features</label>
                  <textarea rows={3} value={productFeatures} onChange={e => setProductFeatures(e.target.value)} placeholder="List main benefits, specifications, materials..." />
                </div>
              </>
            )}

            {/* Config depending on types */}
            {(activeType === 'blog' || activeType === 'article' || activeType === 'productDescription') && (
              <>
                <div className="cc-field-group">
                  <label>Target Audience</label>
                  <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Developers, HR Managers, College Students..." />
                </div>
                <div className="cc-field-group">
                  <label>Tone of Voice</label>
                  <select value={tone} onChange={e => setTone(e.target.value)}>
                    {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </>
            )}

            {(activeType === 'blog' || activeType === 'article') && (
              <>
                <div className="cc-field-group">
                  <label>Keywords to target (comma separated)</label>
                  <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. MERN stack deployment, React native hooks..." />
                </div>
                <div className="cc-field-group">
                  <label>Length</label>
                  <select value={length} onChange={e => setLength(e.target.value)}>
                    <option value="short">Short (~300 words)</option>
                    <option value="medium">Medium (~700 words)</option>
                    <option value="long">Long (~1500 words)</option>
                  </select>
                </div>
              </>
            )}

            {activeType === 'linkedin' && (
              <>
                <div className="cc-field-group">
                  <label>Tone</label>
                  <select value={tone} onChange={e => setTone(e.target.value)}>
                    <option value="professional but personal">Professional & Personal</option>
                    <option value="educational">Educational / How-to</option>
                    <option value="storytelling">Storytelling / Narrative</option>
                  </select>
                </div>
                <div className="cc-field-group">
                  <label>Engagement Goal</label>
                  <select value={goal} onChange={e => setGoal(e.target.value)}>
                    {GOALS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                  </select>
                </div>
              </>
            )}

            {activeType === 'instagram' && (
              <>
                <div className="cc-field-group">
                  <label>Mood</label>
                  <select value={mood} onChange={e => setMood(e.target.value)}>
                    {MOODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                  </select>
                </div>
                <div className="cc-field-group">
                  <label>Niche Category</label>
                  <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. fitness, coding, mentalwellbeing" />
                </div>
              </>
            )}

            {activeType === 'youtube' && (
              <>
                <div className="cc-field-group">
                  <label>Niche Channel Category</label>
                  <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. Tech Reviews, Study Vlogs..." />
                </div>
                <div className="cc-field-group">
                  <label>Estimated Video Duration</label>
                  <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 5 minutes, 20 minutes..." />
                </div>
              </>
            )}

            {activeType === 'seoOptimize' && (
              <>
                <div className="cc-field-group">
                  <label>Content to Optimize</label>
                  <textarea rows={8} value={rawContent} onChange={e => setRawContent(e.target.value)} placeholder="Paste your article / blog text here to optimize keywords..." />
                </div>
                <div className="cc-field-group">
                  <label>Target SEO Focus Keyword</label>
                  <input value={targetKeyword} onChange={e => setTargetKeyword(e.target.value)} placeholder="e.g. AI-driven wellness" />
                </div>
              </>
            )}

            <button className="cc-generate-btn" onClick={generate} disabled={loading || (activeType !== 'seoOptimize' && activeType !== 'productDescription' && !topic) || (activeType === 'productDescription' && (!productName || !productFeatures)) || (activeType === 'seoOptimize' && (!rawContent || !targetKeyword))}>
              {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : '🚀 Generate Content'}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="cc-panel">
          <div className="cc-panel-title">Generated Preview</div>

          <div className="cc-output-box">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="cc-loader"><Loader2 size={32} className="spin" /><p>Creating publication-grade copy...</p></div>
              ) : result ? (
                <motion.div className="cc-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  {/* Blog & Article Output */}
                  {result.content && (
                    <div className="cc-result-block">
                      <div className="cc-result-header">
                        <div>
                          <h3 className="cc-result-title">{result.title}</h3>
                          {result.metaDescription && <p className="cc-meta"><strong>Meta Description:</strong> {result.metaDescription}</p>}
                        </div>
                        <button className="cc-copy-btn" onClick={() => copy(result.content)}>
                          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="cc-markdown-view">
                        <pre className="cc-pre">{result.content}</pre>
                      </div>
                      {result.tags?.length > 0 && (
                        <div className="cc-tags">
                          {result.tags.map(t => <span key={t} className="cc-tag">#{t}</span>)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* LinkedIn Output */}
                  {result.posts && (
                    <div className="cc-posts-list">
                      {result.posts.map((post, i) => (
                        <div key={i} className="cc-post-card">
                          <div className="cc-post-hdr">
                            <span className="cc-post-var">{post.variant} Variant</span>
                            <button className="cc-copy-btn sm" onClick={() => copy(post.body)}><Copy size={11} /> Copy</button>
                          </div>
                          <p className="cc-post-hook"><strong>Hook:</strong> {post.hook}</p>
                          <pre className="cc-pre" style={{ background: 'none', border: 'none', padding: 0 }}>{post.body}</pre>
                          {post.engagementTip && <p className="cc-post-tip">💡 Tip: {post.engagementTip}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Instagram Output */}
                  {result.captions && (
                    <div className="cc-posts-list">
                      {result.captions.map((cap, i) => (
                        <div key={i} className="cc-post-card">
                          <div className="cc-post-hdr">
                            <span className="cc-post-var">{cap.style} Style</span>
                            <button className="cc-copy-btn sm" onClick={() => copy(cap.caption)}><Copy size={11} /> Copy</button>
                          </div>
                          <pre className="cc-pre" style={{ background: 'none', border: 'none', padding: 0 }}>{cap.caption}</pre>
                          {cap.ctaHook && <p className="cc-post-tip">🎯 CTA: {cap.ctaHook}</p>}
                        </div>
                      ))}

                      {result.hashtagStrategy && (
                        <div className="cc-hashtag-strategy">
                          <strong>Hashtag Strategy Recommendations</strong>
                          <div>
                            <span>Trending:</span> {result.hashtagStrategy.trending?.join(', ')}
                          </div>
                          <div>
                            <span>Niche:</span> {result.hashtagStrategy.niche?.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* YouTube Output */}
                  {result.script && (
                    <div className="cc-result-block">
                      <h3 className="cc-result-title">{result.title}</h3>
                      <p className="cc-meta"><strong>Visual Concept:</strong> {result.thumbnail}</p>

                      <div className="cc-yt-section">
                        <strong>Hook (0-30s):</strong>
                        <p>{result.script.hook}</p>
                      </div>

                      <div className="cc-yt-section">
                        <strong>Introduction:</strong>
                        <p>{result.script.intro}</p>
                      </div>

                      {result.script.sections?.map((sec, i) => (
                        <div key={i} className="cc-yt-section">
                          <strong>{sec.title} ({sec.duration}):</strong>
                          <p>{sec.content}</p>
                        </div>
                      ))}

                      <div className="cc-yt-section">
                        <strong>CTA Outro:</strong>
                        <p>{result.script.cta} {result.script.outro}</p>
                      </div>
                    </div>
                  )}

                  {/* Product Descriptions */}
                  {result.descriptions && (
                    <div className="cc-posts-list">
                      <div className="cc-post-card">
                        <div className="cc-post-hdr"><span>Short (Listing Page)</span><button className="cc-copy-btn sm" onClick={() => copy(result.descriptions.short)}><Copy size={11} /> Copy</button></div>
                        <p>{result.descriptions.short}</p>
                      </div>
                      <div className="cc-post-card">
                        <div className="cc-post-hdr"><span>Medium (Product Page)</span><button className="cc-copy-btn sm" onClick={() => copy(result.descriptions.medium)}><Copy size={11} /> Copy</button></div>
                        <p>{result.descriptions.medium}</p>
                      </div>
                      <div className="cc-post-card">
                        <div className="cc-post-hdr"><span>Long (Detailed)</span><button className="cc-copy-btn sm" onClick={() => copy(result.descriptions.long)}><Copy size={11} /> Copy</button></div>
                        <p>{result.descriptions.long}</p>
                      </div>
                    </div>
                  )}

                  {/* SEO Optimize Result */}
                  {result.optimizedContent && (
                    <div className="cc-result-block">
                      <div className="cc-scores-row">
                        <div className="cc-score-item">
                          <span>SEO Score</span>
                          <strong style={{ color: '#22c55e' }}>{result.seoScore}/100</strong>
                        </div>
                        <div className="cc-score-item">
                          <span>Keyword Density</span>
                          <strong>{result.keywordDensity}</strong>
                        </div>
                        <div className="cc-score-item">
                          <span>Readability</span>
                          <strong>{result.readabilityScore}/100</strong>
                        </div>
                      </div>

                      <div className="cc-result-actions" style={{ marginTop: '16px' }}>
                        <strong>Optimized SEO Copy</strong>
                        <button className="cc-copy-btn" onClick={() => copy(result.optimizedContent)}><Copy size={14} /> Copy</button>
                      </div>
                      <pre className="cc-pre">{result.optimizedContent}</pre>

                      {result.improvements?.length > 0 && (
                        <div className="cc-improvements" style={{ marginTop: '16px' }}>
                          <strong>SEO Enhancements Done:</strong>
                          <ul>
                            {result.improvements.map((imp, idx) => (
                              <li key={idx}><strong>{imp.type}:</strong> {imp.description} (Fixed: "{imp.fixed}")</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="cc-placeholder">
                  <PenTool size={40} />
                  <p>Generated content preview will render here. Complete the fields to the left.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .cc-page { padding: 0; max-width: 1200px; margin: 0 auto; }
        .cc-header { text-align: center; margin-bottom: 28px; }
        .cc-badge { display: inline-block; background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .cc-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #bae6fd, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
        .cc-sub { color: var(--text-secondary, #94a3b8); font-size: 14px; }
        .cc-types { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; margin-bottom: 24px; }
        .cc-type-btn { background: var(--card-bg, rgba(255,255,255,0.03)); border: 1px solid var(--border, rgba(255,255,255,0.06)); border-radius: 12px; padding: 12px; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; transition: all 0.2s; }
        .cc-type-btn:hover { border-color: rgba(14, 165, 233, 0.3); }
        .cc-type-btn.active { background: rgba(14, 165, 233, 0.1); border-color: #38bdf8; }
        .cc-type-btn strong { display: block; font-size: 13px; color: var(--text, #f1f5f9); }
        .cc-type-btn span { display: block; font-size: 10px; color: var(--text-secondary, #64748b); }
        .cc-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; }
        .cc-panel { background: var(--card-bg, rgba(255, 255, 255, 0.03)); border: 1px solid var(--border, rgba(255, 255, 255, 0.07)); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; min-height: 480px; }
        .cc-panel-title { font-size: 14px; font-weight: 700; color: #38bdf8; margin-bottom: 12px; }
        .cc-fields { display: flex; flex-direction: column; gap: 14px; flex: 1; }
        .cc-field-group { display: flex; flex-direction: column; gap: 6px; }
        .cc-field-group label { font-size: 11px; font-weight: 700; color: var(--text-secondary, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px; }
        .cc-field-group textarea, .cc-field-group select, .cc-field-group input { background: var(--input-bg, rgba(255,255,255,0.05)); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; padding: 10px; color: var(--text, #f1f5f9); font-size: 13px; outline: none; }
        .cc-generate-btn { background: linear-gradient(135deg, #0284c7, #0369a1); border: none; border-radius: 10px; padding: 12px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; margin-top: auto; }
        .cc-generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .cc-output-box { flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.15); border-radius: 10px; padding: 16px; overflow-y: auto; max-height: 540px; }
        .cc-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; }
        .cc-loader p { font-size: 13px; margin: 0; }
        .cc-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; text-align: center; }
        .cc-placeholder p { font-size: 13px; max-width: 240px; margin: 0; }
        
        .cc-result-block { display: flex; flex-direction: column; gap: 14px; }
        .cc-result-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; }
        .cc-result-title { font-size: 16px; font-weight: 800; color: #38bdf8; margin: 0; }
        .cc-meta { font-size: 12px; color: var(--text-secondary, #94a3b8); margin: 6px 0 0; }
        .cc-copy-btn { background: rgba(255,255,255,0.06); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 6px; padding: 6px 12px; font-size: 12px; color: var(--text, #cbd5e1); cursor: pointer; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .cc-copy-btn.sm { padding: 4px 8px; font-size: 11px; }
        .cc-copy-btn:hover { background: rgba(14, 165, 233, 0.15); border-color: #38bdf8; color: #38bdf8; }
        .cc-pre { background: rgba(0,0,0,0.25); border: 1px solid var(--border, rgba(255,255,255,0.05)); border-radius: 8px; padding: 14px; font-size: 13px; font-family: monospace; white-space: pre-wrap; word-break: break-all; margin: 0; line-height: 1.6; }
        .cc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .cc-tag { font-size: 11px; font-weight: 600; color: #38bdf8; }
        
        .cc-posts-list { display: flex; flex-direction: column; gap: 16px; }
        .cc-post-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; }
        .cc-post-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 8px; margin-bottom: 10px; }
        .cc-post-var { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #38bdf8; }
        .cc-post-hook { font-size: 13px; color: #f59e0b; margin: 0 0 10px; line-height: 1.4; }
        .cc-post-tip { font-size: 12px; color: #22c55e; margin: 10px 0 0; }
        .cc-hashtag-strategy { background: rgba(255,255,255,0.02); border-radius: 8px; padding: 12px; font-size: 12px; display: flex; flex-direction: column; gap: 6px; }
        .cc-hashtag-strategy strong { color: var(--text-secondary, #94a3b8); }
        .cc-hashtag-strategy span { font-weight: 700; }
        
        .cc-yt-section { border-left: 3px solid #ef4444; background: rgba(239, 68, 68, 0.03); padding: 10px 14px; border-radius: 0 8px 8px 0; margin-bottom: 12px; }
        .cc-yt-section strong { font-size: 13px; color: #ef4444; display: block; margin-bottom: 4px; }
        .cc-yt-section p { font-size: 13px; margin: 0; line-height: 1.5; color: var(--text-secondary, #cbd5e1); }
        
        .cc-scores-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .cc-score-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 10px; text-align: center; }
        .cc-score-item span { font-size: 10px; color: var(--text-secondary, #64748b); text-transform: uppercase; display: block; margin-bottom: 4px; }
        .cc-score-item strong { font-size: 18px; }
        
        .cc-improvements { font-size: 12px; }
        .cc-improvements ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
      </main>
    </div>
  );
}
