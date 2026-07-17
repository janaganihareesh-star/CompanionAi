import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSignature, Loader2, Copy, Download, HelpCircle, Check, Info } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const DRAFT_TYPES = [
  { key: 'leaveApplication', label: 'Leave Application' },
  { key: 'sickLeave', label: 'Sick Leave Letter' },
  { key: 'resignationLetter', label: 'Resignation Letter' },
  { key: 'complaintLetter', label: 'Complaint Letter' },
  { key: 'applicationLetter', label: 'Application Letter' },
  { key: 'formalEmail', label: 'Formal Email' },
  { key: 'noc', label: 'NOC Letter' },
  { key: 'experienceLetter', label: 'Experience Letter' },
  { key: 'internshipRequest', label: 'Internship Request' },
  { key: 'bankLetter', label: 'Bank Request Letter' }
];

export default function OfficialDraftsPage() {
  const [draftType, setDraftType] = useState('leaveApplication');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [senderName, setSenderName] = useState('');
  const [senderDesignation, setSenderDesignation] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientDesignation, setRecipientDesignation] = useState('');
  const [organization, setOrganization] = useState('');
  
  // Specific details
  const [leaveType, setLeaveType] = useState('casual');
  const [dates, setDates] = useState('');
  const [reason, setReason] = useState('');
  const [illness, setIllness] = useState('');
  const [duration, setDuration] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('1 month');
  const [issue, setIssue] = useState('');
  const [against, setAgainst] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [request, setRequest] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [designation, setDesignation] = useState('');
  const [domain, setDomain] = useState('');

  const token = localStorage.getItem('closer-token');

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const details = {
        senderName, senderDesignation, recipientName, recipientDesignation, organization,
        leaveType, dates, reason, illness, duration, noticePeriod, issue, against,
        incidentDate, purpose, request, subject, message, employeeName, designation, domain
      };

      const { data } = await axios.post('/api/draft/generate', {
        type: draftType,
        details,
        language: 'English'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Draft generation failed. Make sure backend and GEMINI_API_KEY are configured.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTxt = () => {
    if (!result) return;
    const text = result.formattedText || `${result.date}\n\nSubject: ${result.subject}\n\n${result.salutation}\n\n${result.body}\n\n${result.closing}`;
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${result.documentType || 'official_draft'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copy = () => {
    if (!result) return;
    const text = result.formattedText || `${result.date}\n\nSubject: ${result.subject}\n\n${result.salutation}\n\n${result.body}\n\n${result.closing}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="od-page">
      <div className="od-header">
        <div className="od-badge">✍️ Official Drafts</div>
        <h1 className="od-title">Legal & Official Draft Engine</h1>
        <p className="od-sub">Generate polished resignation letters, formal request letters, complaints, or professional emails</p>
      </div>

      <div className="od-grid">
        {/* Input Panel */}
        <div className="od-panel">
          <div className="od-panel-title">Draft Customizer</div>
          <div className="od-fields">
            
            <div className="od-field-group">
              <label>Draft Document Type</label>
              <select value={draftType} onChange={e => { setDraftType(e.target.value); setResult(null); }}>
                {DRAFT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>

            {/* Sender / Recipient */}
            <div className="od-row">
              <div className="od-field-group">
                <label>Your Name</label>
                <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Sender Name" />
              </div>
              <div className="od-field-group">
                <label>Your Title/Designation</label>
                <input value={senderDesignation} onChange={e => setSenderDesignation(e.target.value)} placeholder="e.g. Lead QA Engineer" />
              </div>
            </div>

            <div className="od-row">
              <div className="od-field-group">
                <label>Recipient Name</label>
                <input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="e.g. Dr. Satya Murthy" />
              </div>
              <div className="od-field-group">
                <label>Recipient Designation</label>
                <input value={recipientDesignation} onChange={e => setRecipientDesignation(e.target.value)} placeholder="e.g. Manager / HR Director" />
              </div>
            </div>

            <div className="od-field-group">
              <label>Organization / Company Name</label>
              <input value={organization} onChange={e => setOrganization(e.target.value)} placeholder="e.g. Wipro Technologies" />
            </div>

            {/* Dynamic Specifics */}
            {draftType === 'leaveApplication' && (
              <>
                <div className="od-field-group">
                  <label>Leave Type</label>
                  <select value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                    <option value="casual">Casual Leave</option>
                    <option value="medical">Medical Leave</option>
                    <option value="earned">Earned Leave</option>
                    <option value="maternity/paternity">Maternity/Paternity Leave</option>
                  </select>
                </div>
                <div className="od-field-group">
                  <label>Dates Required</label>
                  <input value={dates} onChange={e => setDates(e.target.value)} placeholder="e.g. June 15th to June 20th, 2026" />
                </div>
                <div className="od-field-group">
                  <label>Reason for Leave</label>
                  <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Family emergency, personal relocation" />
                </div>
              </>
            )}

            {draftType === 'sickLeave' && (
              <>
                <div className="od-field-group">
                  <label>Nature of Illness</label>
                  <input value={illness} onChange={e => setIllness(e.target.value)} placeholder="e.g. Viral fever and severe migraine" />
                </div>
                <div className="od-field-group">
                  <label>Duration / Number of Days</label>
                  <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 3 days" />
                </div>
              </>
            )}

            {draftType === 'resignationLetter' && (
              <>
                <div className="od-field-group">
                  <label>Notice Period Length</label>
                  <input value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} placeholder="e.g. 1 month / 90 days" />
                </div>
                <div className="od-field-group">
                  <label>Reason for Resignation (Optional)</label>
                  <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Pursuing higher academic studies, career transition" />
                </div>
              </>
            )}

            {draftType === 'complaintLetter' && (
              <>
                <div className="od-field-group">
                  <label>Describe the Issue</label>
                  <textarea rows={3} value={issue} onChange={e => setIssue(e.target.value)} placeholder="Describe the defect, misbehavior, or delay..." />
                </div>
                <div className="od-field-group">
                  <label>Against Whom / What Department</label>
                  <input value={against} onChange={e => setAgainst(e.target.value)} placeholder="e.g. Customer Support desk, delivery agency..." />
                </div>
                <div className="od-field-group">
                  <label>Incident Date</label>
                  <input value={incidentDate} onChange={e => setIncidentDate(e.target.value)} placeholder="e.g. June 10th, 2026" />
                </div>
              </>
            )}

            {(draftType === 'applicationLetter' || draftType === 'noc' || draftType === 'bankLetter') && (
              <>
                <div className="od-field-group">
                  <label>Purpose of Document</label>
                  <input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. NOC for passport application, opening salary account..." />
                </div>
                {draftType === 'applicationLetter' && (
                  <div className="od-field-group">
                    <label>What specific items are you requesting?</label>
                    <input value={request} onChange={e => setRequest(e.target.value)} placeholder="e.g. Transfer certificate, project catalog..." />
                  </div>
                )}
              </>
            )}

            {draftType === 'formalEmail' && (
              <>
                <div className="od-field-group">
                  <label>Email Subject Line</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Request for Project Extension Status" />
                </div>
                <div className="od-field-group">
                  <label>Brief Message details</label>
                  <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write down the points you want compiled into the email..." />
                </div>
              </>
            )}

            {draftType === 'experienceLetter' && (
              <>
                <div className="od-field-group">
                  <label>Employee Name</label>
                  <input value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="e.g. Hareesh Janagani" />
                </div>
                <div className="od-field-group">
                  <label>Employee Designation</label>
                  <input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Software Engineer" />
                </div>
                <div className="od-field-group">
                  <label>Tenure / Duration</label>
                  <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 2 years (2024-2026)" />
                </div>
              </>
            )}

            {draftType === 'internshipRequest' && (
              <>
                <div className="od-field-group">
                  <label>Domain of Interest</label>
                  <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. Machine Learning / Full Stack Web" />
                </div>
                <div className="od-field-group">
                  <label>Proposed Duration</label>
                  <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 3 months (Summer)" />
                </div>
              </>
            )}

            <button className="od-generate-btn" onClick={generate} disabled={loading || !senderName || !recipientName}>
              {loading ? <><Loader2 size={16} className="spin" /> Drafting...</> : '🚀 Draft Official Document'}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="od-panel">
          <div className="od-panel-title">Document Preview</div>
          <div className="od-output-box">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="od-loader"><Loader2 size={32} className="spin" /><p>Formatting legal structure...</p></div>
              ) : result ? (
                <motion.div className="od-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="od-result-actions">
                    <button className="od-copy-btn" onClick={copy}>
                      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button className="od-copy-btn" onClick={downloadTxt}><Download size={14} /> TXT</button>
                  </div>

                  <div className="od-letter-content">
                    {result.formattedText ? (
                      <pre className="od-pre">{result.formattedText}</pre>
                    ) : (
                      <div className="od-compiled-letter">
                        <span className="od-letter-date">{result.date}</span>
                        {result.subject && <div className="od-letter-subject"><strong>SUB:</strong> {result.subject}</div>}
                        <span className="od-letter-sal">{result.salutation}</span>
                        <p className="od-letter-body">{result.body}</p>
                        <span className="od-letter-closing">{result.closing}</span>
                      </div>
                    )}
                  </div>

                  {result.tips?.length > 0 && (
                    <div className="od-tips">
                      <strong>💡 Tips for Submission:</strong>
                      <ul>
                        {result.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="od-placeholder">
                  <FileSignature size={40} />
                  <p>Your professional draft will render here. Fill in sender and recipient names to execute.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .od-page { padding: 0; max-width: 1100px; margin: 0 auto; }
        .od-header { text-align: center; margin-bottom: 28px; }
        .od-badge { display: inline-block; background: rgba(236, 72, 153, 0.15); color: #ec4899; border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .od-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #fbcfe8, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
        .od-sub { color: var(--text-secondary, #94a3b8); font-size: 14px; }
        
        .od-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; }
        .od-panel { background: var(--card-bg, rgba(255, 255, 255, 0.03)); border: 1px solid var(--border, rgba(255, 255, 255, 0.07)); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; min-height: 480px; }
        .od-panel-title { font-size: 14px; font-weight: 700; color: #ec4899; margin-bottom: 12px; }
        .od-fields { display: flex; flex-direction: column; gap: 14px; flex: 1; }
        .od-field-group { display: flex; flex-direction: column; gap: 6px; }
        .od-field-group label { font-size: 11px; font-weight: 700; color: var(--text-secondary, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px; }
        .od-field-group textarea, .od-field-group select, .od-field-group input { background: var(--input-bg, rgba(255,255,255,0.05)); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; padding: 10px; color: var(--text, #f1f5f9); font-size: 13px; outline: none; }
        .od-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .od-generate-btn { background: linear-gradient(135deg, #db2777, #be185d); border: none; border-radius: 10px; padding: 12px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; margin-top: auto; }
        .od-generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .od-output-box { flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.15); border-radius: 10px; padding: 16px; overflow-y: auto; max-height: 520px; }
        .od-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; }
        .od-loader p { font-size: 13px; margin: 0; }
        .od-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; text-align: center; }
        .od-placeholder p { font-size: 13px; max-width: 240px; margin: 0; }
        
        .od-result { display: flex; flex-direction: column; gap: 14px; }
        .od-result-actions { display: flex; gap: 8px; justify-content: flex-end; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
        .od-copy-btn { background: rgba(255,255,255,0.06); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 6px; padding: 5px 10px; font-size: 12px; color: var(--text, #cbd5e1); cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .od-copy-btn:hover { background: rgba(236, 72, 153, 0.15); border-color: #ec4899; color: #ec4899; }
        
        .od-letter-content { background: rgba(0,0,0,0.25); border: 1px solid var(--border, rgba(255,255,255,0.05)); border-radius: 8px; padding: 16px; }
        .od-pre { margin: 0; font-size: 13px; font-family: monospace; white-space: pre-wrap; word-break: break-all; line-height: 1.6; color: #f3f4f6; }
        
        .od-compiled-letter { display: flex; flex-direction: column; font-size: 13px; line-height: 1.6; color: #f3f4f6; }
        .od-letter-date { align-self: flex-end; color: var(--text-secondary, #94a3b8); margin-bottom: 12px; }
        .od-letter-subject { font-weight: 700; margin-bottom: 12px; text-decoration: underline; }
        .od-letter-sal { font-weight: 700; margin-bottom: 10px; display: block; }
        .od-letter-body { margin-bottom: 16px; white-space: pre-wrap; text-indent: 20px; }
        .od-letter-closing { font-weight: 700; display: block; }
        
        .od-tips { background: rgba(255,255,255,0.02); border-radius: 8px; padding: 12px; font-size: 12px; }
        .od-tips strong { display: block; margin-bottom: 6px; }
        .od-tips ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
        .od-tips li { color: var(--text-secondary, #94a3b8); }
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
      </main>
    </div>
  );
}
