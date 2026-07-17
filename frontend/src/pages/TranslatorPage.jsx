import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Loader2, Copy, Volume2, Sparkles, MessageSquare, FileText, Search } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const INDIAN_LANGS = ['Telugu','Hindi','Tamil','Kannada','Malayalam','Bengali','Gujarati','Marathi','Punjabi','Odia','Urdu','Assamese','Sanskrit'];
const INT_LANGS = ['English','French','German','Spanish','Portuguese','Italian','Japanese','Chinese','Korean','Arabic','Russian','Dutch','Turkish','Vietnamese','Thai'];

const STYLES = [
  { key: 'natural', label: 'Natural & Fluent' },
  { key: 'formal', label: 'Formal & Polite' },
  { key: 'casual', label: 'Casual & Friendly' },
  { key: 'professional', label: 'Business Professional' }
];

export default function TranslatorPage() {
  const [mode, setMode] = useState('text'); // 'text' | 'document' | 'chat' | 'detect'
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('Telugu');
  const [style, setStyle] = useState('natural');
  const [inputText, setInputText] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const token = localStorage.getItem('closer-token');

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      let endpoint = '/api/translate/text';
      let payload = { text: inputText, targetLanguage: targetLang, sourceLanguage: sourceLang, style, context };

      if (mode === 'document') {
        endpoint = '/api/translate/document';
        payload = { documentText: inputText, targetLanguage: targetLang, sourceLanguage: sourceLang };
      } else if (mode === 'chat') {
        endpoint = '/api/translate/chat';
        payload = { message: inputText, targetLanguage: targetLang, conversationContext: context };
      } else if (mode === 'detect') {
        endpoint = '/api/translate/detect';
        payload = { text: inputText };
      }

      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Translation failed. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (textToSpeak) => {
    if (!textToSpeak) return;
    try {
      const speech = new SpeechSynthesisUtterance(textToSpeak);
      window.speechSynthesis.speak(speech);
    } catch (e) {
      console.error('Speech synthesis not supported', e);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="tr-page">
          <div className="tr-header">
        <div className="tr-badge">🌐 Universal Translator</div>
        <h1 className="tr-title">Universal Translation Engine</h1>
        <p className="tr-sub">Break barriers with premium translation covering Indian & World languages</p>
      </div>

      {/* Mode Selector */}
      <div className="tr-modes">
        <button className={`tr-mode ${mode === 'text' ? 'active' : ''}`} onClick={() => { setMode('text'); setResult(null); }}><Globe size={14} /> Text Translate</button>
        <button className={`tr-mode ${mode === 'document' ? 'active' : ''}`} onClick={() => { setMode('document'); setResult(null); }}><FileText size={14} /> Document Translate</button>
        <button className={`tr-mode ${mode === 'chat' ? 'active' : ''}`} onClick={() => { setMode('chat'); setResult(null); }}><MessageSquare size={14} /> Chat Translation</button>
        <button className={`tr-mode ${mode === 'detect' ? 'active' : ''}`} onClick={() => { setMode('detect'); setResult(null); }}><Search size={14} /> Detect Language</button>
      </div>

      {/* Grid Settings */}
      <div className="tr-settings-row">
        {mode !== 'detect' && (
          <>
            <div className="tr-setting-group">
              <label>Source Language</label>
              <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                <option value="auto">Auto Detect</option>
                <optgroup label="Indian Languages">
                  {INDIAN_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                </optgroup>
                <optgroup label="International Languages">
                  {INT_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                </optgroup>
              </select>
            </div>

            <div className="tr-setting-group">
              <label>Target Language</label>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                <optgroup label="Indian Languages">
                  {INDIAN_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                </optgroup>
                <optgroup label="International Languages">
                  {INT_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                </optgroup>
              </select>
            </div>
          </>
        )}

        {mode === 'text' && (
          <div className="tr-setting-group">
            <label>Translation Tone</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              {STYLES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        )}

        {(mode === 'text' || mode === 'chat') && (
          <div className="tr-setting-group" style={{ flex: 1 }}>
            <label>Additional Context / Scenario (Optional)</label>
            <input value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. Email to boss, slang chat between friends..." />
          </div>
        )}
      </div>

      {/* Translation Panels */}
      <div className="tr-grid">
        {/* Source Text Area */}
        <div className="tr-panel">
          <div className="tr-panel-title">Source Input</div>
          <textarea
            className="tr-textarea"
            rows={10}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              mode === 'detect'
                ? 'Type or paste any text to detect its language and script details...'
                : mode === 'document'
                ? 'Paste raw document content, formatted text or books...'
                : 'Type words, phrases or sentences to translate...'
            }
          />
          <button className="tr-action-btn" onClick={handleTranslate} disabled={loading || !inputText.trim()}>
            {loading ? <><Loader2 size={16} className="spin" /> Translating...</> : 'Translate Now'}
          </button>
        </div>

        {/* Output Area */}
        <div className="tr-panel">
          <div className="tr-panel-title">Translation Output</div>

          <div className="tr-output-box">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="tr-loader"><Loader2 size={32} className="spin" /><p>Processing translation...</p></div>
              ) : result ? (
                <motion.div className="tr-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="tr-result-actions">
                    <button className="tr-icon-btn" onClick={() => speakText(result.translatedText || result.translatedDocument || result.translatedMessage)} title="Text to Speech"><Volume2 size={16} /></button>
                    <button className="tr-icon-btn" onClick={() => navigator.clipboard.writeText(result.translatedText || result.translatedDocument || result.translatedMessage || JSON.stringify(result, null, 2))} title="Copy text"><Copy size={16} /></button>
                  </div>

                  {/* Mode-specific renders */}
                  {mode === 'text' && (
                    <div className="tr-result-content">
                      <p className="tr-main-text">{result.translatedText}</p>
                      {result.detectedLanguage && <div className="tr-result-meta">Detected source language: <span>{result.detectedLanguage}</span></div>}
                      {result.culturalNotes && (
                        <div className="tr-cultural-note">
                          <strong>💡 Cultural Context:</strong>
                          <p>{result.culturalNotes}</p>
                        </div>
                      )}
                      {result.alternativeTranslations?.length > 0 && (
                        <div className="tr-alternatives">
                          <strong>Alternatives:</strong>
                          <ul>
                            {result.alternativeTranslations.map((alt, i) => <li key={i}>{alt}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {mode === 'document' && (
                    <div className="tr-result-content">
                      <pre className="tr-document-pre">{result.translatedDocument}</pre>
                      {result.translationNotes && <div className="tr-cultural-note"><strong>Notes:</strong> {result.translationNotes}</div>}
                    </div>
                  )}

                  {mode === 'chat' && (
                    <div className="tr-result-content">
                      <p className="tr-chat-bubble">{result.translatedMessage}</p>
                      {result.tone && <div className="tr-result-meta">Tone: <span>{result.tone}</span></div>}
                    </div>
                  )}

                  {mode === 'detect' && (
                    <div className="tr-result-content">
                      <div className="tr-detect-grid">
                        <div className="tr-detect-card">
                          <span>Detected Language</span>
                          <strong>{result.detectedLanguage}</strong>
                        </div>
                        <div className="tr-detect-card">
                          <span>Confidence Score</span>
                          <strong>{(result.confidence * 100).toFixed(0)}%</strong>
                        </div>
                        <div className="tr-detect-card">
                          <span>Writing Script</span>
                          <strong>{result.script}</strong>
                        </div>
                      </div>
                      {result.suggestedTargetLanguages?.length > 0 && (
                        <div className="tr-alternatives" style={{ marginTop: '16px' }}>
                          <strong>Recommended target languages for translation:</strong>
                          <div className="tr-chips">
                            {result.suggestedTargetLanguages.map(l => <span key={l} className="tr-chip">{l}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="tr-placeholder">
                  <Globe size={40} />
                  <p>Translated output will appear here. Choose target language and enter text.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .tr-page { padding: 0; max-width: 1100px; margin: 0 auto; }
        .tr-header { text-align: center; margin-bottom: 28px; }
        .tr-badge { display: inline-block; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .tr-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #a7f3d0, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
        .tr-sub { color: var(--text-secondary, #94a3b8); font-size: 14px; }
        .tr-modes { display: flex; gap: 8px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap; }
        .tr-mode { background: var(--card-bg, rgba(255, 255, 255, 0.04)); border: 1px solid var(--border, rgba(255, 255, 255, 0.08)); border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--text-secondary, #94a3b8); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .tr-mode.active { background: rgba(34, 197, 94, 0.12); color: #4ade80; border-color: rgba(34, 197, 94, 0.4); }
        .tr-settings-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px; border: 1px solid var(--border, rgba(255,255,255,0.05)); }
        .tr-setting-group { display: flex; flex-direction: column; gap: 6px; }
        .tr-setting-group label { font-size: 11px; font-weight: 700; color: var(--text-secondary, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px; }
        .tr-setting-group select, .tr-setting-group input { background: var(--input-bg, rgba(255,255,255,0.05)); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; padding: 8px 12px; color: var(--text, #f1f5f9); font-size: 13px; outline: none; }
        .tr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .tr-panel { background: var(--card-bg, rgba(255, 255, 255, 0.03)); border: 1px solid var(--border, rgba(255, 255, 255, 0.07)); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; height: 100%; min-height: 400px; }
        .tr-panel-title { font-size: 14px; font-weight: 700; color: #4ade80; margin-bottom: 12px; }
        .tr-textarea { background: rgba(0,0,0,0.2); border: 1px solid var(--border, rgba(255,255,255,0.06)); border-radius: 10px; padding: 14px; color: var(--text, #f1f5f9); font-size: 14px; outline: none; width: 100%; box-sizing: border-box; resize: none; flex: 1; margin-bottom: 14px; }
        .tr-action-btn { background: linear-gradient(135deg, #059669, #10b981); border: none; border-radius: 10px; padding: 12px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; }
        .tr-output-box { flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.15); border-radius: 10px; padding: 16px; overflow-y: auto; position: relative; }
        .tr-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; position: absolute; top:0; left:0; right:0; bottom:0; }
        .tr-loader p { font-size: 13px; margin: 0; }
        .tr-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary, #64748b); gap: 10px; text-align: center; }
        .tr-placeholder p { font-size: 13px; max-width: 240px; margin: 0; }
        .tr-result { display: flex; flex-direction: column; height: 100%; }
        .tr-result-actions { display: flex; gap: 8px; justify-content: flex-end; margin-bottom: 10px; }
        .tr-icon-btn { background: rgba(255,255,255,0.06); border: none; border-radius: 6px; padding: 6px; color: var(--text-secondary, #94a3b8); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .tr-icon-btn:hover { background: rgba(255,255,255,0.1); color: var(--text, #f1f5f9); }
        .tr-result-content { flex: 1; display: flex; flex-direction: column; gap: 14px; }
        .tr-main-text { font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap; }
        .tr-document-pre { font-size: 13px; line-height: 1.6; font-family: monospace; white-space: pre-wrap; margin: 0; }
        .tr-chat-bubble { background: rgba(34, 197, 94, 0.1); border-left: 3px solid #34d399; padding: 12px 16px; border-radius: 0 12px 12px 12px; margin: 0; font-size: 14px; }
        .tr-result-meta { font-size: 11px; color: var(--text-secondary, #64748b); }
        .tr-result-meta span { color: #34d399; font-weight: 600; }
        .tr-cultural-note { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 12px; font-size: 12px; }
        .tr-cultural-note strong { color: #f59e0b; display: block; margin-bottom: 4px; }
        .tr-cultural-note p { margin: 0; line-height: 1.4; color: var(--text-secondary, #94a3b8); }
        .tr-alternatives { font-size: 12px; }
        .tr-alternatives strong { color: var(--text-secondary, #94a3b8); display: block; margin-bottom: 6px; }
        .tr-alternatives ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; color: var(--text-secondary, #cbd5e1); }
        .tr-detect-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .tr-detect-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 4px; text-align: center; }
        .tr-detect-card span { font-size: 10px; color: var(--text-secondary, #64748b); text-transform: uppercase; }
        .tr-detect-card strong { font-size: 15px; color: #34d399; }
        .tr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .tr-chip { background: rgba(34, 197, 94, 0.15); color: #4ade80; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
      </main>
    </div>
  );
}
