import React, { useState, useEffect } from 'react';
import { Smartphone, Battery, Cpu, Wifi, Plus, Trash2, Loader, Glasses, Speaker, Watch, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const HARDWARE_MODELS = [
  { id: 'pocket_ai', name: 'CloserAI Pocket Companion', type: 'smart_companion', icon: Smartphone, desc: 'A dedicated pocket AI device with voice interface.' },
  { id: 'vision_glasses', name: 'CloserAI Vision Glasses', type: 'smart_glasses', icon: Glasses, desc: 'AR glasses with real-time world recognition.' },
  { id: 'home_hub', name: 'CloserAI Home Speaker', type: 'smart_speaker', icon: Speaker, desc: 'Voice-controlled smart home speaker.' },
  { id: 'neural_watch', name: 'CloserAI Neural Watch', type: 'smart_watch', icon: Watch, desc: 'Wrist-worn AI assistant for quick tasks.' },
];

export default function HardwareManager() {
  const [devices, setDevices] = useState([]);
  const [isPairing, setIsPairing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/api/hardware/devices');
      setDevices(res.data);
    } catch (err) {
      toast.error('Failed to load hardware devices');
    } finally {
      setLoading(false);
    }
  };

  const pairDevice = async (model) => {
    setIsPairing(true);
    setShowModal(false);
    try {
      // Simulating physical pairing sequence
      const newDeviceId = 'dev_' + Math.random().toString(36).substr(2, 9);
      await api.post('/api/hardware/devices/pair', {
        deviceId: newDeviceId,
        name: model.name,
        type: model.type
      });
      toast.success(`${model.name} paired successfully!`);
      fetchDevices();
    } catch (err) {
      toast.error('Pairing failed');
    } finally {
      setIsPairing(false);
    }
  };

  const removeDevice = async (id) => {
    if (!window.confirm('Unpair this device?')) return;
    try {
      await api.delete(`/api/hardware/devices/${id}`);
      toast.success('Device unpaired');
      fetchDevices();
    } catch (err) {
      toast.error('Failed to remove device');
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'smart_glasses': return <Glasses className="w-6 h-6 text-emerald-400" />;
      case 'smart_speaker': return <Speaker className="w-6 h-6 text-emerald-400" />;
      case 'smart_watch': return <Watch className="w-6 h-6 text-emerald-400" />;
      default: return <Smartphone className="w-6 h-6 text-emerald-400" />;
    }
  };

  if (loading) return <div className="text-muted p-4">Loading hardware status...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-outfit text-text flex items-center gap-2">
            <Cpu className="text-accent w-6 h-6" />
            Hardware Hub
          </h3>
          <p className="text-sm text-muted">Manage your physical CloserAI companion devices.</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowModal(true)}
          disabled={isPairing}
          className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
        >
          {isPairing ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Pair New Device
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.length === 0 ? (
          <div className="col-span-full bg-surface border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <Cpu className="w-12 h-12 text-muted mb-4 opacity-50" />
            <h4 className="text-lg font-bold text-gray-300">No Devices Paired</h4>
            <p className="text-sm text-gray-500 max-w-sm mt-2">Pair a physical smart companion device to access CloserAI natively.</p>
          </div>
        ) : (
          devices.map(device => (
            <div key={device.id} className="bg-surface border border-white/10 rounded-2xl p-5 hover:border-accent/50 transition relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-panel p-2 rounded-lg border border-white/5">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-text leading-tight">{device.name}</h4>
                    <span className="text-xs text-muted font-mono">{device.id}</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => removeDevice(device.id)}
                  className="p-1.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="bg-panel p-2 rounded-lg flex items-center gap-2 border border-white/5">
                  <Battery className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-300">{device.batteryLevel}% Battery</span>
                </div>
                <div className="bg-panel p-2 rounded-lg flex items-center gap-2 border border-white/5">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-300">Connected</span>
                </div>
                <div className="col-span-2 bg-panel p-2 rounded-lg border border-white/5 text-gray-400 font-mono">
                  Firmware: v{device.fwVersion} | IP: {device.ip}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pairing Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-surface border border-border shadow-2xl rounded-2xl p-6 w-full max-w-lg relative"
            >
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-muted hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold font-outfit mb-2 text-white">Select Device to Pair</h2>
              <p className="text-sm text-muted mb-6">Choose the physical hardware model you want to connect to CloserAI.</p>
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {HARDWARE_MODELS.map(model => (
                  <div 
                    key={model.id}
                    onClick={() => pairDevice(model)}
                    className="flex items-center gap-4 p-4 border border-white/5 hover:border-accent/50 bg-panel hover:bg-panel/80 rounded-xl cursor-pointer transition group"
                  >
                    <div className="bg-surface p-3 rounded-lg group-hover:scale-110 transition text-accent">
                      <model.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{model.name}</h4>
                      <p className="text-xs text-muted mt-1">{model.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
