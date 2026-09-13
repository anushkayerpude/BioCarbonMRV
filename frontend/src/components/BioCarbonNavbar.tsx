import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Bell, ChevronDown, Home, Activity, Layers, Compass, ShieldCheck, FileText } from 'lucide-react';

interface BioCarbonNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  wsStatus?: string;
}

export const BioCarbonNavbar: React.FC<BioCarbonNavbarProps> = ({
  activeTab,
  setActiveTab,
  isSimulating: _isSimulating,
  setIsSimulating: _setIsSimulating,
  wsStatus = 'CONNECTED'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Gujarat Algae Farm');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const locationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(`${dateStr}, ${timeStr} IST`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close location dropdown on outside click or Escape key
  useEffect(() => {
    if (!isLocationOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLocationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLocationOpen]);

  const locations = [
    'Gujarat Algae Farm',
    'Gandhinagar Site #02',
    'Kutch Coastal Facility',
    'Surat Carbon Sink'
  ];

  const mainTabs = [
    { id: 'landing', label: 'Landing Page', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'farm_map', label: 'Ponds & Twin', icon: Layers },
    { id: 'remote_sensing', label: 'Remote Sensing', icon: Compass },
    { id: 'passport', label: 'Carbon Passport', icon: ShieldCheck },
    { id: 'reports', label: 'MRV Reports', icon: FileText }
  ];

  return (
    <header className="w-full bg-[#060a06]/90 backdrop-blur-xl border-b border-[#233318]/90 px-4 lg:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
      
      {/* LEFT: Brand Logo & Title */}
      <div 
        className="flex items-center space-x-3 cursor-pointer group select-none flex-shrink-0"
        onClick={() => setActiveTab('landing')}
      >
        {/* Double Ring / Infinity Carbon Leaf Logo */}
        <div className="relative w-9 h-9 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-[#84a948]/80 scale-100 group-hover:scale-110 transition-transform" />
          <div className="absolute inset-0 rounded-full border-2 border-[#d9ed92]/60 translate-x-1.5 opacity-80" />
          <div className="w-3 h-3 rounded-full bg-[#84a948] shadow-lg shadow-[#84a948]/50" />
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-lg font-black tracking-tight text-white font-sans">
              BioCarbon<span className="text-[#a3be8c]">MRV</span>
            </span>
          </div>
          <p className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold">
            ALGAE CARBON INTELLIGENCE
          </p>
        </div>
      </div>

      {/* CENTER: Navigation Tabs (Landing Page vs Dashboard vs Features) */}
      <nav className="hidden lg:flex items-center space-x-1 bg-[#10170d] p-1 rounded-xl border border-[#283618]">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#6b8e23] to-[#84a948] text-slate-950 shadow-md shadow-[#6b8e23]/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#182313]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* RIGHT: Search Bar, Location Selector, Clock & Profile */}
      <div className="flex items-center space-x-3">
        
        {/* Search Bar */}
        <div className="hidden xl:flex items-center relative w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#10170d] text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-8 pr-8 py-1.5 border border-[#283618] focus:outline-none focus:border-[#84a948]/70 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1 py-0.2 bg-[#182313] text-slate-400 text-[9px] font-mono font-semibold rounded">
            ⌘K
          </div>
        </div>

        {/* Location Dropdown Pill */}
        <div ref={locationRef} className="relative hidden sm:block">
          <button
            onClick={() => setIsLocationOpen(!isLocationOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#10170d] border border-[#283618] text-xs text-slate-200 hover:border-[#708238]/60 transition-all font-medium"
          >
            <MapPin className="w-3.5 h-3.5 text-[#a3be8c]" />
            <span className="truncate max-w-[120px]">{selectedLocation}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isLocationOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#10170d] border border-[#283618] rounded-xl shadow-2xl py-1 z-50">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setIsLocationOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${
                    selectedLocation === loc
                      ? 'bg-[#283618] text-[#d9ed92] font-semibold'
                      : 'text-slate-300 hover:bg-[#182313]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Data Clock & WebSocket Stream Indicator */}
        <div className="hidden 2xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#10170d] border border-[#283618] text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${wsStatus === 'CONNECTED' ? 'bg-[#84a948] animate-pulse' : wsStatus === 'RECONNECTING' ? 'bg-amber-400 animate-ping' : 'bg-slate-400'}`} />
          <span className="text-slate-300 font-medium">
            {wsStatus === 'CONNECTED' ? 'WS Stream Active' : wsStatus === 'RECONNECTING' ? 'WS Reconnecting...' : 'REST Fallback'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px]">{currentTime || '12 Sep 2026, 08:27 IST'}</span>
        </div>

        {/* Notification Bell */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="relative p-2 rounded-xl bg-[#10170d] border border-[#283618] text-slate-300 hover:text-[#d9ed92] hover:border-[#708238] transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </button>

        {/* User Profile Avatar */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="w-8 h-8 rounded-full bg-[#1b2618] border border-[#283618] flex items-center justify-center text-xs font-bold text-[#d9ed92] hover:border-[#84a948] transition-colors"
        >
          AY
        </button>

      </div>
    </header>
  );
};
