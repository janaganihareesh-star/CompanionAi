import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Trash2, Download, ChevronRight, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API = '/api/career';

const STEPS = ['Target Role', 'Experience', 'Skills & Education', 'AI Preview'];

const defaultExperience = { company: '', role: '', dates: '', bullets: [''] };
const defaultProject = { name: '', tech: '', bullets: [''] };

export default function ResumeBuilderPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(null);

  // Step 1
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  // Step 2
  const [experiences, setExperiences] = useState([{ ...defaultExperience }]);
  // Step 3
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState([{ degree: '', institution: '', year: '' }]);
  const [projects, setProjects] = useState([{ ...defaultProject }]);

  const token = localStorage.getItem('closer-token');

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/resume/build`, {
        targetRole, jobDescription,
        experience: experiences,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        education,
        projects: projects.map(p => ({ ...p, tech: p.tech.split(',').map(t => t.trim()) }))
      }, { headers: { Authorization: `Bearer ${token}` } });
      setResume(data.resume);
      setStep(3);
    } catch { alert('Resume generation failed. Check API key.'); }
    finally { setLoading(false); }
  };

  const atsColor = (score) => score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="rb-page">
      {/* Header */}
      <div className="rb-header">
        <div className="rb-badge">📄 Resume Builder</div>
        <h1 className="rb-title">ATS-Optimized Resume</h1>
        <p className="rb-sub">AI builds your resume with action verbs + quantified achievements</p>
      </div>

      {/* Step indicator */}
      <div className="rb-stepper">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`rb-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              {i < step ? <CheckCircle size={16} /> : <span>{i + 1}</span>}
              <span className="rb-step-label">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`rb-step-line ${i < step ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="rb-body">

          {/* STEP 0 */}
          {step === 0 && (
            <div className="rb-section">
              <label className="rb-label">Target Role *</label>
              <input className="rb-input" placeholder="e.g. Full Stack Developer, Data Engineer, Product Manager" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
              <label className="rb-label" style={{ marginTop: 20 }}>Job Description (optional — for ATS keyword extraction)</label>
              <textarea className="rb-textarea" rows={6} placeholder="Paste the job description here for better ATS matching..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="rb-section">
              {experiences.map((exp, i) => (
                <div key={i} className="rb-card">
                  <div className="rb-card-header">
                    <h4>Experience {i + 1}</h4>
                    {experiences.length > 1 && <button className="rb-remove" onClick={() => setExperiences(prev => prev.filter((_, j) => j !== i))}><Trash2 size={14} /></button>}
                  </div>
                  <div className="rb-grid-2">
                    <input className="rb-input" placeholder="Company" value={exp.company} onChange={e => { const n = [...experiences]; n[i].company = e.target.value; setExperiences(n); }} />
                    <input className="rb-input" placeholder="Role" value={exp.role} onChange={e => { const n = [...experiences]; n[i].role = e.target.value; setExperiences(n); }} />
                  </div>
                  <input className="rb-input" placeholder="Dates (e.g. Jan 2023 - Present)" value={exp.dates} onChange={e => { const n = [...experiences]; n[i].dates = e.target.value; setExperiences(n); }} />
                  <label className="rb-label" style={{ marginTop: 10 }}>Achievements (one per line — AI will quantify)</label>
                  {exp.bullets.map((b, j) => (
                    <input key={j} className="rb-input" placeholder="e.g. Built authentication system with JWT" value={b} onChange={e => { const n = [...experiences]; n[i].bullets[j] = e.target.value; setExperiences(n); }} />
                  ))}
                  <button className="rb-add-small" onClick={() => { const n = [...experiences]; n[i].bullets.push(''); setExperiences(n); }}><Plus size={12} /> Add bullet</button>
                </div>
              ))}
              <button className="rb-add-btn" onClick={() => setExperiences(prev => [...prev, { ...defaultExperience }])}><Plus size={16} /> Add Experience</button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="rb-section">
              <label className="rb-label">Skills (comma separated)</label>
              <textarea className="rb-textarea" rows={3} placeholder="React, Node.js, MongoDB, AWS, Python, SQL..." value={skills} onChange={e => setSkills(e.target.value)} />

              <h4 style={{ margin: '20px 0 12px' }}>Education</h4>
              {education.map((edu, i) => (
                <div key={i} className="rb-grid-3" style={{ marginBottom: 10 }}>
                  <input className="rb-input" placeholder="Degree" value={edu.degree} onChange={e => { const n = [...education]; n[i].degree = e.target.value; setEducation(n); }} />
                  <input className="rb-input" placeholder="Institution" value={edu.institution} onChange={e => { const n = [...education]; n[i].institution = e.target.value; setEducation(n); }} />
                  <input className="rb-input" placeholder="Year" value={edu.year} onChange={e => { const n = [...education]; n[i].year = e.target.value; setEducation(n); }} />
                </div>
              ))}
              <button className="rb-add-small" onClick={() => setEducation(prev => [...prev, { degree: '', institution: '', year: '' }])}><Plus size={12} /> Add Education</button>

              <h4 style={{ margin: '20px 0 12px' }}>Projects</h4>
              {projects.map((proj, i) => (
                <div key={i} className="rb-card" style={{ marginBottom: 12 }}>
                  <div className="rb-grid-2">
                    <input className="rb-input" placeholder="Project Name" value={proj.name} onChange={e => { const n = [...projects]; n[i].name = e.target.value; setProjects(n); }} />
                    <input className="rb-input" placeholder="Tech Stack (comma separated)" value={proj.tech} onChange={e => { const n = [...projects]; n[i].tech = e.target.value; setProjects(n); }} />
                  </div>
                  {proj.bullets.map((b, j) => (
                    <input key={j} className="rb-input" placeholder="Project achievement/feature" value={b} onChange={e => { const n = [...projects]; n[i].bullets[j] = e.target.value; setProjects(n); }} />
                  ))}
                  <button className="rb-add-small" onClick={() => { const n = [...projects]; n[i].bullets.push(''); setProjects(n); }}><Plus size={12} /> Add bullet</button>
                </div>
              ))}
              <button className="rb-add-btn" onClick={() => setProjects(prev => [...prev, { ...defaultProject }])}><Plus size={16} /> Add Project</button>
            </div>
          )}

          {/* STEP 3 — AI Preview */}
          {step === 3 && resume && !resume.mock && (
            <div className="rb-preview">
              {/* ATS Score Badge */}
              <div className="rb-ats-banner">
                <span>Estimated ATS Score</span>
                <span className="rb-ats-score" style={{ color: atsColor(resume.estimatedAtsScore) }}>
                  {resume.estimatedAtsScore}/100
                </span>
                <span className={`rb-ats-badge ${resume.estimatedAtsScore >= 80 ? 'green' : resume.estimatedAtsScore >= 60 ? 'amber' : 'rose'}`}>
                  {resume.estimatedAtsScore >= 80 ? '✅ Strong' : resume.estimatedAtsScore >= 60 ? '⚠️ Needs Work' : '❌ Below Average'}
                </span>
              </div>

              {/* ATS Keywords */}
              <div className="rb-section-block">
                <h4>ATS Keywords</h4>
                <div className="rb-chips">
                  {(resume.atsKeywords || []).map((kw, i) => (
                    <span key={i} className="rb-chip green">{kw}</span>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rb-section-block">
                <h4>Professional Summary</h4>
                <p className="rb-preview-text">{resume.summary}</p>
              </div>

              {/* Skills */}
              {resume.skills && (
                <div className="rb-section-block">
                  <h4>Skills</h4>
                  {Object.entries(resume.skills).map(([cat, list]) => (
                    list && list.length > 0 && (
                      <div key={cat} style={{ marginBottom: 8 }}>
                        <span className="rb-skill-cat">{cat}: </span>
                        <span className="rb-preview-text">{Array.isArray(list) ? list.join(' • ') : list}</span>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Full Resume Text */}
              <div className="rb-section-block">
                <div className="rb-section-header">
                  <h4>Full Resume</h4>
                  <button className="rb-copy-btn" onClick={() => navigator.clipboard.writeText(resume.resumeText)}>Copy</button>
                </div>
                <pre className="rb-resume-text">{resume.resumeText}</pre>
              </div>

              <button className="rb-download-btn" onClick={() => {
                const blob = new Blob([resume.resumeText], { type: 'text/plain' });
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                a.download = `${targetRole.replace(/\s/g, '_')}_Resume.txt`; a.click();
              }}>
                <Download size={16} /> Download Resume
              </button>
            </div>
          )}

          {step === 3 && resume?.mock && (
            <div className="rb-mock-msg">⚙️ Configure <strong>GEMINI_API_KEY</strong> in backend .env to generate real resumes.</div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="rb-nav">
        {step > 0 && step < 3 && (
          <button className="rb-btn-back" onClick={() => setStep(s => s - 1)}><ChevronLeft size={16} /> Back</button>
        )}
        {step < 2 && (
          <button className="rb-btn-next" onClick={() => setStep(s => s + 1)} disabled={step === 0 && !targetRole}>
            Next <ChevronRight size={16} />
          </button>
        )}
        {step === 2 && (
          <button className="rb-btn-generate" onClick={generate} disabled={loading}>
            {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : '✨ Generate Resume'}
          </button>
        )}
      </div>

      <style>{`
        .rb-page { padding: 32px 24px; max-width: 860px; margin: 0 auto; }
        .rb-header { text-align:center; margin-bottom:32px; }
        .rb-badge { display:inline-block; background:rgba(139,92,246,.15); color:#a78bfa; border:1px solid rgba(139,92,246,.3); border-radius:20px; padding:6px 16px; font-size:13px; font-weight:600; margin-bottom:12px; }
        .rb-title { font-size:32px; font-weight:800; background:linear-gradient(135deg,#e0c3fc,#8ec5fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 8px; }
        .rb-sub { color:var(--text-secondary,#94a3b8); font-size:15px; }
        .rb-stepper { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:36px; flex-wrap:wrap; }
        .rb-step { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:var(--text-secondary,#64748b); padding:8px 14px; border-radius:20px; background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); }
        .rb-step.active { background:rgba(139,92,246,.2); color:#a78bfa; border-color:rgba(139,92,246,.4); }
        .rb-step.done { background:rgba(34,197,94,.1); color:#22c55e; border-color:rgba(34,197,94,.3); }
        .rb-step-label { display:none; } @media(min-width:600px){.rb-step-label{display:inline;}}
        .rb-step-line { width:24px; height:2px; background:var(--border,rgba(255,255,255,.1)); }
        .rb-step-line.done { background:#22c55e; }
        .rb-body { min-height:300px; }
        .rb-section { display:flex; flex-direction:column; gap:12px; }
        .rb-label { font-size:13px; font-weight:600; color:var(--text-secondary,#94a3b8); }
        .rb-input { background:var(--input-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:12px 14px; color:var(--text,#f1f5f9); font-size:14px; outline:none; width:100%; box-sizing:border-box; transition:border-color .2s; }
        .rb-input:focus { border-color:#8b5cf6; }
        .rb-textarea { background:var(--input-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:12px 14px; color:var(--text,#f1f5f9); font-size:14px; outline:none; width:100%; box-sizing:border-box; resize:vertical; }
        .rb-card { background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:10px; }
        .rb-card-header { display:flex; align-items:center; justify-content:space-between; }
        .rb-card-header h4 { margin:0; font-size:14px; font-weight:700; }
        .rb-remove { background:rgba(239,68,68,.15); color:#ef4444; border:none; border-radius:8px; padding:6px; cursor:pointer; display:flex; }
        .rb-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .rb-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
        .rb-add-small { background:none; border:1px dashed var(--border,rgba(255,255,255,.2)); border-radius:8px; padding:6px 12px; color:var(--text-secondary,#64748b); font-size:12px; cursor:pointer; display:flex; align-items:center; gap:4px; width:fit-content; }
        .rb-add-btn { background:rgba(139,92,246,.12); border:1px dashed rgba(139,92,246,.4); border-radius:12px; padding:12px; color:#a78bfa; font-size:14px; cursor:pointer; display:flex; align-items:center; gap:6px; justify-content:center; width:100%; }
        .rb-nav { display:flex; gap:12px; justify-content:flex-end; margin-top:32px; }
        .rb-btn-back { background:var(--card-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:10px; padding:12px 20px; color:var(--text,#f1f5f9); font-size:14px; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .rb-btn-next, .rb-btn-generate { background:linear-gradient(135deg,#7c3aed,#6d28d9); border:none; border-radius:10px; padding:12px 24px; color:white; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .rb-btn-next:disabled { opacity:.5; cursor:not-allowed; }
        .rb-ats-banner { display:flex; align-items:center; gap:12px; background:var(--card-bg,rgba(255,255,255,.04)); border:1px solid var(--border,rgba(255,255,255,.08)); border-radius:14px; padding:16px 20px; margin-bottom:20px; }
        .rb-ats-score { font-size:28px; font-weight:800; }
        .rb-ats-badge { padding:6px 14px; border-radius:20px; font-size:13px; font-weight:600; }
        .rb-ats-badge.green { background:rgba(34,197,94,.15); color:#22c55e; }
        .rb-ats-badge.amber { background:rgba(245,158,11,.15); color:#f59e0b; }
        .rb-ats-badge.rose  { background:rgba(239,68,68,.15); color:#ef4444; }
        .rb-section-block { background:var(--card-bg,rgba(255,255,255,.03)); border:1px solid var(--border,rgba(255,255,255,.07)); border-radius:14px; padding:20px; margin-bottom:16px; }
        .rb-section-block h4 { margin:0 0 12px; font-size:15px; font-weight:700; }
        .rb-section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .rb-chips { display:flex; flex-wrap:wrap; gap:8px; }
        .rb-chip { padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600; }
        .rb-chip.green { background:rgba(34,197,94,.15); color:#22c55e; }
        .rb-copy-btn { background:var(--card-bg,rgba(255,255,255,.06)); border:1px solid var(--border,rgba(255,255,255,.1)); border-radius:8px; padding:6px 14px; font-size:12px; cursor:pointer; color:var(--text-secondary,#94a3b8); }
        .rb-preview-text { font-size:14px; color:var(--text,#f1f5f9); line-height:1.6; margin:0; }
        .rb-skill-cat { font-weight:700; color:#a78bfa; }
        .rb-resume-text { white-space:pre-wrap; font-family:monospace; font-size:12px; color:var(--text,#f1f5f9); background:rgba(0,0,0,.2); border-radius:8px; padding:16px; max-height:400px; overflow-y:auto; }
        .rb-download-btn { background:linear-gradient(135deg,#059669,#047857); border:none; border-radius:10px; padding:14px 24px; color:white; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; margin-top:8px; }
        .rb-mock-msg { text-align:center; padding:40px; color:var(--text-secondary,#94a3b8); font-size:15px; background:var(--card-bg,rgba(255,255,255,.03)); border-radius:14px; border:1px dashed var(--border,rgba(255,255,255,.1)); }
        .spin { animation:spin 1s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
