import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2, Code2, AlertTriangle, Terminal } from 'lucide-react';

import api from '../utils/api';

export default function PyodideSandbox({ initialCode = "print('Hello from WebAssembly Python!')" }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [runMode, setRunMode] = useState('browser'); // 'browser' or 'server'
  const pyodideRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadPyodideScript = async () => {
      try {
        if (window.pyodide) {
          pyodideRef.current = window.pyodide;
          if (isMounted) setIsReady(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
        script.onload = async () => {
          if (!window.loadPyodide) return;
          const pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
          });
          // Preload standard data science libraries if needed (optional)
          // await pyodide.loadPackage(['numpy', 'pandas']);
          pyodideRef.current = pyodide;
          window.pyodide = pyodide; // cache globally
          if (isMounted) setIsReady(true);
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error('Failed to load Pyodide:', err);
      }
    };
    if (runMode === 'browser') {
      loadPyodideScript();
    }
    return () => { isMounted = false; };
  }, [runMode]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    
    if (runMode === 'server') {
      try {
        const res = await api.post('/api/code/execute', { language: 'python', code });
        if (res.data.error) {
          setOutput(`Server Error:\n${res.data.error}`);
        } else {
          setOutput(res.data.stdout + '\n' + (res.data.stderr || ''));
        }
      } catch (err) {
        setOutput(`Traceback:\n${err.message}`);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    if (!pyodideRef.current) return;
    
    // Redirect stdout to capture print() statements
    pyodideRef.current.setStdout({ batched: (msg) => {
      setOutput((prev) => (prev === 'Running...' ? msg + '\n' : prev + msg + '\n'));
    }});
    pyodideRef.current.setStderr({ batched: (msg) => {
      setOutput((prev) => (prev === 'Running...' ? `Error: ${msg}\n` : prev + `Error: ${msg}\n`));
    }});

    try {
      // Small delay to let React update UI before WASM blocks thread
      await new Promise(r => setTimeout(r, 50));
      const result = await pyodideRef.current.runPythonAsync(code);
      if (result !== undefined) {
        setOutput((prev) => prev + `\n[Return Value]: ${result}`);
      } else if (output === 'Running...') {
        setOutput('[Execution completed with no output]');
      }
    } catch (err) {
      setOutput(`Traceback:\n${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-border overflow-hidden shadow-2xl flex flex-col mt-4">
      <div className="bg-[#2d2d2d] border-b border-border/30 p-3 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white font-mono text-sm">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span>Local Python Sandbox (WASM)</span>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={runMode} 
            onChange={e => setRunMode(e.target.value)}
            className="bg-black/30 border border-border/50 text-xs px-2 py-1 rounded outline-none text-gray-300"
          >
            <option value="browser">Local Browser (WASM)</option>
            <option value="server">Cloud Server (Heavy Compute)</option>
          </select>
          {runMode === 'browser' && !isReady && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading Pyodide Kernel...
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runCode}
            disabled={(runMode === 'browser' && !isReady) || isRunning}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition"
          >
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            {isRunning ? 'Executing...' : 'Run'}
          </motion.button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-border/30 flex flex-col h-64">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-transparent text-gray-300 font-mono text-sm p-4 outline-none resize-none custom-scrollbar"
            spellCheck="false"
            placeholder="# Write Python code here..."
          />
        </div>
        
        <div className="bg-[#121212] flex flex-col h-64 relative">
          <div className="absolute top-2 left-3 text-xs text-gray-500 font-mono flex items-center gap-1">
            <Terminal className="w-3 h-3" /> Output Console
          </div>
          <pre className="flex-1 w-full text-green-400 font-mono text-xs p-4 pt-8 overflow-auto custom-scrollbar">
            {output}
          </pre>
        </div>
      </div>
      <div className={`border-t p-2 text-center text-xs flex items-center justify-center gap-2 ${runMode === 'browser' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
        <AlertTriangle className="w-3 h-3" />
        {runMode === 'browser' ? 'This code runs 100% securely inside your browser using WebAssembly. Server cost: $0.00' : 'This code runs securely in the Cloud Docker Sandbox for heavy compute.'}
      </div>
    </div>
  );
}
