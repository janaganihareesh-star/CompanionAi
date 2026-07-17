import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Terminal, Activity } from 'lucide-react';

export default function LiveSwarmPanel() {
  const codeStream = useSelector(state => state.chat.liveCodeStream || '');
  const containerRef = useRef(null);

  // Auto-scroll to bottom as code streams in
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [codeStream]);

  if (!codeStream) return null;

  return (
    <div className="bg-[#050511] border border-[#330033] rounded-lg m-4 shadow-[0_0_15px_rgba(255,0,255,0.2)] overflow-hidden flex flex-col h-64">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A3E] border-b border-[#330033]">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-[#FF00FF]" />
          <span className="text-xs font-bold text-[#FF00FF] tracking-wider uppercase">Live Swarm Execution</span>
        </div>
        <Activity size={16} className="text-[#00FFCC] animate-pulse" />
      </div>
      <div 
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-sm text-[#00FFCC] whitespace-pre-wrap"
      >
        {codeStream}
        <span className="animate-ping inline-block w-2 h-4 bg-[#FF00FF] ml-1 align-middle" />
      </div>
    </div>
  );
}
