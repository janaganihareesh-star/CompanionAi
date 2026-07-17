import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code2, Users, Cpu, CheckCircle2 } from 'lucide-react';

export default function AgentTerminal({ socket }) {
  const [logs, setLogs] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    
    const handleAgentStatus = (data) => {
      setIsActive(true);
      setLogs((prev) => [...prev, { time: new Date(), ...data }]);
    };

    socket.on('agent_status', handleAgentStatus);

    return () => {
      socket.off('agent_status', handleAgentStatus);
    };
  }, [socket]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    // Auto-hide after 5 seconds of inactivity if the final synthesis is done
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      if (lastLog.agent === 'Master Synthesis Agent') {
        const timer = setTimeout(() => setIsActive(false), 8000);
        return () => clearTimeout(timer);
      }
    }
  }, [logs]);

  const getAgentIcon = (agentName) => {
    if (agentName.includes('Planner')) return <Cpu className="w-4 h-4 text-emerald-400" />;
    if (agentName.includes('Execution')) return <Users className="w-4 h-4 text-blue-400" />;
    if (agentName.includes('Synthesis')) return <CheckCircle2 className="w-4 h-4 text-indigo-400" />;
    return <Code2 className="w-4 h-4 text-rose-400" />;
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          className="mx-4 mt-4 mb-2 bg-[#0d0d0d] rounded-xl overflow-hidden border border-[#333] shadow-2xl font-mono text-sm max-h-64 flex flex-col z-20"
        >
          <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-[#333]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 font-bold text-xs tracking-wider">MULTI-AGENT ORCHESTRATOR</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 animate-pulse"></div>
            </div>
          </div>
          <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2">
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <span className="text-gray-600 text-xs mt-0.5 whitespace-nowrap">
                  {log.time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {getAgentIcon(log.agent)}
                <div className="flex flex-col">
                  <span className="text-gray-300 font-semibold">{log.agent}</span>
                  <span className="text-emerald-400/80 text-xs">{log.status}</span>
                  {log.details && (
                    <div className="mt-1 text-gray-500 text-xs border-l-2 border-[#333] pl-2 whitespace-pre-wrap max-h-20 overflow-y-auto custom-scrollbar">
                      {log.details}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={endRef} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
