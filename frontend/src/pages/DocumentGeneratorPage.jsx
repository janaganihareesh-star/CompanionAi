import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, Copy, Download, History, Trash2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const DOC_TYPES = [
  { key: 'resume', label: 'Resume', desc: 'ATS-optimized professional resume' },
  { key: 'cv', label: 'Curriculum Vitae (CV)', desc: 'Detailed academic/professional CV' },
  { key: 'coverLetter', label: 'Cover Letter', desc: 'Compelling letters with custom tones' },
  { key: 'sop', label: 'Statement of Purpose', desc: 'Graduate/university admission essay' },
  { key: 'lor', label: 'Recommendation Letter', desc: 'Strong academic/work recommendations' },
  { key: 'biodata', label: 'Bio-Data', desc: 'Marriage or job personal bio-data' },
  { key: 'portfolio', label: 'Portfolio Content', desc: 'Sleek copy for personal portfolio' }
];

const TEMPLATES = ['Modern', 'ATS', 'Corporate', 'Academic'];
const TONES = ['professional', 'enthusiastic', 'creative', 'formal'];

export default function DocumentGeneratorPage() {
  const [docType, setDocType] = useState('resume');
  const [template, setTemplate] = useState('Modern');
  const [lang, setLang] = useState('English');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    targetRole: '',
    experience: '',
    skills: '',
    education: '',
    projects: '',
    company: '',
    resumeSummary: '',
    tone: 'professional',
    program: '',
    university: '',
    background: '',
    goals: '',
    recommenderName: '',
    recommenderTitle: '',
    recommenderOrg: '',
    candidateName: '',
    relationship: '',
    strengths: '',
    personalDetails: '',
    hobbies: ''
  });

  const token = localStorage.getItem('closer-token');

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await axios.get('/api/document/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(data.history || []);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Build details payload depending on docType
      const payload = {
        type: docType,
        template,
        userDetails: {
          name: formData.name,
          targetRole: formData.targetRole,
          experience: formData.experience,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
          education: formData.education,
          projects: formData.projects,
          company: formData.company,
          resumeSummary: formData.resumeSummary,
          tone: formData.tone,
          program: formData.program,
          university: formData.university,
          background: formData.background,
          goals: formData.goals,
          recommenderName: formData.recommenderName,
          recommenderTitle: formData.recommenderTitle,
          recommenderOrg: formData.recommenderOrg,
          candidateName: formData.candidateName,
          relationship: formData.relationship,
          strengths: formData.strengths ? formData.strengths.split(',').map(s => s.trim()) : [],
          personalDetails: formData.personalDetails,
          hobbies: formData.hobbies
        }
      };

      const { data } = await axios.post('/api/document/generate', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setResult(data.document);
        fetchHistory();
      } else {
        alert('Generation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Operation failed. Make sure GEMINI_API_KEY is configured.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!result) return;
    try {
      const response = await axios.post('/api/document/export', {
        document: result,
        format,
        filename: result.title ? result.title.replace(/\s+/g, '_') : 'document'
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${result.title || 'document'}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Export failed.');
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      await axios.delete(`/api/document/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="dg-page">
          <div className="dg-header">
        <div className="dg-badge">📄 Document Generator</div>
        <h1 className="dg-title">Professional Document Builder</h1>
        <p className="dg-sub">Create resumes, cover letters, SOPs, and bios in formats ready for print or web</p>
      </div>

      <div className="dg-grid">
        {/* Left Form Panel */}
        <div className="dg-form-panel">
          <div className="dg-section-title">1. Select Document Type</div>
          <div className="dg-types-grid">
            {DOC_TYPES.map((t) => (
              <button
                key={t.key}
                className={`dg-type-card ${docType === t.key ? 'active' : ''}`}
                onClick={() => { setDocType(t.key); setResult(null); }}
              >
                <div className="dg-type-label">{t.label}</div>
                <div className="dg-type-desc">{t.desc}</div>
              </button>
            ))}
          </div>

          <div className="dg-section-title" style={{ marginTop: '24px' }}>2. Customize Fields</div>
          <div className="dg-fields">
            {/* Common Name field for most documents */}
            {docType !== 'lor' && (
              <div className="dg-field-group">
                <label>Full Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Hareesh Janagani" />
              </div>
            )}

            {/* Resume & CV Specifics */}
            {(docType === 'resume' || docType === 'cv') && (
              <>
                <div className="dg-field-group">
                  <label>Target Role</label>
                  <input name="targetRole" value={formData.targetRole} onChange={handleInputChange} placeholder="e.g. Lead React Developer" />
                </div>
                <div className="dg-field-group">
                  <label>Professional Experience</label>
                  <textarea name="experience" rows={4} value={formData.experience} onChange={handleInputChange} placeholder="List job history, achievements, and impact details..." />
                </div>
                <div className="dg-field-group">
                  <label>Skills (comma separated)</label>
                  <input name="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g. React, Node.js, AWS, Kubernetes" />
                </div>
                <div className="dg-field-group">
                  <label>Education</label>
                  <textarea name="education" rows={2} value={formData.education} onChange={handleInputChange} placeholder="Degree, Institution, Year, GPA..." />
                </div>
                <div className="dg-field-group">
                  <label>Key Projects</label>
                  <textarea name="projects" rows={3} value={formData.projects} onChange={handleInputChange} placeholder="Describe main projects, tech stacks, and metrics achieved..." />
                </div>
              </>
            )}

            {/* Cover Letter Specifics */}
            {docType === 'coverLetter' && (
              <>
                <div className="dg-field-group">
                  <label>Target Role</label>
                  <input name="targetRole" value={formData.targetRole} onChange={handleInputChange} placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div className="dg-field-group">
                  <label>Company Name</label>
                  <input name="company" value={formData.company} onChange={handleInputChange} placeholder="e.g. Google DeepMind" />
                </div>
                <div className="dg-field-group">
                  <label>Brief Summary of Resume / Achievements</label>
                  <textarea name="resumeSummary" rows={3} value={formData.resumeSummary} onChange={handleInputChange} placeholder="Summarize your top feats, skills, and why you are a fit..." />
                </div>
                <div className="dg-field-group">
                  <label>Tone</label>
                  <select name="tone" value={formData.tone} onChange={handleInputChange}>
                    {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* SOP Specifics */}
            {docType === 'sop' && (
              <>
                <div className="dg-field-group">
                  <label>Program / Major applying to</label>
                  <input name="program" value={formData.program} onChange={handleInputChange} placeholder="e.g. MS in Computer Science" />
                </div>
                <div className="dg-field-group">
                  <label>Target University</label>
                  <input name="university" value={formData.university} onChange={handleInputChange} placeholder="e.g. Stanford University" />
                </div>
                <div className="dg-field-group">
                  <label>Academic & Work Background</label>
                  <textarea name="background" rows={4} value={formData.background} onChange={handleInputChange} placeholder="Describe degree, research, project achievements, and coursework..." />
                </div>
                <div className="dg-field-group">
                  <label>Short-term & Long-term Goals</label>
                  <textarea name="goals" rows={3} value={formData.goals} onChange={handleInputChange} placeholder="What do you plan to achieve after this degree?..." />
                </div>
              </>
            )}

            {/* LOR Specifics */}
            {docType === 'lor' && (
              <>
                <div className="dg-field-group">
                  <label>Recommender Name</label>
                  <input name="recommenderName" value={formData.recommenderName} onChange={handleInputChange} placeholder="e.g. Dr. Ramesh Kumar" />
                </div>
                <div className="dg-field-group">
                  <label>Recommender Title & Affiliation</label>
                  <input name="recommenderTitle" value={formData.recommenderTitle} onChange={handleInputChange} placeholder="e.g. Professor of Computer Science" />
                </div>
                <div className="dg-field-group">
                  <label>Recommender Organization</label>
                  <input name="recommenderOrg" value={formData.recommenderOrg} onChange={handleInputChange} placeholder="e.g. IIT Madras" />
                </div>
                <div className="dg-field-group">
                  <label>Candidate Name</label>
                  <input name="candidateName" value={formData.candidateName} onChange={handleInputChange} placeholder="e.g. Hareesh Janagani" />
                </div>
                <div className="dg-field-group">
                  <label>Relationship & Duration</label>
                  <input name="relationship" value={formData.relationship} onChange={handleInputChange} placeholder="e.g. Academic advisor for 2 years" />
                </div>
                <div className="dg-field-group">
                  <label>Candidate Strengths (comma separated)</label>
                  <input name="strengths" value={formData.strengths} onChange={handleInputChange} placeholder="e.g. Analytical thinking, persistence, coding skill" />
                </div>
                <div className="dg-field-group">
                  <label>Program applying to</label>
                  <input name="program" value={formData.program} onChange={handleInputChange} placeholder="e.g. MS in Data Science" />
                </div>
              </>
            )}

            {/* Bio-data Specifics */}
            {docType === 'biodata' && (
              <>
                <div className="dg-field-group">
                  <label>Personal Details</label>
                  <textarea name="personalDetails" rows={3} value={formData.personalDetails} onChange={handleInputChange} placeholder="Birth date, height, religion, languages spoken, etc..." />
                </div>
                <div className="dg-field-group">
                  <label>Education & Profession</label>
                  <textarea name="education" rows={2} value={formData.education} onChange={handleInputChange} placeholder="Degrees, college, job title, company..." />
                </div>
                <div className="dg-field-group">
                  <label>Hobbies & Interests</label>
                  <input name="hobbies" value={formData.hobbies} onChange={handleInputChange} placeholder="e.g. Reading, travel, photography" />
                </div>
              </>
            )}

            {/* Portfolio Specifics */}
            {docType === 'portfolio' && (
              <>
                <div className="dg-field-group">
                  <label>Developer / Designer Role</label>
                  <input name="targetRole" value={formData.targetRole} onChange={handleInputChange} placeholder="e.g. Full Stack Developer" />
                </div>
                <div className="dg-field-group">
                  <label>List Core Projects</label>
                  <textarea name="projects" rows={4} value={formData.projects} onChange={handleInputChange} placeholder="Project names, tech stack, and elevator pitches..." />
                </div>
                <div className="dg-field-group">
                  <label>Skills (comma separated)</label>
                  <input name="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g. React, Next.js, Redux, TailwindCSS" />
                </div>
              </>
            )}

            <div className="dg-config-row">
              <div className="dg-field-group">
                <label>Template</label>
                <select value={template} onChange={e => setTemplate(e.target.value)}>
                  {TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button className="dg-generate-btn" onClick={generate} disabled={loading}>
              {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : '🚀 Build Document'}
            </button>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="dg-output-panel">
          <div className="dg-section-title">Document Preview</div>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div className="dg-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="dg-result-header">
                  <div className="dg-result-title-text">{result.title}</div>
                  <div className="dg-export-actions">
                    <button className="dg-export-btn" onClick={() => handleExport('pdf')}><Download size={14} /> PDF</button>
                    <button className="dg-export-btn" onClick={() => handleExport('docx')}><Download size={14} /> DOCX</button>
                    <button className="dg-export-btn" onClick={() => handleExport('md')}><Download size={14} /> MD</button>
                    <button className="dg-export-btn" onClick={() => handleExport('txt')}><Download size={14} /> TXT</button>
                  </div>
                </div>

                <div className="dg-result-content">
                  <pre className="dg-pre">{result.formattedText || result.body || JSON.stringify(result, null, 2)}</pre>
                </div>
              </motion.div>
            ) : (
              <div className="dg-placeholder">
                <FileText size={48} />
                <p>Fill out the details and click generate to preview your professional document.</p>
              </div>
            )}
          </AnimatePresence>

          {/* History log */}
          <div className="dg-history-section">
            <div className="dg-section-title flex justify-between items-center">
              <span><History size={16} style={{ display: 'inline', marginRight: 6 }} /> Download History</span>
              {historyLoading && <Loader2 size={12} className="spin" />}
            </div>
            {history.length > 0 ? (
              <div className="dg-history-list">
                {history.map((h) => (
                  <div key={h.id} className="dg-history-item">
                    <div className="dg-history-info">
                      <strong>{h.title || `${h.type} generation`}</strong>
                      <span>Template: {h.template} | Language: {h.language}</span>
                    </div>
                    <button className="dg-history-delete" onClick={() => deleteHistoryItem(h.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dg-history-empty">No recent downloads found.</div>
            )}
          </div>
        </div>
      </div>

          <style>{`
            .dg-page { padding: 0; max-width: 1200px; margin: 0 auto; }
            .dg-header { text-align: center; margin-bottom: 32px; }
            .dg-badge { display: inline-block; background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
            .dg-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #c084fc, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
            .dg-sub { color: var(--text-secondary, #94a3b8); font-size: 14px; }
            .dg-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 28px; }
            .dg-form-panel, .dg-output-panel { background: var(--card-bg, rgba(255,255,255,0.03)); border: 1px solid var(--border, rgba(255,255,255,0.07)); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; }
            .dg-section-title { font-size: 16px; font-weight: 700; color: #a78bfa; margin-bottom: 16px; border-left: 3px solid #818cf8; padding-left: 10px; }
            .dg-types-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
            .dg-type-card { background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.05)); border-radius: 10px; padding: 10px; cursor: pointer; text-align: left; transition: all 0.2s; }
            .dg-type-card.active { border-color: #818cf8; background: rgba(129, 140, 248, 0.1); }
            .dg-type-label { font-size: 12px; font-weight: 700; margin-bottom: 2px; }
            .dg-type-desc { font-size: 10px; color: var(--text-secondary, #64748b); line-height: 1.3; }
            .dg-fields { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
            .dg-field-group { display: flex; flex-direction: column; gap: 6px; }
            .dg-field-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary, #94a3b8); }
            .dg-field-group input, .dg-field-group textarea, .dg-field-group select { background: var(--input-bg, rgba(255,255,255,0.05)); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; padding: 10px; color: var(--text, #f1f5f9); font-size: 13px; outline: none; }
            .dg-field-group textarea { resize: vertical; }
            .dg-config-row { display: grid; grid-template-columns: 1fr; gap: 12px; }
            .dg-generate-btn { background: linear-gradient(135deg, #6d28d9, #4f46e5); border: none; border-radius: 10px; padding: 12px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s; margin-top: 10px; }
            .dg-generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .dg-placeholder { border: 2px dashed var(--border, rgba(255,255,255,0.08)); border-radius: 12px; padding: 60px 24px; text-align: center; color: var(--text-secondary, #64748b); display: flex; flex-direction: column; align-items: center; gap: 12px; flex: 1; justify-content: center; }
            .dg-placeholder p { font-size: 13px; max-width: 280px; margin: 0; }
            .dg-result { display: flex; flex-direction: column; gap: 14px; flex: 1; }
            .dg-result-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; background: rgba(0,0,0,0.15); padding: 12px; border-radius: 8px; border: 1px solid var(--border, rgba(255,255,255,0.05)); }
            .dg-result-title-text { font-size: 13px; font-weight: 700; color: #a78bfa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .dg-export-actions { display: flex; gap: 6px; }
            .dg-export-btn { background: rgba(255,255,255,0.06); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 6px; padding: 5px 8px; font-size: 11px; font-weight: 600; color: var(--text, #cbd5e1); cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
            .dg-export-btn:hover { background: rgba(129, 140, 248, 0.15); border-color: #818cf8; color: #818cf8; }
            .dg-result-content { background: rgba(0,0,0,0.25); border: 1px solid var(--border, rgba(255,255,255,0.05)); border-radius: 10px; padding: 16px; flex: 1; max-height: 480px; overflow-y: auto; }
            .dg-pre { margin: 0; font-size: 12px; font-family: monospace; white-space: pre-wrap; word-break: break-all; line-height: 1.6; }
            .dg-history-section { border-t: 1px solid var(--border, rgba(255,255,255,0.08)); margin-top: 24px; padding-top: 18px; }
            .dg-history-list { display: flex; flex-direction: column; gap: 8px; max-height: 160px; overflow-y: auto; padding-right: 4px; }
            .dg-history-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--border, rgba(255,255,255,0.04)); border-radius: 8px; padding: 8px 12px; }
            .dg-history-info { display: flex; flex-direction: column; gap: 2px; }
            .dg-history-info strong { font-size: 12px; }
            .dg-history-info span { font-size: 10px; color: var(--text-secondary, #64748b); }
            .dg-history-delete { background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s; }
            .dg-history-delete:hover { background: rgba(239, 68, 68, 0.1); }
            .dg-history-empty { font-size: 12px; color: var(--text-secondary, #64748b); text-align: center; padding: 12px 0; }
            .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </main>
    </div>
  );
}
