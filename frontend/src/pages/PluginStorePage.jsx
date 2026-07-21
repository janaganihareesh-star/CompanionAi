import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, X, ExternalLink, Search, BarChart3, Activity, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

export const MOCK_PLUGINS = [
  // FEATURED (12 plugins)
  { id: 'adobe_photoshop', name: 'Adobe Photoshop', iconText: 'Ps', iconBg: '#001E36', iconColor: '#31A8FF', desc: 'Edit & transform your images', category: 'Featured', developer: 'Adobe Inc.', website: 'adobe.com', version: '3.0.0', capabilities: 'Interactive, Writes', longDesc: 'Adobe Photoshop for ChatGPT makes powerful photo editing simple and free for everyone. Just upload a photo and transform it in seconds.' },
  { id: 'canva', name: 'Canva', iconText: 'C', iconBg: '#00C4CC', iconColor: '#FFFFFF', desc: 'Search, create, edit designs', category: 'Featured', developer: 'Canva Pty Ltd', website: 'canva.com', version: '1.2.5', capabilities: 'Interactive', longDesc: 'Design anything in seconds. Generate presentations, logos, social media posts and more directly through chat.' },
  { id: 'figma', name: 'Figma', iconText: 'F', iconBg: '#F24E1E', iconColor: '#FFFFFF', desc: 'Turn code into editable design', category: 'Featured', developer: 'Figma, Inc.', website: 'figma.com', version: '2.1.0', capabilities: 'Interactive, Reads', longDesc: 'Bridge the gap between design and development. Convert your textual descriptions into fully editable Figma layouts instantly.' },
  { id: 'replit', name: 'Replit', iconText: 'R', iconBg: '#F26207', iconColor: '#FFFFFF', desc: 'Turn your ideas into real apps', category: 'Featured', developer: 'Replit', website: 'replit.com', version: '1.0.0', capabilities: 'Interactive, Executes', longDesc: 'Run, build, and deploy code from your chat. Supports over 50 languages and instant hosting.' },
  { id: 'tripadvisor', name: 'Tripadvisor', iconText: 'T', iconBg: '#34E0A1', iconColor: '#000000', desc: 'Book top-rated hotels', category: 'Featured', developer: 'Tripadvisor LLC', website: 'tripadvisor.com', version: '4.2.1', capabilities: 'Interactive, Reads', longDesc: 'Find the best places to stay, eat, and visit. Get personalized travel itineraries powered by millions of reviews.' },
  { id: 'airtable', name: 'Airtable', iconText: 'A', iconBg: '#000000', iconColor: '#FFFFFF', desc: 'Add structured data to ChatGPT', category: 'Featured', developer: 'Formagrid Inc', website: 'airtable.com', version: '1.1.0', capabilities: 'Interactive, Writes, Reads', longDesc: 'Query your Airtable bases naturally. Create records, summarize tables, and build reports effortlessly.' },
  { id: 'spotify', name: 'Spotify', iconText: 'S', iconBg: '#1DB954', iconColor: '#FFFFFF', desc: 'Music and podcasts for you', category: 'Featured', developer: 'Spotify AB', website: 'spotify.com', version: '5.0.0', capabilities: 'Interactive, Reads', longDesc: 'Discover music, generate custom playlists, and control your playback via chat.' },
  { id: 'midjourney', name: 'Midjourney', iconText: 'Mj', iconBg: '#2C2F33', iconColor: '#FFFFFF', desc: 'Generate AI Masterpieces', category: 'Featured', developer: 'Midjourney Inc', website: 'midjourney.com', version: '5.2.0', capabilities: 'Interactive, Writes', longDesc: 'Generate highly realistic AI images directly in your chat.' },
  { id: 'notion', name: 'Notion', iconText: 'N', iconBg: '#000000', iconColor: '#FFFFFF', desc: 'Write, plan & organize', category: 'Featured', developer: 'Notion Labs Inc', website: 'notion.so', version: '2.4.1', capabilities: 'Reads, Writes', longDesc: 'Connect your workspaces and generate pages effortlessly.' },
  { id: 'slack', name: 'Slack', iconText: 'Sl', iconBg: '#4A154B', iconColor: '#FFFFFF', desc: 'Team communication', category: 'Featured', developer: 'Slack Technologies', website: 'slack.com', version: '3.1.2', capabilities: 'Interactive', longDesc: 'Send and read messages across all your workspaces.' },
  { id: 'zapier', name: 'Zapier', iconText: 'Z', iconBg: '#FF4A00', iconColor: '#FFFFFF', desc: 'Automate your workflows', category: 'Featured', developer: 'Zapier Inc', website: 'zapier.com', version: '2.0.0', capabilities: 'Interactive', longDesc: 'Connect over 5000+ apps together without writing a single line of code.' },
  { id: 'zoom', name: 'Zoom', iconText: 'Zm', iconBg: '#2D8CFF', iconColor: '#FFFFFF', desc: 'Video conferencing', category: 'Featured', developer: 'Zoom Video', website: 'zoom.us', version: '1.9.0', capabilities: 'Interactive', longDesc: 'Instantly schedule and launch Zoom meetings directly from chat.' },
  
  // LIFESTYLE (14 plugins)
  { id: 'abhibus', name: 'AbhiBus', iconText: 'ab', iconBg: '#E12C33', iconColor: '#FFFFFF', desc: 'Find Buses', category: 'Lifestyle', developer: 'AbhiBus', website: 'abhibus.com', version: '1.0.2', capabilities: 'Interactive', longDesc: 'Book bus tickets across India instantly. Check schedules, seat availability and prices.' },
  { id: 'almosafer', name: 'Almosafer', iconText: 'al', iconBg: '#0F73B9', iconColor: '#FFFFFF', desc: 'Find flights, hotels and more', category: 'Lifestyle', developer: 'Almosafer', website: 'almosafer.com', version: '2.0.0', capabilities: 'Reads', longDesc: 'Your ultimate travel companion in the Middle East.' },
  { id: 'artue', name: 'artue', iconText: 'A', iconBg: '#111111', iconColor: '#FFFFFF', desc: 'Find art with natural language', category: 'Lifestyle', developer: 'Artue Inc', website: 'artue.io', version: '1.0.0', capabilities: 'Interactive', longDesc: 'Discover beautiful artwork and artists by describing what you feel or want to see.' },
  { id: 'booking', name: 'Booking.com', iconText: 'B.', iconBg: '#003580', iconColor: '#FFFFFF', desc: 'Find all best stays and more.', category: 'Lifestyle', developer: 'Booking.com', website: 'booking.com', version: '3.1.0', capabilities: 'Interactive', longDesc: 'Search millions of accommodations globally.' },
  { id: 'blablacar', name: 'BlaBlaCar', iconText: 'b', iconBg: '#00AFF5', iconColor: '#FFFFFF', desc: 'Find carpool, bus, train rides', category: 'Lifestyle', developer: 'Comuto SA', website: 'blablacar.com', version: '1.5.0', capabilities: 'Interactive', longDesc: 'Travel sustainably by sharing rides.' },
  { id: 'uber', name: 'Uber', iconText: 'U', iconBg: '#000000', iconColor: '#FFFFFF', desc: 'Request a ride', category: 'Lifestyle', developer: 'Uber Tech', website: 'uber.com', version: '4.5.1', capabilities: 'Interactive', longDesc: 'Request rides, track drivers and see fare estimates instantly.' },
  { id: 'zomato', name: 'Zomato', iconText: 'Z', iconBg: '#E23744', iconColor: '#FFFFFF', desc: 'Discover & order food', category: 'Lifestyle', developer: 'Zomato', website: 'zomato.com', version: '2.2.0', capabilities: 'Reads', longDesc: 'Find the best restaurants and order food delivery.' },
  { id: 'swiggy', name: 'Swiggy', iconText: 'Sw', iconBg: '#FC8019', iconColor: '#FFFFFF', desc: 'Food delivery & quick commerce', category: 'Lifestyle', developer: 'Swiggy', website: 'swiggy.com', version: '3.1.4', capabilities: 'Interactive', longDesc: 'Order food and groceries delivered to your door in minutes.' },
  { id: 'makemytrip', name: 'MakeMyTrip', iconText: 'M', iconBg: '#E63946', iconColor: '#FFFFFF', desc: 'Flights, Hotels & Holidays', category: 'Lifestyle', developer: 'MakeMyTrip', website: 'makemytrip.com', version: '1.8.2', capabilities: 'Reads', longDesc: 'Book cheap flights and domestic holidays easily.' },
  { id: 'netflix', name: 'Netflix', iconText: 'N', iconBg: '#E50914', iconColor: '#FFFFFF', desc: 'Discover movies & TV shows', category: 'Lifestyle', developer: 'Netflix Inc', website: 'netflix.com', version: '5.4.0', capabilities: 'Reads', longDesc: 'Find the best shows to binge watch this weekend based on your mood.' },
  { id: 'amazon', name: 'Amazon', iconText: 'a', iconBg: '#232F3E', iconColor: '#FF9900', desc: 'Shop everything', category: 'Lifestyle', developer: 'Amazon', website: 'amazon.com', version: '4.1.0', capabilities: 'Interactive', longDesc: 'Search products, check prices, and track orders directly.' },
  { id: 'myfitnesspal', name: 'MyFitnessPal', iconText: 'MF', iconBg: '#0066EE', iconColor: '#FFFFFF', desc: 'Calorie Counter & Diet', category: 'Lifestyle', developer: 'MyFitnessPal', website: 'myfitnesspal.com', version: '2.3.0', capabilities: 'Writes', longDesc: 'Log your meals and track calories seamlessly using natural language.' },
  { id: 'headspace', name: 'Headspace', iconText: 'H', iconBg: '#F38120', iconColor: '#FFFFFF', desc: 'Meditation & Sleep', category: 'Lifestyle', developer: 'Headspace', website: 'headspace.com', version: '1.2.0', capabilities: 'Reads', longDesc: 'Find the perfect guided meditation for your current emotional state.' },
  { id: 'duolingo', name: 'Duolingo', iconText: 'D', iconBg: '#58CC02', iconColor: '#FFFFFF', desc: 'Learn languages free', category: 'Lifestyle', developer: 'Duolingo', website: 'duolingo.com', version: '3.4.1', capabilities: 'Interactive', longDesc: 'Practice your language lessons right here in the chat.' },

  // PRODUCTIVITY (14 plugins)
  { id: 'bigquery', name: 'BigQuery', iconText: 'BQ', iconBg: '#000000', iconColor: '#4285F4', desc: 'Query and manage datasets', category: 'Productivity', developer: 'Google LLC', website: 'cloud.google.com', version: '2.4.0', capabilities: 'Interactive, Reads, Writes', longDesc: 'Run massive SQL queries and analyze large datasets using natural language.' },
  { id: 'github', name: 'GitHub', iconText: 'GH', iconBg: '#FFFFFF', iconColor: '#000000', desc: 'Access repositories, issues...', category: 'Productivity', developer: 'GitHub Inc', website: 'github.com', version: '1.8.0', capabilities: 'Interactive, Reads, Writes', longDesc: 'Manage PRs, review code, and track issues directly through chat.' },
  { id: 'outlook', name: 'Outlook Calendar', iconText: 'O', iconBg: '#0078D4', iconColor: '#FFFFFF', desc: 'Look up events and availability', category: 'Productivity', developer: 'Microsoft', website: 'microsoft.com', version: '1.1.2', capabilities: 'Interactive, Reads', longDesc: 'Manage your schedule without opening your calendar app.' },
  { id: 'sharepoint', name: 'SharePoint', iconText: 'S', iconBg: '#0078D4', iconColor: '#FFFFFF', desc: 'Search and pull from sites', category: 'Productivity', developer: 'Microsoft', website: 'microsoft.com', version: '2.0.0', capabilities: 'Interactive, Reads', longDesc: 'Find enterprise documents securely.' },
  { id: 'jira', name: 'Jira', iconText: 'J', iconBg: '#0052CC', iconColor: '#FFFFFF', desc: 'Issue & Project Tracking', category: 'Productivity', developer: 'Atlassian', website: 'atlassian.com', version: '4.1.0', capabilities: 'Reads, Writes', longDesc: 'Create, assign, and transition Jira issues instantly.' },
  { id: 'trello', name: 'Trello', iconText: 'Tr', iconBg: '#0052CC', iconColor: '#FFFFFF', desc: 'Organize anything', category: 'Productivity', developer: 'Atlassian', website: 'trello.com', version: '2.3.1', capabilities: 'Interactive, Writes', longDesc: 'Move cards and manage boards.' },
  { id: 'asana', name: 'Asana', iconText: 'As', iconBg: '#F06A6A', iconColor: '#FFFFFF', desc: 'Manage team projects', category: 'Productivity', developer: 'Asana', website: 'asana.com', version: '3.1.4', capabilities: 'Reads, Writes', longDesc: 'Keep track of your project deadlines and team tasks.' },
  { id: 'monday', name: 'Monday.com', iconText: 'M', iconBg: '#FF3D57', iconColor: '#FFFFFF', desc: 'Work OS for teams', category: 'Productivity', developer: 'Monday.com', website: 'monday.com', version: '1.5.2', capabilities: 'Interactive', longDesc: 'Build powerful custom workflows to run your projects.' },
  { id: 'linear', name: 'Linear', iconText: 'Li', iconBg: '#5E6AD2', iconColor: '#FFFFFF', desc: 'Modern software development', category: 'Productivity', developer: 'Linear', website: 'linear.app', version: '2.0.0', capabilities: 'Reads, Writes', longDesc: 'Streamline issues, sprints, and product roadmaps.' },
  { id: 'webflow', name: 'Webflow', iconText: 'W', iconBg: '#4353FF', iconColor: '#FFFFFF', desc: 'Create custom websites', category: 'Productivity', developer: 'Webflow', website: 'webflow.com', version: '1.1.0', capabilities: 'Interactive', longDesc: 'Build completely custom responsive websites visually.' },
  { id: 'vercel', name: 'Vercel', iconText: 'V', iconBg: '#000000', iconColor: '#FFFFFF', desc: 'Deploy web projects', category: 'Productivity', developer: 'Vercel', website: 'vercel.com', version: '3.3.0', capabilities: 'Interactive', longDesc: 'Deploy and monitor Next.js applications directly from chat.' },
  { id: 'aws', name: 'AWS Cloud', iconText: 'aws', iconBg: '#232F3E', iconColor: '#FF9900', desc: 'Cloud infrastructure', category: 'Productivity', developer: 'Amazon Web Services', website: 'aws.amazon.com', version: '5.1.0', capabilities: 'Reads', longDesc: 'Manage EC2 instances and S3 buckets through commands.' },
  { id: 'docker', name: 'Docker', iconText: 'D', iconBg: '#2496ED', iconColor: '#FFFFFF', desc: 'Containerize applications', category: 'Productivity', developer: 'Docker Inc', website: 'docker.com', version: '2.0.1', capabilities: 'Interactive', longDesc: 'Write Dockerfiles and deploy containers.' },
  { id: 'mongodb', name: 'MongoDB', iconText: 'Mg', iconBg: '#47A248', iconColor: '#FFFFFF', desc: 'NoSQL Database', category: 'Productivity', developer: 'MongoDB Inc', website: 'mongodb.com', version: '1.4.0', capabilities: 'Reads, Writes', longDesc: 'Query databases and collections using natural English.' }
];

