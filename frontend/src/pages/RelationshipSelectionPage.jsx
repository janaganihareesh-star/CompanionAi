import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import axios from 'axios';
import confetti from 'canvas-confetti';
import ThemeToggle from '../components/ThemeToggle';
import { ArrowRight, ArrowLeft, Heart, HeartHandshake, Users, Star, Sparkles } from 'lucide-react';

const RELATIONSHIPS = [
  { value: 'formal', type: 'friend', emoji: '👔', label: 'Formal Professional', desc: 'Respectful, direct, and focused on tasks. Minimal emotional expression.' },
  { value: 'friendly', type: 'friend', emoji: '🤝', label: 'Casual Friendly', desc: 'Like a chill coworker or casual acquaintance. Light-hearted and helpful.' },
  { value: 'warm', type: 'friend', emoji: '💖', label: 'Warm Supportive', desc: 'Like a close friend who encourages you and actively supports your goals.' },
  { value: 'family', type: 'family', emoji: '🏡', label: 'Loving Family', desc: 'Like a caring parent or sibling. Very protective and affectionate.' },
  { value: 'very_caring', type: 'companion', emoji: '🥺', label: 'Very Caring & Empathic', desc: 'Deeply emotional, affectionate, and deeply invested in your well-being.' },
  { value: 'mentor', type: 'friend', emoji: '🎯', label: 'Strict Mentor', desc: 'Disciplined and motivating. Pushes you hard to achieve your goals without excuses.' }
];

export default function RelationshipSelectionPage() {
  const navigate = useNavigate();
  const [selectedRel, setSelectedRel] = useState('friendly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRel = (rel) => {
    setSelectedRel(rel.value);
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('closer-token');
      const selectedOption = RELATIONSHIPS.find(r => r.value === selectedRel);
      await axios.post(
        '/api/profile/relationship',
        {
          relationshipType: selectedOption.type,
          relationshipBoundary: selectedOption.value
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Trigger Confetti explosion on completion of onboarding
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        navigate('/home');
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between relative p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Progress (3 steps total) */}
      <div className="flex justify-center gap-3 mt-4">
        <div className="w-2 h-2 rounded-full bg-accent" />
        <div className="w-2 h-2 rounded-full bg-accent" />
        <div className="w-8 h-2 rounded-full bg-accent" />
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl mx-auto bg-surface/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_40px_rgba(167,139,250,0.15)] px-6 py-6 md:px-8 md:py-8 my-auto relative z-10 flex flex-col justify-center transform transition-all hover:shadow-[0_0_50px_rgba(167,139,250,0.25)]">

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8 flex-1 relative z-10"
        >
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-accent/20 to-fuchsia-500/20 text-accent text-xs font-bold tracking-widest uppercase border border-accent/20 shadow-[0_0_15px_rgba(167,139,250,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 3 • Vibe & Persona</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-r from-text via-text to-muted tracking-tight">Companion Vibe & Persona</h2>
            <p className="text-muted text-sm md:text-base max-w-lg mx-auto font-medium">Choose how Companion AI should emotionally connect with you.</p>
          </div>

          {/* Cards Grid */}
          <LayoutGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
              {RELATIONSHIPS.map((rel) => {
                const isSelected = selectedRel === rel.value;
                return (
                  <motion.div
                    layout
                    key={rel.value}
                    onClick={() => handleSelectRel(rel)}
                    className={`relative p-5 rounded-3xl transition-all duration-500 cursor-pointer flex flex-col overflow-hidden group ${
                      isSelected
                        ? 'border-2 border-transparent bg-panel shadow-[0_0_50px_rgba(167,139,250,0.2)] scale-[1.03] -translate-y-1'
                        : 'border border-border/40 bg-surface/40 hover:bg-surface hover:border-accent/30 hover:shadow-2xl hover:-translate-y-0.5'
                    }`}
                    style={isSelected ? {
                      backgroundImage: 'linear-gradient(var(--color-panel), var(--color-panel)), linear-gradient(135deg, var(--color-accent), #d946ef)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                    } : {}}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-fuchsia-500/10 pointer-events-none" />
                    )}
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl text-2xl transition-all duration-500 ${isSelected ? 'bg-gradient-to-br from-accent to-fuchsia-500 shadow-lg shadow-accent/40 text-white' : 'bg-panel border border-border/70 group-hover:bg-accent/10 group-hover:border-accent/30'}`}>
                          {rel.emoji}
                        </div>
                        <h3 className={`font-extrabold text-lg leading-tight transition-colors duration-300 ${isSelected ? 'text-transparent bg-clip-text bg-gradient-to-r from-accent to-fuchsia-400' : 'text-text group-hover:text-accent/90'}`}>{rel.label}</h3>
                      </div>
                      <p className="text-xs text-muted leading-relaxed font-medium mt-auto">{rel.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>
        </motion.div>

        <div className="flex justify-between pt-8 border-t border-border/40 mt-6 relative z-10">
          <button
            onClick={() => navigate('/onboarding/name')}
            className="px-6 py-3.5 bg-panel/50 backdrop-blur-md border border-border text-text font-semibold rounded-2xl hover:bg-panel transition-all flex items-center gap-2 cursor-pointer text-sm hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-8 py-3.5 bg-gradient-to-r from-accent to-fuchsia-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm shadow-[0_0_25px_rgba(167,139,250,0.4)] hover:shadow-[0_0_35px_rgba(167,139,250,0.6)] hover:-translate-y-0.5"
          >
            {isLoading ? 'Saving...' : 'Complete Onboarding'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted mt-4">Step 3 of 3 • Vibe & Persona</div>
    </div>
  );
}
