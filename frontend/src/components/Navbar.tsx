import React from 'react';
import { Activity, ShieldCheck, Layers, FileText, Compass, Radio, Home } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isSimulating,
  setIsSimulating
}) => {
  const tabs = [
    { id: 'landing', label: 'Landing Page', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'farm_map', label: 'Farm Map & Twin', icon: Layers },
    { id: 'remote_sensing', label: 'Remote Sensing', icon: Compass },
    { id: 'passport', label: 'Carbon Passport', icon: ShieldCheck },
    { id: 'reports', label: 'MRV Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand Logo & Status */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-200 bg-clip-text text-transparent">
                Algae Carbon Intelligence
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full">
                DIGITAL MRV
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Farm: <strong className="text-slate-200">Gujarat Algae Farm (ALG-001)</strong></span>
              <span>•</span>
              <span className="text-slate-400">Species: Chlorella vulgaris</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live Simulation Indicator & Honesty Badge */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isSimulating
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400 pulse-active' : ''}`} />
            <span>{isSimulating ? 'STREAM: LIVE' : 'STREAM: PAUSED'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
