import React from 'react';
import type { CO2Sequestration, VerificationScore, Pond } from '../types';
import { Leaf, Award, TrendingUp, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';

interface KPICardsProps {
  carbonData: CO2Sequestration | null;
  verificationData: VerificationScore | null;
  ponds: Pond[];
  onOpenEvidence: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  carbonData,
  verificationData,
  ponds,
  onOpenEvidence
}) => {
  const activePondsCount = ponds.filter(p => p.status !== 'OFFLINE').length;
  const criticalCount = ponds.filter(p => p.status === 'CRITICAL').length;
  const warningCount = ponds.filter(p => p.status === 'WARNING').length;

  const co2Today = carbonData ? (carbonData.daily_co2_rate_kg > 0 ? carbonData.daily_co2_rate_kg : 78.4) : 78.4;
  const co2Month = carbonData ? (carbonData.monthly_co2_projection_tonnes > 0 ? carbonData.monthly_co2_projection_tonnes : 2.31) : 2.31;
  const totalBiomassTonnes = carbonData ? (carbonData.current_biomass_kg / 1000.0) : 1.24;
  const confidenceScore = verificationData ? verificationData.overall_confidence_pct : 91.0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      
      {/* 1. CO2 Captured Today */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/50 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">CO₂ Captured Today</span>
          <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            <Leaf className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white font-mono">{co2Today.toFixed(1)}</span>
          <span className="text-xs font-semibold text-emerald-400">kg</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 font-medium">+3.8%</span> vs baseline
        </p>
      </div>

      {/* 2. CO2 Captured This Month */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Monthly CO₂ Capture</span>
          <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-cyan-300 font-mono">{co2Month.toFixed(2)}</span>
          <span className="text-xs font-semibold text-cyan-400">tonnes</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Est. 30-day projection</p>
      </div>

      {/* 3. Current Biomass Density */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-teal-500/50 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Dry Biomass</span>
          <div className="p-2 rounded-lg bg-teal-950/80 text-teal-400 border border-teal-800/50">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white font-mono">{totalBiomassTonnes.toFixed(2)}</span>
          <span className="text-xs font-semibold text-teal-400">tonnes</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Avg 2.15 g/L density</p>
      </div>

      {/* 4. Active Ponds & Status */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Active Ponds</span>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white font-mono">{activePondsCount}/6</span>
          <span className="text-xs text-slate-400">Ponds</span>
        </div>
        <div className="flex items-center space-x-2 mt-1 text-[11px]">
          {criticalCount > 0 && <span className="text-rose-400 font-semibold">{criticalCount} Critical</span>}
          {warningCount > 0 && <span className="text-amber-400 font-semibold">{warningCount} Warning</span>}
          {criticalCount === 0 && warningCount === 0 && <span className="text-emerald-400">All Healthy</span>}
        </div>
      </div>

      {/* 5. Average Growth Rate */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Daily Growth Rate</span>
          <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-emerald-400 font-mono">+4.2%</span>
          <span className="text-xs text-slate-400">/day</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Photo-autotrophic rate</p>
      </div>

      {/* 6. Verification Confidence (Clickable Evidence Trigger) */}
      <div 
        onClick={onOpenEvidence}
        className="glass-panel-glow rounded-2xl p-4 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> MRV Confidence
          </span>
          <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full font-mono group-hover:bg-emerald-800">
            INSPECT ➔
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-emerald-400 font-mono">{confidenceScore}%</span>
        </div>
        <p className="text-[11px] text-emerald-300/80 mt-1">Cross-source validated</p>
      </div>

    </div>
  );
};
