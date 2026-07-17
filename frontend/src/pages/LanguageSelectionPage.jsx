import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import { Sparkles, ArrowRight } from 'lucide-react';

import LanguageSelector from '../components/LanguageSelector';

const LANGUAGES = [
  'English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam',
  'Bengali', 'Marathi', 'Gujarati', 'Odia', 'Punjabi', 'Urdu'
];

export default function LanguageSelectionPage() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('English');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('closer-token');
      await axios.post(
        '/api/profile/language',
        { language: selectedLang },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/onboarding/gender');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200 } }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between relative p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-3 h-3 rounded-full bg-accent" />
        <div className="w-3 h-3 rounded-full border-2 border-border" />
        <div className="w-3 h-3 rounded-full border-2 border-border" />
        <div className="w-3 h-3 rounded-full border-2 border-border" />
        <div className="w-3 h-3 rounded-full border-2 border-border" />
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto w-full bg-surface border border-border rounded-2xl shadow-card p-8 my-8 flex-1 flex flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold font-outfit text-text">Choose Language</h2>
            <p className="text-muted text-sm">Select the language your companion should converse in.</p>
          </div>

          <LanguageSelector
            languages={LANGUAGES}
            selectedLang={selectedLang}
            setSelectedLang={setSelectedLang}
            containerVariants={containerVariants}
            cardVariants={cardVariants}
          />
        </motion.div>

        <div className="flex justify-end pt-8">
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted">Step 1 of 5 • Choose Language</div>
    </div>
  );
}
