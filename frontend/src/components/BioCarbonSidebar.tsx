import React, { useState } from 'react';
import { 
  Building2, 
  Activity, 
  BarChart3, 
  AlertTriangle, 
  Box, 
  Settings, 
  Moon,
  Leaf
} from 'lucide-react';

interface BioCarbonSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BioCarbonSidebar: React.FC<BioCarbonSidebarProps> = ({
  activeTab,
  setActiveTab
}) => {
  const [darkMode, setDarkMode] = useState(true);

  // Dedicated sidebar tools mapped to real platform views
  const menuItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: Activity },
    { id: 'farm_map', label: 'Ponds & Twin', icon: Building2 },
    { id: 'remote_sensing', label: 'Remote Sensing', icon: BarChart3 },
    { id: 'passport', label: 'Carbon Passport', icon: Box },
    { id: 'reports', label: 'MRV Reports', icon: AlertTriangle },
  ];

  return (
    <aside className="w-56 h-[calc(100vh-60px)] bg-[#080c08] border-r border-[#283618]/70 p-3 flex flex-col justify-between sticky top-[60px] z-40 select-none flex-shrink-0">
      
      {/* Upper Sidebar Navigation Menu List */}
      <div>
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 block mb-2">
          Platform Views
        </span>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#283618] to-[#1c2710] text-[#d9ed92] border border-[#708238]/60 shadow-lg shadow-[#283618]/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151f11]/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d9ed92]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls & Callout Card */}
      <div className="space-y-3 pt-4 border-t border-[#283618]/60">
        
        {/* Settings Button */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#151f11]/70 transition-all"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        {/* Dark Mode Toggle Switch */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#12190f] rounded-xl border border-[#283618] text-xs">
          <div className="flex items-center space-x-2 text-slate-300 font-medium">
            <Moon className="w-3.5 h-3.5 text-[#a3be8c]" />
            <span>Dark Mode</span>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors relative ${
              darkMode ? 'bg-[#708238]' : 'bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              darkMode ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Bottom Callout Card */}
        <div className="relative rounded-2xl p-3.5 bg-gradient-to-b from-[#162013] to-[#0c130b] border border-[#283618] overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Leaf className="w-16 h-16 text-[#a3be8c]" />
          </div>
          
          <div className="relative z-10">
            <div className="w-6 h-6 rounded-lg bg-[#283618] border border-[#708238]/60 flex items-center justify-center mb-2">
              <Leaf className="w-3.5 h-3.5 text-[#d9ed92]" />
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-snug">
              From algae growth to verified carbon impact.
            </p>
          </div>
        </div>

      </div>

    </aside>
  );
};
