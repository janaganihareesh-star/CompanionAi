import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCpu, FiEye, FiActivity, FiCoffee, FiZap, FiUser, FiGlobe } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

// Synchronous Imports for Instant Loading and Animation Preservation
import TimeMachineOverlay from '../components/TimeMachineOverlay';
import MatrixDashboard from '../components/MatrixDashboard';
import AkashicRecordsUI from '../components/AkashicRecordsUI';
import GenesisPod from '../components/GenesisPod';
import CyberneticGastronomy from '../components/CyberneticGastronomy';
import EnergyCoreUI from '../components/EnergyCoreUI';
import SoulTransferBay from '../components/SoulTransferBay';
import UniverseSandbox from '../components/UniverseSandbox';

const CONCEPTS = [
  { id: 'time', name: 'Time Machine', icon: FiClock, description: 'Chrono-computation simulation.', color: 'text-amber-500', component: TimeMachineOverlay },
  { id: 'matrix', name: 'Matrix Terminal', icon: FiCpu, description: 'Reality warping console.', color: 'text-green-500', component: MatrixDashboard },
  { id: 'akashic', name: 'Akashic Records', icon: FiEye, description: 'Absolute omniscience core.', color: 'text-yellow-500', component: AkashicRecordsUI },
  { id: 'genesis', name: 'Genesis Pod', icon: FiActivity, description: 'Biological life synthesis.', color: 'text-emerald-500', component: GenesisPod },
  { id: 'haptic', name: 'Cyber Gastronomy', icon: FiCoffee, description: 'Tactile & bio-emulation.', color: 'text-rose-500', component: CyberneticGastronomy },
  { id: 'energy', name: 'Zero-Point Reactor', icon: FiZap, description: 'Infinite energy field.', color: 'text-cyan-500', component: EnergyCoreUI },
  { id: 'soul', name: 'Soul Transfer', icon: FiUser, description: 'Consciousness upload.', color: 'text-violet-500', component: SoulTransferBay },
  { id: 'universe', name: 'Universe Sandbox', icon: FiGlobe, description: '1:1 Universe rendering.', color: 'text-indigo-500', component: UniverseSandbox },
];

export default function ConceptLabPage() {
  const [activeConcept, setActiveConcept] = useState(null);

  const closeOverlay = () => setActiveConcept(null);

  return (
    <div className="flex min-h-screen bg-bg text-text relative overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 font-outfit">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-cyan-500 tracking-wider">Concept Lab</h1>
            <p className="text-muted mt-2">A hidden sandbox for theoretical, sci-fi, and metaphysical UI simulations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONCEPTS.map((concept) => (
              <motion.button
                key={concept.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveConcept(concept.id)}
                className="bg-surface border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all hover:bg-surface/80"
              >
                <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10 ${concept.color}`}>
                  <concept.icon size={28} />
                </div>
                <h3 className="font-bold text-lg text-text/90">{concept.name}</h3>
                <p className="text-xs text-muted mt-2">{concept.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* Render Active Overlay */}
      {CONCEPTS.map((concept) => {
        const OverlayComponent = concept.component;
        return (
          <OverlayComponent 
            key={concept.id}
            isOpen={activeConcept === concept.id} 
            onClose={closeOverlay} 
          />
        );
      })}
    </div>
  );
}
