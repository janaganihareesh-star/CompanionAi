import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Eye, X, Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CanvasArtifact({ code, language, onClose }) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [copied, setCopied] = useState(false);
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    // If it's HTML/React/JS, wrap it in a basic HTML structure to render safely
    if (language === 'html' || language === 'jsx' || language === 'javascript') {
      const isHtml = code.toLowerCase().includes('<html>') || code.toLowerCase().includes('<body');
         // Inject MediaRecorder logic if canvas is present
         const hasCanvas = code.toLowerCase().includes('<canvas');
         const recorderScript = hasCanvas ? `
           <script>
             window.onload = () => {
               const canvas = document.querySelector('canvas');
               if (!canvas) return;
               
               const btn = document.createElement('button');
               btn.innerText = '🎥 Record Video';
               btn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 10px 16px; background: #e11d48; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif;';
               document.body.appendChild(btn);

               let mediaRecorder;
               let recordedChunks = [];
               let isRecording = false;

               btn.onclick = () => {
                 if (!isRecording) {
                   const stream = canvas.captureStream(30);
                   mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                   mediaRecorder.ondataavailable = (e) => {
                     if (e.data.size > 0) recordedChunks.push(e.data);
                   };
                   mediaRecorder.onstop = () => {
                     const blob = new Blob(recordedChunks, { type: 'video/webm' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = 'animation_video.webm';
                     a.click();
                     URL.revokeObjectURL(url);
                     recordedChunks = [];
                   };
                   mediaRecorder.start();
                   isRecording = true;
                   btn.innerText = '⏹ Stop & Download Video';
                   btn.style.background = '#059669'; // emerald
                 } else {
                   mediaRecorder.stop();
                   isRecording = false;
                   btn.innerText = '🎥 Record Video';
                   btn.style.background = '#e11d48';
                 }
               };
             };
           </script>
         ` : '';

      if (isHtml) {
         if (hasCanvas) {
           const bodyCloseIndex = code.toLowerCase().lastIndexOf('</body>');
           if (bodyCloseIndex !== -1) {
             setSrcDoc(code.slice(0, bodyCloseIndex) + recorderScript + code.slice(bodyCloseIndex));
           } else {
             setSrcDoc(code + recorderScript);
           }
         } else {
           setSrcDoc(code);
         }
      } else {
         // Wrap plain HTML/JS snippets
         setSrcDoc(`
           <!DOCTYPE html>
           <html>
             <head>
               <script src="https://cdn.tailwindcss.com"></script>
               <style>body { margin: 0; padding: 1rem; font-family: sans-serif; background: #ffffff; color: #000; overflow: hidden; display: flex; justify-content: center; align-items: center; min-height: 100vh; }</style>
             </head>
             <body>
               ${code}
               ${recorderScript}
             </body>
           </html>
         `);
      }
    } else {
      // Fallback for plain text documents ('txt', 'md', etc.)
      setSrcDoc(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0; padding: 2rem; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff; color: #111; overflow-y: auto; line-height: 1.6;">
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: inherit;">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </body>
        </html>
      `);
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code copied!');
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artifact.${language === 'html' ? 'html' : 'js'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Artifact downloaded!');
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 h-full w-full md:w-[50vw] lg:w-[45vw] bg-surface border-l border-border shadow-2xl flex flex-col z-40"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/30 bg-panel/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent/20 text-accent rounded-lg">
             <Eye className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-text">Artifact Preview</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="flex bg-black/40 rounded-lg p-0.5 border border-border/50 mr-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${viewMode === 'preview' ? 'bg-panel text-accent shadow-sm' : 'text-muted hover:text-text'}`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${viewMode === 'code' ? 'bg-panel text-accent shadow-sm' : 'text-muted hover:text-text'}`}
            >
              Code
            </button>
          </div>

          <button onClick={handleCopy} className="p-1.5 text-muted hover:text-text hover:bg-panel rounded-lg transition" title="Copy Code">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={handleDownload} className="p-1.5 text-muted hover:text-text hover:bg-panel rounded-lg transition" title="Download">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition ml-1" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-white">
        {viewMode === 'preview' ? (
          <iframe 
            srcDoc={srcDoc}
            title="Artifact Preview"
            sandbox="allow-scripts allow-forms allow-popups allow-modals"
            className="w-full h-full border-none"
          />
        ) : (
          <div className="w-full h-full overflow-auto bg-[#1e1e1e] p-4">
            <pre className="text-sm font-mono text-gray-300">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
}
