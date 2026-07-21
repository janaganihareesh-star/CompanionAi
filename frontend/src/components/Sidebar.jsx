import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRelationshipStats, fetchPreferences } from '../store/settingsSlice';
import ThemeToggle from './ThemeToggle';
import {
  Home, MessageSquare, Mic, Brain, Target, Compass,
  FileText, Briefcase, GraduationCap, User, Settings, Sparkles, LogOut, Wand2, Menu, X, FolderOpen
} from 'lucide-react';
import Tooltip from './Tooltip';
import { logout } from '../store/authSlice';

const NAV_ITEMS = [
  { path: '/home', label: 'Dashboard', icon: Home },
  { path: '/chat', label: 'Chat Companion', icon: MessageSquare },
  { path: '/goals', label: 'Goal Tracker', icon: Target },
  { path: '/dreamboard', label: 'Dream Board', icon: Compass },
  { path: '/tools', label: 'App Store (Plugins)', icon: Wand2 },
  { path: '/concept-lab', label: 'Concept Lab', icon: Sparkles },
  { path: '/profile', label: 'My Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const stats = useSelector((state) => state.settings.stats);
  const pref = useSelector((state) => state.settings.preferences);

  useEffect(() => {
    dispatch(fetchRelationshipStats());
    dispatch(fetchPreferences());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const currentPath = location.pathname;

  const bondPercentage = stats ? stats.trustScore : 10;
  const companionName = pref ? pref.aiName : 'Companion';
  const bondName = stats ? stats.bondLevelName : 'New Friend';

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 bg-surface border border-border rounded-xl text-text shadow-card hover:bg-panel transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-surface/90 backdrop-blur-xl border-r border-border/50 flex flex-col justify-between h-screen z-50 transform transition-all duration-300 md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.5)]' : '-translate-x-full'}`}>
        
        {/* Top Section */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3 font-bold text-2xl tracking-wide font-outfit">
              <div className="relative">
                <div className="absolute inset-0 bg-accent blur-md opacity-40 rounded-full animate-pulse"></div>
                <img src="/logo.png" alt="Companion AI Logo" className="relative w-9 h-9 object-contain rounded-full ring-2 ring-accent/60" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Companion AI</span>
            </div>
            <button className="md:hidden p-1.5 text-muted hover:text-white bg-white/5 rounded-lg transition" onClick={() => setIsMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="hidden md:block absolute right-4 top-6">
            <ThemeToggle />
          </div>



        {/* Navigation Items */}
        <nav className="space-y-1.5 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer text-left group ${
                  isActive
                    ? 'bg-gradient-to-r from-accent/20 to-transparent border-l-4 border-accent text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-muted hover:bg-white/5 hover:text-gray-200 hover:translate-x-1 border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-accent' : 'text-muted group-hover:text-gray-200 group-hover:scale-110'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section Card */}
      <div className="p-5 mx-4 mb-5 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 space-y-5 shadow-lg backdrop-blur-md relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-[40px] pointer-events-none"></div>

        {/* Push Notification Toggle */}
        <button
          onClick={async () => {
            const { subscribeToPushNotifications } = await import('../utils/pushManager');
            const success = await subscribeToPushNotifications();
            if (success) alert('Web Push Notifications Enabled successfully!');
          }}
          className="w-full relative group overflow-hidden rounded-xl p-[1px] transition-transform hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/40 via-accent/40 to-emerald-500/40 opacity-40 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-surface/90 text-gray-200 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="tracking-wide uppercase">Enable Push OS</span>
            </div>
          </div>
        </button>


        {/* Bond Progress */}
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-400">Bond with {companionName}</span>
            <span className="text-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">{bondPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 rounded-full relative"
              style={{ width: `${bondPercentage}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white/40 to-transparent blur-[1px]"></div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent relative z-10"></div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 cursor-pointer relative z-10 group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="uppercase tracking-widest">Disconnect</span>
        </button>
      </div>
    </aside>
    </>
  );
}