import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Brain, Code2, Globe, Wand2, BarChart2, PenLine, GraduationCap, Calculator, FileSignature, Briefcase, ArrowRight, Calendar, MessageCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const TOOLS = [
  { icon: <FileText size={26} />, label: 'Document Generator', sub: 'Resume · CV · SOP · LOR · Portfolio', color: 'from-violet-500 to-purple-600', path: '/tools/document-generator', badge: '7 Types · PDF/DOCX' },
  { icon: <Brain size={26} />, label: 'Document Intelligence', sub: 'Summarize · Explain · MCQ · Notes', color: 'from-pink-500 to-rose-600', path: '/tools/document-ai', badge: 'Upload & Analyze' },
  { icon: <Code2 size={26} />, label: 'AI Code Engine', sub: 'Generate · Debug · Review · Optimize', color: 'from-cyan-500 to-blue-600', path: '/tools/code-engine', badge: '13 Languages' },
  { icon: <Globe size={26} />, label: 'Universal Translator', sub: 'Text · Document · Chat · 28 Languages', color: 'from-emerald-500 to-green-600', path: '/tools/translator', badge: 'Indian + World' },
  { icon: <Wand2 size={26} />, label: 'Prompt Engineer', sub: 'GPT · Gemini · Claude · Midjourney', color: 'from-amber-500 to-orange-500', path: '/tools/prompt-engineer', badge: '10 AI Systems' },
  { icon: <BarChart2 size={26} />, label: 'Data Analysis', sub: 'CSV · Excel · Charts · Forecasting', color: 'from-indigo-500 to-blue-600', path: '/tools/data-analysis', badge: 'AI Insights' },
  { icon: <PenLine size={26} />, label: 'Content Creator', sub: 'Blog · LinkedIn · Instagram · YouTube', color: 'from-sky-500 to-cyan-600', path: '/tools/content-creator', badge: 'SEO Optimized' },
  { icon: <GraduationCap size={26} />, label: 'Academic Engine', sub: 'Assignment · Report · PPT · Viva', color: 'from-teal-500 to-emerald-600', path: '/tools/academic', badge: 'UG/PG/PhD' },
  { icon: <Calculator size={26} />, label: 'Math Solver', sub: 'Aptitude · Engineering · Finance', color: 'from-yellow-500 to-amber-600', path: '/tools/calculator', badge: 'Step-by-Step' },
  { icon: <FileSignature size={26} />, label: 'Official Drafts', sub: 'Leave · Complaint · NOC · Resignation', color: 'from-rose-500 to-red-600', path: '/tools/official-drafts', badge: '12 Letter Types' },
  { icon: <Briefcase size={26} />, label: 'Business Engine', sub: 'Ideas · Plans · Pitch Deck · Marketing', color: 'from-purple-500 to-indigo-600', path: '/tools/business', badge: 'Startup Ready' },
  { icon: <Calendar size={26} />, label: 'Google Calendar Plugin', sub: 'Schedule · Manage Meetings · Reminders', color: 'from-blue-500 to-indigo-600', path: '/', badge: 'Live Plugin' },
  { icon: <MessageCircle size={26} />, label: 'Slack Plugin', sub: 'Send Messages · Connect with Team', color: 'from-pink-500 to-red-600', path: '/', badge: 'Live Plugin' }
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 18 } } };

export default function ToolsHubPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="tools-hub">
          <div className="tools-hub-hero">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="tools-hub-tag">🛠️ AI Tools Hub</div>
              <h1 className="tools-hub-title">13 Powerful AI Engines & Plugins</h1>
              <p className="tools-hub-sub">Document Generation · Code Engine · Translator · Content · Academic · Business and more</p>
            </motion.div>
          </div>

          <motion.div className="tools-grid" variants={container} initial="hidden" animate="show">
            {TOOLS.map((tool) => (
              <motion.div
                key={tool.label}
                className="tool-card"
                variants={item}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(tool.path)}
              >
                <div className={`tool-icon bg-gradient-to-br ${tool.color}`}>{tool.icon}</div>
                <div className="tool-content">
                  <div className="tool-badge">{tool.badge}</div>
                  <h3 className="tool-label">{tool.label}</h3>
                  <p className="tool-sub">{tool.sub}</p>
                </div>
                <ArrowRight size={16} className="tool-arrow" />
              </motion.div>
            ))}
          </motion.div>

          <style>{`
            .tools-hub { padding: 0; max-width: 1100px; margin: 0 auto; }
            .tools-hub-hero { text-align: center; margin-bottom: 48px; }
            .tools-hub-tag { display: inline-block; background: rgba(99,102,241,.15); color: #818cf8; border: 1px solid rgba(99,102,241,.3); border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 14px; }
            .tools-hub-title { font-size: clamp(26px,5vw,42px); font-weight: 900; background: linear-gradient(135deg,#c4b5fd,#67e8f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 10px; }
            .tools-hub-sub { color: var(--text-secondary,#94a3b8); font-size: 15px; }
            .tools-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 16px; }
            .tool-card { background: var(--card-bg,rgba(255,255,255,.04)); border: 1px solid var(--border,rgba(255,255,255,.08)); border-radius: 16px; padding: 20px; cursor: pointer; display: flex; align-items: center; gap: 16px; transition: border-color .2s, box-shadow .2s; }
            .tool-card:hover { border-color: rgba(99,102,241,.35); box-shadow: 0 8px 28px rgba(99,102,241,.12); }
            .tool-icon { width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; }
            .tool-content { flex: 1; }
            .tool-badge { font-size: 10px; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 3px; }
            .tool-label { font-size: 15px; font-weight: 700; margin: 0 0 3px; }
            .tool-sub { font-size: 12px; color: var(--text-secondary,#64748b); margin: 0; }
            .tool-arrow { color: var(--text-secondary,#64748b); flex-shrink: 0; }
          `}</style>
        </div>
      </main>
    </div>
  );
}
