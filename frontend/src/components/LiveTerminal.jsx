import React, { useEffect, useRef, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useDropzone } from 'react-dropzone';
import 'xterm/css/xterm.css';
import useSocket from '../hooks/useSocket';
import { Upload } from 'lucide-react';

const LiveTerminal = ({ isVisible = true }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const { socket } = useSocket();

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      // In a real desktop app, we'd get the full path. In browser, we just get name.
      // Assuming Electron gives us file.path
      const filePath = file.path || file.name;
      if (socket && xtermRef.current) {
        socket.emit('terminal:input', `"${filePath}" `);
        xtermRef.current.focus();
      }
    });
  }, [socket]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: { background: '#0B0F19', foreground: '#E2E8F0', cursor: '#10B981' },
      fontFamily: '"Fira Code", monospace',
      fontSize: 13,
      convertEol: true
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.onData((data) => {
      if (socket) socket.emit('terminal:input', data);
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  useEffect(() => {
    if (!socket || !xtermRef.current) return;
    const handleData = (data) => xtermRef.current.write(data);
    socket.on('terminal:data', handleData);
    return () => socket.off('terminal:data', handleData);
  }, [socket]);

  useEffect(() => {
    if (isVisible && fitAddonRef.current) {
      setTimeout(() => fitAddonRef.current.fit(), 100);
    }
  }, [isVisible]);

  return (
    <div 
      {...getRootProps()}
      className={`w-full h-full p-2 bg-[#0B0F19] rounded-lg overflow-hidden relative ${isDragActive ? 'border-2 border-dashed border-emerald-500' : ''}`}
      style={{ display: isVisible ? 'block' : 'none' }}
    >
      <input {...getInputProps()} />
      {isDragActive && (
        <div className="absolute inset-0 bg-emerald-900/30 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center text-emerald-400">
            <Upload className="w-12 h-12 mb-2 animate-bounce" />
            <p className="font-mono text-sm">Drop files to paste path into terminal</p>
          </div>
        </div>
      )}
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
};

export default LiveTerminal;
