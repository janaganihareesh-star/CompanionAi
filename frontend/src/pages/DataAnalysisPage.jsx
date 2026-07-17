import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, BarChart2, Loader2, X, FileText, Table, LineChart, TrendingUp, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

export default function DataAnalysisPage() {
  const [docText, setDocText] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line'
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fileRef = useRef();
  const token = localStorage.getItem('closer-token');

  const handleFileUpload = async (file) => {
    setFileName(file.name);
    setUploading(true);
    setExtractedData(null);
    setInsights(null);

    const form = new FormData();
    form.append('file', file);

    try {
      // Step 1: Upload and extract text
      const uploadRes = await axios.post('/api/document/upload', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const text = uploadRes.data.extractedText || '';
      setDocText(text);

      // Step 2: Call Table Extraction API
      setLoading(true);
      const tablesRes = await axios.post('/api/document/extract-tables', { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExtractedData(tablesRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to parse data file.');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const getAIInsights = async () => {
    if (!docText) return;
    setInsightsLoading(true);
    try {
      const { data } = await axios.post('/api/document/summarize', {
        text: docText,
        length: 'medium'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInsights(data);
    } catch (e) {
      console.error(e);
      alert('Failed to generate insights.');
    } finally {
      setInsightsLoading(false);
    }
  };

  // Helper to map row arrays to objects for Recharts
  const getChartData = (table) => {
    if (!table || !table.rows || table.rows.length === 0) return [];
    
    // We assume the first column is the label, and subsequent numeric columns are values
    return table.rows.slice(0, 15).map((row, index) => {
      const dataObj = { name: row[0] || `Row ${index + 1}` };
      table.headers.forEach((hdr, colIdx) => {
        if (colIdx > 0) {
          const val = parseFloat(String(row[colIdx]).replace(/[^0-9.-]/g, ''));
          dataObj[hdr] = isNaN(val) ? 0 : val;
        }
      });
      return dataObj;
    });
  };

  const clear = () => {
    setDocText('');
    setFileName('');
    setExtractedData(null);
    setInsights(null);
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="da-page">
          <div className="da-header">
        <div className="da-badge">📊 Data Analysis</div>
        <h1 className="da-title">AI Data Analytics Hub</h1>
        <p className="da-sub">Upload CSV, Excel or TSV tables. Visualize charts, and extract auto-insights using Gemini</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`da-upload ${docText ? 'success' : ''}`}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
        onClick={() => !docText && fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" hidden accept=".csv,.xlsx,.xls,.txt" onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0])} />
        {uploading ? (
          <><Loader2 size={32} className="spin" /><p>Uploading & reading spreadsheet...</p></>
        ) : docText ? (
          <div className="da-uploaded">
            <FileText size={28} className="da-file-icon" />
            <div>
              <strong>{fileName}</strong>
              <p>{docText.trim().split(/\s+/).length.toLocaleString()} words parsed</p>
            </div>
            <button className="da-clear" onClick={(e) => { e.stopPropagation(); clear(); }}><X size={14} /></button>
          </div>
        ) : (
          <>
            <Upload size={36} />
            <p>Drop CSV, Excel (XLSX), or tabular Text here or click to browse</p>
            <span>Max 10MB</span>
          </>
        )}
      </div>

      <AnimatePresence>
        {loading && (
          <div className="da-loading-block">
            <Loader2 size={24} className="spin" />
            <span>Analyzing structure & extracting tables...</span>
          </div>
        )}

        {extractedData && (
          <motion.div className="da-results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Visualizer and Insights row */}
            <div className="da-panels-grid">
              
              {/* Tables panel */}
              <div className="da-panel table-panel">
                <div className="da-panel-header">
                  <Table size={16} />
                  <span>Extracted Tables ({extractedData.tables?.length || 0})</span>
                </div>

                <div className="da-table-container">
                  {extractedData.tables?.map((table, tIdx) => (
                    <div key={tIdx} className="da-table-wrapper">
                      <h4 className="da-table-title">{table.title || `Table ${tIdx + 1}`}</h4>
                      <p className="da-table-desc">{table.description}</p>
                      <div className="da-table-overflow">
                        <table>
                          <thead>
                            <tr>
                              {table.headers?.map((h, i) => <th key={i}>{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows?.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  {(!extractedData.tables || extractedData.tables.length === 0) && (
                    <div className="da-empty-state">No tables could be structured. Plain text format returned.</div>
                  )}
                </div>
              </div>

              {/* Chart Visualizer */}
              {extractedData.tables?.length > 0 && extractedData.tables[0].headers?.length > 1 && (
                <div className="da-panel chart-panel">
                  <div className="da-panel-header justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={16} />
                      <span>Data Visualization</span>
                    </div>
                    <div className="da-chart-selectors">
                      <button className={`da-chart-sel-btn ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}><BarChart2 size={12} /></button>
                      <button className={`da-chart-sel-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}><LineChart size={12} /></button>
                    </div>
                  </div>

                  <div className="da-chart-container">
                    <ResponsiveContainer width="100%" height={260}>
                      {chartType === 'bar' ? (
                        <BarChart data={getChartData(extractedData.tables[0])}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="var(--text-secondary, #64748b)" fontSize={11} />
                          <YAxis stroke="var(--text-secondary, #64748b)" fontSize={11} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, fontSize: 12 }} />
                          {extractedData.tables[0].headers.slice(1).map((hdr, idx) => (
                            <Bar key={hdr} dataKey={hdr} fill={idx % 2 === 0 ? '#6366f1' : '#ec4899'} radius={[4, 4, 0, 0]} />
                          ))}
                        </BarChart>
                      ) : (
                        <ReLineChart data={getChartData(extractedData.tables[0])}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="var(--text-secondary, #64748b)" fontSize={11} />
                          <YAxis stroke="var(--text-secondary, #64748b)" fontSize={11} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, fontSize: 12 }} />
                          {extractedData.tables[0].headers.slice(1).map((hdr, idx) => (
                            <Line key={hdr} type="monotone" dataKey={hdr} stroke={idx % 2 === 0 ? '#6366f1' : '#ec4899'} strokeWidth={2} />
                          ))}
                        </ReLineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* AI Insights Block */}
            <div className="da-panel insights-panel" style={{ marginTop: '20px' }}>
              <div className="da-panel-header justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  <span>AI Business Insights & Analysis</span>
                </div>
                {!insights && (
                  <button className="da-insights-btn" onClick={getAIInsights} disabled={insightsLoading}>
                    {insightsLoading ? <><Loader2 size={13} className="spin" /> Thinking...</> : '⚡ Run AI Insights'}
                  </button>
                )}
              </div>

              {insightsLoading && (
                <div className="da-loader"><Loader2 size={24} className="spin" /><p>Analyzing table trends...</p></div>
              )}

              {insights && (
                <div className="da-insights-result">
                  <p className="da-insights-summary">{insights.summary}</p>
                  
                  {insights.keyPoints?.length > 0 && (
                    <div className="da-insights-points">
                      <strong>Key Trends & Indicators:</strong>
                      <ul>
                        {insights.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}

                  {insights.mainTopics?.length > 0 && (
                    <div className="da-insights-topics">
                      <strong>Target Context:</strong>
                      <div className="da-chips">
                        {insights.mainTopics.map(t => <span key={t} className="da-chip">{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .da-page { padding: 0; max-width: 1100px; margin: 0 auto; }
        .da-header { text-align: center; margin-bottom: 28px; }
        .da-badge { display: inline-block; background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .da-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #c7d2fe, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
        .da-sub { color: var(--text-secondary, #94a3b8); font-size: 14px; }
        
        .da-upload { border: 2px dashed var(--border, rgba(255,255,255,0.12)); border-radius: 16px; padding: 40px 24px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; color: var(--text-secondary, #94a3b8); transition: border-color .2s; }
        .da-upload:hover { border-color: rgba(99, 102, 241, 0.5); }
        .da-upload.success { border-color: rgba(34,197,94,0.4); border-style: solid; cursor: default; }
        .da-uploaded { display: flex; align-items: center; gap: 14px; text-align: left; width: 100%; justify-content: center; }
        .da-file-icon { color: #22c55e; flex-shrink: 0; }
        .da-uploaded strong { display: block; font-size: 15px; color: var(--text, #f1f5f9); }
        .da-uploaded p { font-size: 12px; color: var(--text-secondary, #64748b); margin: 2px 0 0; }
        .da-clear { background: rgba(239,68,68,0.15); border: none; border-radius: 6px; padding: 6px; color: #ef4444; cursor: pointer; margin-left: 20px; }
        
        .da-loading-block { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 24px; color: var(--text-secondary, #64748b); font-size: 14px; }
        
        .da-panels-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }
        @media (max-width: 768px) {
          .da-panels-grid { grid-template-columns: 1fr; }
        }
        
        .da-panel { background: var(--card-bg, rgba(255, 255, 255, 0.03)); border: 1px solid var(--border, rgba(255, 255, 255, 0.07)); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; min-height: 320px; }
        .da-panel-header { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #818cf8; margin-bottom: 16px; border-bottom: 1px solid var(--border, rgba(255,255,255,0.05)); padding-bottom: 10px; }
        .da-panel-header.justify-between { justify-content: space-between; }
        
        .da-table-container { flex: 1; overflow-y: auto; max-height: 300px; display: flex; flex-direction: column; gap: 16px; }
        .da-table-wrapper { display: flex; flex-direction: column; }
        .da-table-title { font-size: 13px; font-weight: 700; margin: 0 0 4px; color: var(--text, #f1f5f9); }
        .da-table-desc { font-size: 11px; color: var(--text-secondary, #64748b); margin: 0 0 10px; }
        .da-table-overflow { overflow-x: auto; border: 1px solid var(--border, rgba(255,255,255,0.05)); border-radius: 8px; }
        
        table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
        th { background: rgba(0, 0, 0, 0.2); padding: 8px 12px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08); }
        td { padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.01); }
        
        .da-chart-selectors { display: flex; gap: 4px; }
        .da-chart-sel-btn { background: rgba(255,255,255,0.05); border: none; border-radius: 6px; padding: 6px 10px; color: var(--text-secondary, #94a3b8); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .da-chart-sel-btn.active { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .da-chart-container { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 260px; }
        
        .da-insights-btn { background: linear-gradient(135deg, #4f46e5, #4338ca); border: none; border-radius: 8px; padding: 6px 14px; color: white; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .da-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: var(--text-secondary, #64748b); gap: 10px; width: 100%; }
        .da-loader p { font-size: 12px; margin: 0; }
        .da-insights-result { display: flex; flex-direction: column; gap: 14px; }
        .da-insights-summary { font-size: 14px; line-height: 1.6; margin: 0; }
        .da-insights-points strong, .da-insights-topics strong { font-size: 12px; color: var(--text-secondary, #94a3b8); display: block; margin-bottom: 6px; }
        .da-insights-points ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
        .da-insights-points li { font-size: 13px; color: var(--text-secondary, #cbd5e1); line-height: 1.5; }
        .da-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .da-chip { background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
        .da-empty-state { font-size: 12px; color: var(--text-secondary, #64748b); text-align: center; padding: 24px 0; }
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
      </main>
    </div>
  );
}
