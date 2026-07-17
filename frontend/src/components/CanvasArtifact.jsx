import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Eye, X, Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CanvasArtifact({ code, language, onClose }) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [copied, setCopied] = useState(false);
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    if (!code) {
      setSrcDoc(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0; padding: 2rem; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff; color: #111; overflow-y: auto; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
            <h2 style="color: #666; font-weight: 500;">Document is empty or could not be loaded.</h2>
          </body>
        </html>
      `);
      return;
    }
    
    // Add safety for non-string code
    let safeCode = '';
    try {
      safeCode = typeof code === 'string' ? code : String(code);
    } catch (err) {
      safeCode = 'Error reading document content.';
    }

    if (language === 'html' || language === 'jsx' || language === 'javascript') {
      const isHtml = safeCode.includes('<html') || safeCode.includes('<!DOCTYPE') || safeCode.includes('<body') || safeCode.includes('<div');
      const hasCanvas = safeCode.includes('<canvas');
      
      const recorderScript = hasCanvas ? `
            <script>
              window.onload = () => {
                const canvas = document.querySelector('canvas');
                if (!canvas) return;
                
                const stream = canvas.captureStream(30);
                let mediaRecorder;
                let recordedChunks = [];
                let isRecording = false;

                const btn = document.createElement('button');
                btn.innerText = '🎥 Record Video';
                btn.style.position = 'fixed';
                btn.style.bottom = '20px';
                btn.style.right = '20px';
                btn.style.padding = '10px 20px';
                btn.style.background = '#e11d48';
                btn.style.color = '#fff';
                btn.style.border = 'none';
                btn.style.borderRadius = '50px';
                btn.style.cursor = 'pointer';
                btn.style.fontFamily = 'sans-serif';
                btn.style.fontWeight = 'bold';
                btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                btn.style.zIndex = '9999';
                document.body.appendChild(btn);

                btn.onclick = () => {
                  if (!isRecording) {
                    recordedChunks = [];
                    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                    mediaRecorder.ondataavailable = (e) => {
                      if (e.data.size > 0) recordedChunks.push(e.data);
                    };
                    mediaRecorder.onstop = () => {
                      const blob = new Blob(recordedChunks, { type: 'video/webm' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'canvas-recording.webm';
                      a.click();
                      URL.revokeObjectURL(url);
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
           const bodyCloseIndex = safeCode.toLowerCase().lastIndexOf('</body>');
           if (bodyCloseIndex !== -1) {
             setSrcDoc(safeCode.slice(0, bodyCloseIndex) + recorderScript + safeCode.slice(bodyCloseIndex));
           } else {
             setSrcDoc(safeCode + recorderScript);
           }
         } else {
           setSrcDoc(safeCode);
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
               ${safeCode}
               ${recorderScript}
             </body>
           </html>
         `);
      }
    } else {
      // Check if it's a markdown-like content to format it a bit nicer, or just plain text
      setSrcDoc(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0; padding: 2rem; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff; color: #111; overflow-y: auto; line-height: 1.6;">
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: inherit; font-size: 14px;">${safeCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-3xl aspect-square bg-surface border border-border/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col z-50 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/30 bg-panel/50 backdrop-blur-md shrink-0">
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

            <button onClick={handleCopy} className="p-1.5 text-muted hover:text-text hover:bg-panel rounded-lg transition cursor-pointer" title="Copy Code">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={handleDownload} className="p-1.5 text-muted hover:text-text hover:bg-panel rounded-lg transition cursor-pointer" title="Download">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition ml-1 cursor-pointer" title="Close">
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
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap break-words">
                <code>{code}</code>
              </pre>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
