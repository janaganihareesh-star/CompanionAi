import React, { useState, useEffect } from 'react';
import { X, Play, Loader2, Terminal, Code2 } from 'lucide-react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeRunner({ code, language, onClose }) {
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    const lang = language.toLowerCase();
    if (['html', 'css', 'js', 'javascript', 'xml'].includes(lang)) {
      if (code.includes('<html') || code.includes('<div') || lang === 'html') {
        setIsWeb(true);
      }
    }
  }, [language, code]);

  const handleRun = async () => {
    if (isWeb) return; // Web runs automatically via iframe
    setIsRunning(true);
    setError(null);
    setOutput(null);
    try {
      const res = await api.post('/api/code/execute', { language, code });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setOutput(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!isWeb) {
      handleRun(); // Auto-run on open if backend code
    }
  }, [isWeb]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-12">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-6xl h-[85vh] bg-bg border border-border/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-2 text-text">
            <Code2 className="w-5 h-5 text-accent" />
            <h3 className="font-semibold font-outfit text-lg">Universal Code Sandbox</h3>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono text-gray-300 ml-2">
              {language}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isWeb && (
              <button 
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-accent text-white rounded-lg hover:bg-accent-light transition disabled:opacity-50"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Code View */}
          <div className="w-full flex-1 flex flex-col border-b border-white/10 overflow-auto bg-[#1e1e1e]">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={language === 'js' ? 'javascript' : language === 'py' ? 'python' : language === 'cpp' ? 'cpp' : language}
              PreTag="div"
              customStyle={{ margin: 0, padding: '1rem', background: 'transparent', height: '100%' }}
            >
              {code}
            </SyntaxHighlighter>
          </div>

          {/* Output View */}
          <div className="w-full h-1/3 flex flex-col bg-black/50 overflow-hidden relative border-t border-white/5 shadow-inner">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 text-emerald-400 text-sm font-medium tracking-wide">
              <Terminal className="w-4 h-4" />
              {isWeb ? 'Browser Preview' : 'Terminal Output'}
            </div>
            
            <div className="flex-1 overflow-auto p-4 relative">
              {isWeb ? (
                <iframe
                  title="code-preview"
                  srcDoc={code}
                  className="w-full h-full bg-white rounded-lg"
                  sandbox="allow-scripts allow-modals"
                />
              ) : (
                <div className="font-mono text-sm">
                  {isRunning && (
                    <div className="flex items-center gap-2 text-accent">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Executing on remote sandbox...
                    </div>
                  )}
                  {error && (
                    <div className="text-red-400 mt-2 whitespace-pre-wrap">{error}</div>
                  )}
                  {output && (
                    <div className="mt-2">
                      {output.stderr && (
                        <div className="text-red-400 whitespace-pre-wrap mb-4">{output.stderr}</div>
                      )}
                      {output.stdout && (
                        <div className="text-green-400 whitespace-pre-wrap">{output.stdout}</div>
                      )}
                      {!output.stdout && !output.stderr && (
                        <div className="text-gray-500 italic">Program finished with no output.</div>
                      )}
                      <div className="text-gray-500 mt-4 text-xs">
                        Exit Code: {output.code !== undefined ? output.code : 'Unknown'}
                        {output.signal ? ` (Signal: ${output.signal})` : ''}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
