import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert, Check, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function OSExecutionApprovalModal({ isOpen, onClose, command, token }) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);

  const handleApprove = async () => {
    setIsExecuting(true);
    try {
      const res = await axios.post('/api/os/execute', { command }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
      toast.success('Command executed successfully!');
    } catch (err) {
      setResult({ error: err.response?.data?.message || err.message });
      toast.error('Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface border border-border/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
        >
          <div className="flex items-center gap-3 text-rose-500">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <h3 className="text-xl font-bold font-outfit text-text">OS Execution Requested</h3>
          </div>
          
          <p className="text-muted text-sm">
            CloserAI is requesting permission to execute the following command <strong className="text-rose-500">directly on your Local Host Machine</strong>.
            <br/>This is not a sandbox. Only approve commands you trust.
          </p>

          <div className="bg-bg border border-border p-3 rounded-lg font-mono text-sm text-accent overflow-x-auto">
            {command}
          </div>

          {result && (
            <div className="bg-bg border border-border p-3 rounded-lg font-mono text-xs overflow-y-auto max-h-40">
              {result.stdout && <div className="text-emerald-400 whitespace-pre-wrap">{result.stdout}</div>}
              {result.stderr && <div className="text-rose-400 whitespace-pre-wrap">{result.stderr}</div>}
              {result.error && <div className="text-rose-400 whitespace-pre-wrap">{result.error}</div>}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-panel hover:bg-panel/80 text-text transition-colors"
            >
              Close
            </button>
            {!result && (
              <button 
                onClick={handleApprove}
                disabled={isExecuting}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white transition-colors flex items-center gap-2"
              >
                {isExecuting ? 'Executing...' : 'Approve & Run'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