export default function PluginStorePage() {
  const [activeTab, setActiveTab] = useState('Featured');
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [installedPlugins, setInstalledPlugins] = useState([]);
  
  // Spotlight State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  
  const TABS = ['Featured', 'Lifestyle', 'Productivity', 'My Dashboard'];

  useEffect(() => {
    fetchPlugins();
  }, []);

  // Cmd+K Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus search input when Spotlight opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 50);
    }
  }, [isSearchOpen]);

  const fetchPlugins = async () => {
    try {
      const res = await api.get('/api/plugins');
      if (res.data.success) {
        setInstalledPlugins(res.data.plugins);
      }
    } catch (err) {
      console.error('Failed to load plugins', err);
    }
  };

  const togglePlugin = async (pluginId) => {
    const isCurrentlyActive = isPluginActive(pluginId);
    try {
      if (isCurrentlyActive) {
        setInstalledPlugins(prev => prev.filter(p => p.pluginName !== pluginId));
      } else {
        setInstalledPlugins(prev => [...prev, { pluginName: pluginId, isEnabled: true }]);
      }
      
      const res = await api.post('/api/plugins/toggle', {
        pluginName: pluginId,
        isEnabled: !isCurrentlyActive
      });
      if (res.data.success) {
        toast.success(`Plugin ${!isCurrentlyActive ? 'Connected' : 'Disconnected'}`);
      }
    } catch (err) {
      toast.error('Failed to toggle plugin.');
      fetchPlugins(); 
    }
  };

  const isPluginActive = (id) => {
    return installedPlugins.some(p => p.pluginName === id && p.isEnabled);
  };

  const filteredPlugins = MOCK_PLUGINS.filter(p => p.category === activeTab);
  const searchResults = MOCK_PLUGINS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen overflow-hidden bg-black text-[#ECECF1] font-sans selection:bg-white/20">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-6 md:px-20 py-10 relative">
        
        {/* Top Navigation & Spotlight Trigger */}
        <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-[#2A2B32] text-white' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-colors border border-white/10"
          >
            <Search className="w-4 h-4" />
            <span>Search plugins...</span>
            <kbd className="ml-2 font-mono text-[10px] bg-black/50 px-1.5 py-0.5 rounded border border-white/10 text-gray-500">Ctrl K</kbd>
          </button>
        </div>

        {/* Dashboard View */}
        {activeTab === 'My Dashboard' && (
          <div className="max-w-[1200px] animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-8">Your Plugin Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#171717] border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
                <div className="flex items-center gap-3 text-gray-400 mb-2"><Activity className="w-5 h-5 text-emerald-400" /> Active Plugins</div>
                <div className="text-5xl font-bold text-white">{installedPlugins.filter(p => p.isEnabled).length}</div>
              </div>
              <div className="bg-[#171717] border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
                <div className="flex items-center gap-3 text-gray-400 mb-2"><Zap className="w-5 h-5 text-amber-400" /> Total Invocations</div>
                <div className="text-5xl font-bold text-white">128</div>
                <div className="text-sm text-gray-500 mt-2">This month</div>
              </div>
              <div className="bg-[#171717] border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
                <div className="flex items-center gap-3 text-gray-400 mb-2"><Clock className="w-5 h-5 text-blue-400" /> Time Saved</div>
                <div className="text-5xl font-bold text-white">14.5<span className="text-2xl ml-1 text-gray-500">hrs</span></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Most Used Plugins</h3>
            <div className="bg-[#171717] border border-white/10 rounded-2xl overflow-hidden">
              {['Canva', 'Adobe Photoshop', 'GitHub', 'Replit'].map((name, i) => (
                <div key={name} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <div className="text-white font-medium">{name}</div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-2 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${80 - (i * 15)}%` }}></div>
                    </div>
                    <span className="text-gray-400 text-sm">{80 - (i * 15)} uses</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-surface border border-white/10 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-2">Create Custom Plugin</h3>
              <p className="text-gray-400 text-sm mb-6">Build your own open plugins like ChatGPT GPTs by providing a webhook endpoint. CloserAI will dynamically call this endpoint when requested.</p>
              
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="text-sm font-medium text-gray-300">Plugin Name</label>
                  <input type="text" placeholder="e.g. My Internal Tools" className="w-full bg-[#171717] border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Webhook URL (OpenAPI JSON or REST)</label>
                  <input type="url" placeholder="https://api.mycompany.com/webhook" className="w-full bg-[#171717] border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Description / Instructions</label>
                  <textarea placeholder="Tell CloserAI when to use this plugin..." className="w-full bg-[#171717] border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:border-accent outline-none h-24"></textarea>
                </div>
                <button className="px-6 py-3 bg-accent text-white rounded-xl font-bold hover:opacity-90 transition w-full md:w-auto">
                  + Create Webhook Plugin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plugin Grid (Not Dashboard) */}
        {activeTab !== 'My Dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 max-w-[1200px]">
            {filteredPlugins.map(plugin => (
              <div 
                key={plugin.id} 
                onClick={() => setSelectedPlugin(plugin)}
                className="group flex items-center justify-between p-4 rounded-xl hover:bg-[#2A2B32] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                    style={{ backgroundColor: plugin.iconBg, color: plugin.iconColor }}
                  >
                    {plugin.iconText}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px] text-white">{plugin.name}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">{plugin.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Spotlight Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1E1E1E] w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col"
            >
              <div className="flex items-center px-4 py-3 border-b border-white/10">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plugins (e.g. Canva, Figma)..."
                  className="flex-1 bg-transparent border-none outline-none text-lg text-white px-4 placeholder-gray-500"
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-[10px] bg-black/50 text-gray-400 px-2 py-1 rounded border border-white/10 uppercase font-bold tracking-wider hover:bg-white/10">
                  ESC
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto p-2">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No plugins found for "{searchQuery}"</div>
                ) : (
                  searchResults.map(plugin => (
                    <div 
                      key={plugin.id} 
                      onClick={() => {
                        setSelectedPlugin(plugin);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ backgroundColor: plugin.iconBg, color: plugin.iconColor }}
                      >
                        {plugin.iconText}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-white">{plugin.name}</h3>
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{plugin.desc}</p>
                      </div>
                      <div className="text-xs text-gray-500 px-2 py-1 bg-black/30 rounded-md">{plugin.category}</div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plugin Detail Modal */}
      <AnimatePresence>
        {selectedPlugin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedPlugin(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#171717] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-white/10"
            >
              {/* Modal Header */}
              <div className="p-8 pb-6 border-b border-white/5 flex items-start justify-between sticky top-0 bg-[#171717]/90 backdrop-blur-md z-10">
                <div className="flex items-start gap-6">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shrink-0"
                    style={{ backgroundColor: selectedPlugin.iconBg, color: selectedPlugin.iconColor }}
                  >
                    {selectedPlugin.iconText}
                  </div>
                  <div className="pt-2">
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedPlugin.name}</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">{selectedPlugin.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <button 
                    onClick={() => togglePlugin(selectedPlugin.id)}
                    className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
                      isPluginActive(selectedPlugin.id)
                        ? 'bg-[#2A2B32] text-white hover:bg-white/20'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {isPluginActive(selectedPlugin.id) ? 'Disconnect' : 'Connect'}
                  </button>
                  <button 
                    onClick={() => setSelectedPlugin(null)}
                    className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                {/* Mock Screenshots Area */}
                <div className="flex gap-6 mb-12 overflow-x-auto pb-4 snap-x">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="min-w-[280px] h-[400px] bg-[#2A2B32] rounded-xl flex flex-col items-center justify-center text-gray-500 border border-white/5 snap-center">
                      <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center mb-4">
                        <div style={{ color: selectedPlugin.iconColor }} className="text-2xl font-bold">{selectedPlugin.iconText}</div>
                      </div>
                      <p className="text-sm font-medium">App Screenshot {i}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-12">
                  <p className="text-gray-300 text-[15px] leading-relaxed max-w-3xl">
                    {selectedPlugin.longDesc}
                  </p>
                </div>

                {/* Information Table */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-6">Information</h3>
                  <div className="bg-[#202123] rounded-xl border border-white/10 overflow-hidden">
                    <div className="grid grid-cols-3 p-4 border-b border-white/5">
                      <div className="text-gray-400 text-sm">Category</div>
                      <div className="col-span-2 text-white text-sm">{selectedPlugin.category}</div>
                    </div>
                    <div className="grid grid-cols-3 p-4 border-b border-white/5">
                      <div className="text-gray-400 text-sm">Capabilities</div>
                      <div className="col-span-2 text-white text-sm">{selectedPlugin.capabilities}</div>
                    </div>
                    <div className="grid grid-cols-3 p-4 border-b border-white/5">
                      <div className="text-gray-400 text-sm">Developer</div>
                      <div className="col-span-2 text-white text-sm">{selectedPlugin.developer}</div>
                    </div>
                    <div className="grid grid-cols-3 p-4 border-b border-white/5">
                      <div className="text-gray-400 text-sm">Website</div>
                      <div className="col-span-2 text-blue-400 text-sm flex items-center gap-1 hover:underline cursor-pointer">
                        {selectedPlugin.website} <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 p-4 border-b border-white/5">
                      <div className="text-gray-400 text-sm">Version</div>
                      <div className="col-span-2 text-white text-sm">{selectedPlugin.version}</div>
                    </div>
                    <div className="grid grid-cols-3 p-4 border-b border-white/5">
                      <div className="text-gray-400 text-sm">Privacy Policy</div>
                      <div className="col-span-2 text-blue-400 text-sm flex items-center gap-1 hover:underline cursor-pointer">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <div className="text-gray-400 text-sm">Customer Support</div>
                      <div className="col-span-2 text-blue-400 text-sm flex items-center gap-1 hover:underline cursor-pointer">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
