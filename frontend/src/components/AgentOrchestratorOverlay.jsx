import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Cpu, Database, Network, Search, CheckCircle2, Loader2 } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import { useSelector } from 'react-redux';

export default function AgentOrchestratorOverlay() {
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSocket();
  const [agents, setAgents] = useState([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleAgentStart = (data) => {
      setIsActive(true);
      setAgents(prev => {
        const copy = [...prev];
        const existing = copy.find(a => a.name === data.agent);
        if (!existing) {
          copy.push({ id: Date.now(), name: data.agent, status: 'started', message: data.message });
        } else {
          existing.status = 'started';
          existing.message = data.message;
        }
        return copy;
      });
    };

    const handleAgentThought = (data) => {
      setAgents(prev => {
        const copy = [...prev];
        const existing = copy.find(a => a.name === data.agent);
        if (existing) {
          existing.message = data.message;
          existing.status = 'thinking';
        } else {
          copy.push({ id: Date.now(), name: data.agent, status: 'thinking', message: data.message });
        }
        return copy;
      });
    };

    const handleAgentComplete = (data) => {
      setAgents(prev => {
        const copy = [...prev];
        const existing = copy.find(a => a.name === data.agent);
        if (existing) {
          existing.status = 'completed';
          existing.message = 'Task completed successfully.';
        }
        return copy;
      });

      // If Orchestrator completes, fade out after a short delay
      if (data.agent === 'Orchestrator') {
        setTimeout(() => {
          setIsActive(false);
          setAgents([]);
        }, 4000);
      }
    };

    socket.on('agent:start', handleAgentStart);
    socket.on('agent:thought', handleAgentThought);
    socket.on('agent:complete', handleAgentComplete);

    return () => {
      socket.off('agent:start', handleAgentStart);
      socket.off('agent:thought', handleAgentThought);
      socket.off('agent:complete', handleAgentComplete);
    };
  }, [socket]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mb-4 bg-bg/60 backdrop-blur-md border border-border/40 p-4 rounded-xl shadow-xl flex flex-col gap-3 max-w-2xl w-full mx-auto"
      >
        <div className="flex items-center gap-3 border-b border-border/30 pb-2">
          <BrainCircuit className="text-primary w-5 h-5 animate-pulse" />
          <span className="text-sm font-semibold text-text uppercase tracking-wider font-outfit">Multi-Agent Workflow OS Active</span>
        </div>
        
        <div className="flex flex-col gap-2">
          {agents.map((agent) => (
            <motion.div 
              key={agent.name}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-start gap-3 bg-white/5 p-3 rounded-lg"
            >
              {agent.status === 'completed' ? (
                <CheckCircle2 className="text-green-500 w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <Loader2 className="text-secondary w-5 h-5 shrink-0 mt-0.5 animate-spin" />
              )}
              
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary uppercase">{agent.name} Agent</span>
                <span className="text-sm text-text/80">{agent.message}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
