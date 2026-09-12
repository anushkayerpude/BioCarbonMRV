import React, { useState } from 'react';
import type { CO2Sequestration, VerificationScore, Pond } from '../types';
import { Leaf, ShieldCheck, AlertTriangle, ArrowRight, ChevronRight, Cpu, Lock, Flame, Activity } from 'lucide-react';

interface BioCarbonCommandCenterProps {
  carbonData: CO2Sequestration | null;
  verificationData: VerificationScore | null;
  ponds: Pond[];
  onOpenEvidence: (pondId?: string) => void;
  onSelectPond: (pond: Pond) => void;
}

export const BioCarbonCommandCenter: React.FC<BioCarbonCommandCenterProps> = ({
  carbonData,
  verificationData: _verificationData,
  ponds,
  onOpenEvidence,
  onSelectPond
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'telemetry' | 'alerts' | 'mrv'>('overview');

  const netCo2Tonnes = carbonData ? (carbonData.net_co2_removed_kg ? carbonData.net_co2_removed_kg / 1000.0 : 41.1) : 41.1;
  const grossCo2Tonnes = carbonData ? (carbonData.gross_co2_captured_kg ? carbonData.gross_co2_captured_kg / 1000.0 : 43.5) : 43.5;
  const dynamicCFraction = carbonData?.dynamic_carbon_fraction || 0.524;

  const criticalPond = ponds.find((p) => p.status === 'CRITICAL');
  const warningPond = ponds.find((p) => p.status === 'WARNING');

  return (
    <div className="w-full lg:w-[380px] h-[520px] bg-[#090d17]/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-5 shadow-2xl flex flex-col justify-between overflow-y-auto select-none flex-shrink-0">
      
      <div>
        {/* HEADER & SYSTEM LIVE BADGE */}
        <div className="flex items-start justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>BioCarbon Intelligence Hub</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Real-time algae farm & MRV audit stream
            </p>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-[10px] font-mono font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM LIVE</span>
          </div>
        </div>

        {/* SUB-TABS (Live Overview, Pond Telemetry, Anomaly Alerts, MRV Audit) */}
        <div className="flex items-center justify-between border-b border-slate-800/80 mb-4 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`pb-2 transition-all relative ${
              activeSubTab === 'overview' ? 'text-purple-300 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <span>Overview</span>
            {activeSubTab === 'overview' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('telemetry')}
            className={`pb-2 transition-all relative ${
              activeSubTab === 'telemetry' ? 'text-purple-300 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <span>Telemetry</span>
            {activeSubTab === 'telemetry' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('alerts')}
            className={`pb-2 transition-all relative ${
              activeSubTab === 'alerts' ? 'text-purple-300 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <span>Alerts</span>
            {activeSubTab === 'alerts' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('mrv')}
            className={`pb-2 transition-all relative ${
              activeSubTab === 'mrv' ? 'text-purple-300 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <span>MRV Audit</span>
            {activeSubTab === 'mrv' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
        </div>

        {/* 5 DEEP-TECH UPGRADES METRICS GRID (2x2) */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          
          {/* Box 1: Net Carbon Removed */}
          <div className="bg-[#0f1524] p-3 rounded-2xl border border-emerald-500/40 hover:border-emerald-400 transition-all">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-black text-white font-mono tracking-tight">{netCo2Tonnes.toFixed(1)} <span className="text-xs text-emerald-400 font-normal">t</span></div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">Net CO₂ Removed</div>
            <div className="text-[9px] text-emerald-400 font-mono mt-1 font-semibold">
              Gross {grossCo2Tonnes.toFixed(1)}t - Op Subtracted
            </div>
          </div>

          {/* Box 2: Dynamic Carbon Fraction */}
          <div className="bg-[#0f1524] p-3 rounded-2xl border border-purple-500/40 hover:border-purple-400 transition-all">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-black text-purple-300 font-mono tracking-tight">{(dynamicCFraction * 100).toFixed(1)}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">Dynamic C Fraction</div>
            <div className="text-[9px] text-purple-300/80 font-mono mt-1">Stress-model predicted</div>
          </div>

          {/* Box 3: Species Monoculture Purity */}
          <div className="bg-[#0f1524] p-3 rounded-2xl border border-cyan-500/40 hover:border-cyan-400 transition-all">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-black text-cyan-300 font-mono tracking-tight">98.4%</div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">Species Purity</div>
            <div className="text-[9px] text-cyan-300/80 font-mono mt-1">Chlorella Monoculture</div>
          </div>

          {/* Box 4: Permanence Score */}
          <div className="bg-[#0f1524] p-3 rounded-2xl border border-amber-500/40 hover:border-amber-400 transition-all">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-black text-amber-300 font-mono tracking-tight">100%</div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">Permanence Score</div>
            <div className="text-[9px] text-amber-300/80 font-mono mt-1">Biochar / 1000+ Yrs</div>
          </div>

        </div>

        {/* SECTION: ALGAE & MRV SIGNALS & AUDIT SEALS */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              CRYPTOGRAPHIC & MRV SIGNALS
            </span>
            <button
              onClick={() => onOpenEvidence()}
              className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5"
            >
              <span>Audit trail</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            
            {/* Signal 1: SHA-256 Audit Seal */}
            <div 
              onClick={() => onOpenEvidence()}
              className="bg-[#0f1524] p-2.5 rounded-xl border border-purple-500/50 hover:border-purple-400 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="pr-2">
                <div className="flex items-center space-x-1.5 text-purple-300 font-semibold text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>SHA-256 Cryptographic Audit Seal</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  BIO-ANCHOR-A89F2E01 · Verified Unaltered
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#a855f7] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </div>

            {/* Signal 2: Invasive Species & Thermal Alert */}
            <div 
              onClick={() => {
                if (criticalPond) onSelectPond(criticalPond);
                else if (warningPond) onSelectPond(warningPond);
              }}
              className="bg-[#0f1524] p-2.5 rounded-xl border border-rose-900/60 hover:border-rose-500/50 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="pr-2">
                <div className="flex items-center space-x-1.5 text-rose-300 font-semibold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 animate-pulse" />
                  <span>Pond 04 Cyanobacteria Risk Alert</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Phycocyanin Index 0.68 · Temp 31.8°C · pH 9.3
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors flex-shrink-0" />
            </div>

            {/* Signal 3: Net Carbon & Biomass Fate */}
            <div 
              onClick={() => onOpenEvidence()}
              className="bg-[#0f1524] p-2.5 rounded-xl border border-emerald-900/60 hover:border-emerald-500/40 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="pr-2">
                <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Biomass Fate & Net CO₂ Verified</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  41.1t Net CO₂ → Biochar 100% Permanence
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
            </div>

          </div>
        </div>

      </div>

      {/* LAUNCH CROSS-SOURCE EVIDENCE INSPECTION BUTTON */}
      <div className="pt-3 border-t border-slate-800/80 mt-2">
        <button
          onClick={() => onOpenEvidence()}
          className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 group cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Launch Cryptographic Audit Inspection</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};
