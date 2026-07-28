import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useTheme from './hooks/useTheme';
import SplashScreen from './components/SplashScreen';
import { Loader2 } from 'lucide-react';
import { syncCRDTData } from './utils/crdtSyncEngine';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

// Wrapper to automatically reload the page if a lazy-loaded chunk fails to fetch
// This happens when a new version is deployed and the browser cache tries to load old chunk names.
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('retry-lazy-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('retry-lazy-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('retry-lazy-refreshed', 'true');
        return window.location.reload(true);
      }
      throw error;
    }
  });

const LandingPage = lazyWithRetry(() => import('./pages/LandingPage'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage'));
const OtpVerificationPage = lazyWithRetry(() => import('./pages/OtpVerificationPage'));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/ForgotPasswordPage'));

// Onboarding Pages
const GenderSelectionPage = lazyWithRetry(() => import('./pages/GenderSelectionPage'));
const RelationshipSelectionPage = lazyWithRetry(() => import('./pages/RelationshipSelectionPage'));
const AINameSelectionPage = lazyWithRetry(() => import('./pages/AINameSelectionPage'));

// Main App Pages
const HomePage = lazyWithRetry(() => import('./pages/HomePage'));
const ChatPage = lazyWithRetry(() => import('./pages/ChatPage'));
const VoicePage = lazyWithRetry(() => import('./pages/VoicePage'));
const MemoryVaultPage = lazyWithRetry(() => import('./pages/MemoryVaultPage'));
const DreamBoardPage = lazyWithRetry(() => import('./pages/DreamBoardPage'));
const GoalsPage = lazyWithRetry(() => import('./pages/GoalsPage'));
const AchievementsPage = lazyWithRetry(() => import('./pages/AchievementsPage'));
const LearningPage = lazyWithRetry(() => import('./pages/LearningPage'));
const ResumeAnalyzerPage = lazyWithRetry(() => import('./pages/ResumeAnalyzerPage'));
const MockInterviewPage = lazyWithRetry(() => import('./pages/MockInterviewPage'));
const NotificationsPage = lazyWithRetry(() => import('./pages/NotificationsPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));
const SettingsPage = lazyWithRetry(() => import('./pages/SettingsPage'));
const TimelinePage = lazyWithRetry(() => import('./pages/TimelinePage'));
const WeeklyReflectionPage = lazyWithRetry(() => import('./pages/WeeklyReflectionPage'));
const SummaryPage = lazyWithRetry(() => import('./pages/SummaryPage'));
const PersonaPage = lazyWithRetry(() => import('./pages/PersonaPage'));

// Career & Productivity
const CareerHubPage = lazyWithRetry(() => import('./pages/CareerHubPage'));
const ResumeBuilderPage = lazyWithRetry(() => import('./pages/ResumeBuilderPage'));
const CoverLetterPage = lazyWithRetry(() => import('./pages/CoverLetterPage'));
const SalaryEnginePage = lazyWithRetry(() => import('./pages/SalaryEnginePage'));
const ProjectBuilderPage = lazyWithRetry(() => import('./pages/ProjectBuilderPage'));
const HabitTrackerPage = lazyWithRetry(() => import('./pages/HabitTrackerPage'));
const SearchPage = lazyWithRetry(() => import('./pages/SearchPage'));

// Engines 35-46
const PluginStorePage = lazyWithRetry(() => import('./pages/PluginStorePage'));
const DocumentGeneratorPage = lazyWithRetry(() => import('./pages/DocumentGeneratorPage'));
const DocumentAIPage = lazyWithRetry(() => import('./pages/DocumentAIPage'));
const CodeEnginePage = lazyWithRetry(() => import('./pages/CodeEnginePage'));
const TranslatorPage = lazyWithRetry(() => import('./pages/TranslatorPage'));
const PromptEngineerPage = lazyWithRetry(() => import('./pages/PromptEngineerPage'));
const DataAnalysisPage = lazyWithRetry(() => import('./pages/DataAnalysisPage'));
const ContentCreatorPage = lazyWithRetry(() => import('./pages/ContentCreatorPage'));
const AcademicPage = lazyWithRetry(() => import('./pages/AcademicPage'));
const CalculatorPage = lazyWithRetry(() => import('./pages/CalculatorPage'));
const OfficialDraftsPage = lazyWithRetry(() => import('./pages/OfficialDraftsPage'));
const BusinessPage = lazyWithRetry(() => import('./pages/BusinessPage'));
const SharedChatView = lazyWithRetry(() => import('./pages/SharedChatView'));
const WatchView = lazyWithRetry(() => import('./pages/WatchView'));
const CommandPalette = lazyWithRetry(() => import('./components/CommandPalette'));
const ConceptLabPage = lazyWithRetry(() => import('./pages/ConceptLabPage'));

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