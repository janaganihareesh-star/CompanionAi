import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useTheme from './hooks/useTheme';
import SplashScreen from './components/SplashScreen';
import { Loader2 } from 'lucide-react';
import { syncCRDTData } from './utils/crdtSyncEngine';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const OtpVerificationPage = lazy(() => import('./pages/OtpVerificationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));

// Onboarding Pages
const GenderSelectionPage = lazy(() => import('./pages/GenderSelectionPage'));
const RelationshipSelectionPage = lazy(() => import('./pages/RelationshipSelectionPage'));
const AINameSelectionPage = lazy(() => import('./pages/AINameSelectionPage'));

// Main App Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const VoicePage = lazy(() => import('./pages/VoicePage'));
const MemoryVaultPage = lazy(() => import('./pages/MemoryVaultPage'));
const DreamBoardPage = lazy(() => import('./pages/DreamBoardPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const LearningPage = lazy(() => import('./pages/LearningPage'));
const ResumeAnalyzerPage = lazy(() => import('./pages/ResumeAnalyzerPage'));
const MockInterviewPage = lazy(() => import('./pages/MockInterviewPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const WeeklyReflectionPage = lazy(() => import('./pages/WeeklyReflectionPage'));
const SummaryPage = lazy(() => import('./pages/SummaryPage'));
const PersonaPage = lazy(() => import('./pages/PersonaPage'));

// Career & Productivity
const CareerHubPage = lazy(() => import('./pages/CareerHubPage'));
const ResumeBuilderPage = lazy(() => import('./pages/ResumeBuilderPage'));
const CoverLetterPage = lazy(() => import('./pages/CoverLetterPage'));
const SalaryEnginePage = lazy(() => import('./pages/SalaryEnginePage'));
const ProjectBuilderPage = lazy(() => import('./pages/ProjectBuilderPage'));
const HabitTrackerPage = lazy(() => import('./pages/HabitTrackerPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

// Engines 35-46
const PluginStorePage = lazy(() => import('./pages/PluginStorePage'));
const DocumentGeneratorPage = lazy(() => import('./pages/DocumentGeneratorPage'));
const DocumentAIPage = lazy(() => import('./pages/DocumentAIPage'));
const CodeEnginePage = lazy(() => import('./pages/CodeEnginePage'));
const TranslatorPage = lazy(() => import('./pages/TranslatorPage'));
const PromptEngineerPage = lazy(() => import('./pages/PromptEngineerPage'));
const DataAnalysisPage = lazy(() => import('./pages/DataAnalysisPage'));
const ContentCreatorPage = lazy(() => import('./pages/ContentCreatorPage'));
const AcademicPage = lazy(() => import('./pages/AcademicPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const OfficialDraftsPage = lazy(() => import('./pages/OfficialDraftsPage'));
const BusinessPage = lazy(() => import('./pages/BusinessPage'));
const SharedChatView = lazy(() => import('./pages/SharedChatView'));
const WatchView = lazy(() => import('./pages/WatchView'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const ConceptLabPage = lazy(() => import('./pages/ConceptLabPage'));

const SuspenseFallback = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg relative">
    <Loader2 className="w-8 h-8 text-accent animate-spin mb-4 relative z-10" />
    <p className="text-muted text-sm font-medium animate-pulse relative z-10 font-outfit tracking-wide">Loading module...</p>
  </div>
);

export default function App() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  
  // Initialize theme properly
  React.useEffect(() => {
    const mode = localStorage.getItem('closer-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', mode);
  }, []);

  useEffect(() => {
    // CRDT Offline Sync Engine Trigger
    const handleOnline = async () => {
      console.log('🌍 Network restored. Triggering CRDT Sync Engine...');
      try {
        window.isCRDTSyncing = true;
        await syncCRDTData();
      } catch (err) {
        console.error('CRDT Sync failed:', err);
      } finally {
        window.isCRDTSyncing = false;
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="mesh-bg min-h-screen text-text transition-colors duration-500">
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<SuspenseFallback />}>
        <CommandPalette />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
            <Route path="/verify-otp" element={<PageTransition><OtpVerificationPage /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
            
            {/* Onboarding steps */}
            <Route path="/onboarding/gender" element={<PageTransition><GenderSelectionPage /></PageTransition>} />
            <Route path="/onboarding/name" element={<PageTransition><AINameSelectionPage /></PageTransition>} />
            <Route path="/onboarding/relationship" element={<PageTransition><RelationshipSelectionPage /></PageTransition>} />

            {/* Core application sections */}
            <Route path="/home" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/watch" element={<PageTransition><WatchView /></PageTransition>} />
            <Route path="/chat" element={<PageTransition><ChatPage /></PageTransition>} />
            <Route path="/chat/:id" element={<PageTransition><ChatPage /></PageTransition>} />
            <Route path="/share/:shareId" element={<PageTransition><SharedChatView /></PageTransition>} />
            <Route path="/voice" element={<PageTransition><VoicePage /></PageTransition>} />
            <Route path="/memory-vault" element={<PageTransition><MemoryVaultPage /></PageTransition>} />
            <Route path="/dreamboard" element={<PageTransition><DreamBoardPage /></PageTransition>} />
            <Route path="/goals" element={<PageTransition><GoalsPage /></PageTransition>} />
            <Route path="/achievements" element={<PageTransition><AchievementsPage /></PageTransition>} />
            <Route path="/learning" element={<PageTransition><LearningPage /></PageTransition>} />
            <Route path="/resume-analyzer" element={<PageTransition><ResumeAnalyzerPage /></PageTransition>} />
            <Route path="/mock-interview" element={<PageTransition><MockInterviewPage /></PageTransition>} />
            <Route path="/notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
            <Route path="/timeline" element={<PageTransition><TimelinePage /></PageTransition>} />
            <Route path="/weekly-reflection" element={<PageTransition><WeeklyReflectionPage /></PageTransition>} />
            <Route path="/summary" element={<PageTransition><SummaryPage /></PageTransition>} />
            <Route path="/persona" element={<PageTransition><PersonaPage /></PageTransition>} />

            {/* Section 107-110: Career Hub, Project Builder, Productivity, Search */}
            <Route path="/career" element={<PageTransition><CareerHubPage /></PageTransition>} />
            <Route path="/resume-builder" element={<PageTransition><ResumeBuilderPage /></PageTransition>} />
            <Route path="/cover-letter" element={<PageTransition><CoverLetterPage /></PageTransition>} />
            <Route path="/salary-engine" element={<PageTransition><SalaryEnginePage /></PageTransition>} />
            <Route path="/project-builder" element={<PageTransition><ProjectBuilderPage /></PageTransition>} />
            <Route path="/habits" element={<PageTransition><HabitTrackerPage /></PageTransition>} />
            <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />

            {/* Engines 35-46 & Tools Hub */}
            <Route path="/tools" element={<PageTransition><PluginStorePage /></PageTransition>} />
            <Route path="/tools/document-generator" element={<PageTransition><DocumentGeneratorPage /></PageTransition>} />
            <Route path="/tools/document-ai" element={<PageTransition><DocumentAIPage /></PageTransition>} />
            <Route path="/tools/code-engine" element={<PageTransition><CodeEnginePage /></PageTransition>} />
            <Route path="/tools/translator" element={<PageTransition><TranslatorPage /></PageTransition>} />
            <Route path="/tools/prompt-engineer" element={<PageTransition><PromptEngineerPage /></PageTransition>} />
            <Route path="/tools/data-analysis" element={<PageTransition><DataAnalysisPage /></PageTransition>} />
            <Route path="/tools/content-creator" element={<PageTransition><ContentCreatorPage /></PageTransition>} />
            <Route path="/tools/academic" element={<PageTransition><AcademicPage /></PageTransition>} />
            <Route path="/tools/calculator" element={<PageTransition><CalculatorPage /></PageTransition>} />
            <Route path="/tools/official-drafts" element={<PageTransition><OfficialDraftsPage /></PageTransition>} />
            <Route path="/tools/business" element={<PageTransition><BusinessPage /></PageTransition>} />
            
            {/* Concept Lab (Sci-Fi Features) */}
            <Route path="/concept-lab" element={<PageTransition><ConceptLabPage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}