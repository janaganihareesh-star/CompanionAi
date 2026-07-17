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
      <aside className={`fixed inset-y-0 left-0 w-64 bg-surface border-r border-border flex flex-col justify-between h-screen z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Top Section */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-xl tracking-wide font-outfit text-text">
              <Sparkles className="w-6 h-6 text-accent" />
              <span>CloserAI</span>
            </div>
            <button className="md:hidden p-1 text-muted" onClick={() => setIsMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="hidden md:block absolute right-4 top-5">
            <ThemeToggle />
          </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-3 bg-panel rounded-xl border border-border">
          <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg">
            {user ? user.fullName[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-text truncate">{user ? user.fullName : 'User'}</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-semibold inline-block mt-0.5">
              {bondName}
            </span>
          </div>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-panel border-l-4 border-accent text-accent'
                    : 'text-muted hover:bg-panel hover:text-text'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-border/40 space-y-4">
        {/* Push Notification Toggle */}
        <button
          onClick={async () => {
            const { subscribeToPushNotifications } = await import('../utils/pushManager');
            const success = await subscribeToPushNotifications();
            if (success) alert('Web Push Notifications Enabled successfully!');
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-panel border border-border text-text hover:border-accent transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Enable Push OS</span>
          </div>
        </button>


        {/* Bond Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted">Bond with {companionName}</span>
            <span className="text-accent">{bondPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-panel border border-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full"
              style={{ width: `${bondPercentage}%`, transition: 'width 0.8s ease' }}
            />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose hover:bg-rose/10 transition cursor-pointer text-left"
        >
          <LogOut className="w-5 h-5 text-rose" />
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
    </>
  );
}