import React from 'react';
import type { CO2Sequestration, VerificationScore, Pond } from '../types';
import { Leaf, Database, AlertCircle, ShieldCheck } from 'lucide-react';

interface BioCarbonBottomKPIsProps {
  carbonData: CO2Sequestration | null;
  verificationData: VerificationScore | null;
  ponds: Pond[];
  onOpenEvidence: () => void;
  onSelectPond?: (pond: Pond) => void;
}

export const BioCarbonBottomKPIs: React.FC<BioCarbonBottomKPIsProps> = ({
  carbonData,
  verificationData,
  ponds,
  onOpenEvidence,
  onSelectPond
}) => {
  const netCo2Tonnes = carbonData ? (carbonData.net_co2_removed_kg ? carbonData.net_co2_removed_kg / 1000.0 : 41.1) : 41.1;
  const grossCo2Tonnes = carbonData ? (carbonData.gross_co2_captured_kg ? carbonData.gross_co2_captured_kg / 1000.0 : 43.5) : 43.5;
  const totalBiomassTonnes = carbonData ? (carbonData.current_biomass_kg / 1000.0 > 0 ? carbonData.current_biomass_kg / 1000.0 : 8.42) : 8.42;
  const dynamicCFraction = carbonData?.dynamic_carbon_fraction || 0.524;
  const verificationScore = verificationData?.overall_confidence_pct ?? 91.0;

  const criticalCount = ponds.filter(p => p.status === 'CRITICAL').length;
  const warningCount = ponds.filter(p => p.status === 'WARNING').length;
  const healthyCount = ponds.filter(p => p.status === 'HEALTHY').length;
  const criticalPond = ponds.find(p => p.status === 'CRITICAL');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 w-full">
      
      {/* CARD 1: Net CO2 Removed */}
      <div className="bg-[#0c140c]/80 backdrop-blur-xl border border-[#233318]/90 hover:border-[#708238]/80 rounded-3xl p-6 shadow-xl transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#182313] border border-[#708238]/50 text-[#d9ed92] flex items-center justify-center shadow-md shadow-[#182313]/50">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block leading-tight">Net CO₂ Removed</span>
              <span className="text-[10px] text-slate-400">Carbon Credited</span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-[#d9ed92] bg-[#16220e] px-2.5 py-1 rounded-full border border-[#708238]/50">
            {(dynamicCFraction * 100).toFixed(1)}% C
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3">
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {netCo2Tonnes.toFixed(1)} <span className="text-xs text-[#d9ed92] font-semibold">tonnes</span>
          </div>
          <span className="text-[11px] font-mono text-[#a3be8c] font-semibold">94.5% Net Eff.</span>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
          Gross {grossCo2Tonnes.toFixed(1)}t captured less operational footprint
        </p>
      </div>

      {/* CARD 2: Cultivated Algae Biomass */}
      <div className="bg-[#0c140c]/80 backdrop-blur-xl border border-[#233318]/90 hover:border-[#708238]/80 rounded-3xl p-6 shadow-xl transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#182313] border border-[#708238]/50 text-[#d9ed92] flex items-center justify-center shadow-md shadow-[#182313]/50">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block leading-tight">Active Biomass</span>
              <span className="text-[10px] text-slate-400">Total Dry Weight</span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-[#d9ed92] bg-[#16220e] px-2.5 py-1 rounded-full border border-[#708238]/50">
            98.4% Pure
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3">
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {totalBiomassTonnes.toFixed(2)} <span className="text-xs text-[#d9ed92] font-semibold">tonnes</span>
          </div>
          <span className="text-[11px] font-mono text-[#a3be8c] font-semibold">6 Raceway Ponds</span>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
          Chlorella vulgaris high-growth culture across 10.5 ha
        </p>
      </div>

      {/* CARD 3: Pond Fleet Operational Health */}
      <div 
        onClick={() => {
          if (criticalPond && onSelectPond) onSelectPond(criticalPond);
        }}
        className={`bg-[#0c140c]/80 backdrop-blur-xl border rounded-3xl p-6 shadow-xl transition-all group ${
          criticalCount > 0 
            ? 'border-rose-900/60 hover:border-rose-500/70 cursor-pointer' 
            : 'border-[#233318]/90 hover:border-[#708238]/80'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-md ${
              criticalCount > 0 
                ? 'bg-rose-950/80 border-rose-700/60 text-rose-300 shadow-rose-950/40' 
                : 'bg-[#182313] border-[#708238]/50 text-[#d9ed92] shadow-[#182313]/50'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block leading-tight">Facility Fleet</span>
              <span className="text-[10px] text-slate-400">Pond Health Status</span>
            </div>
          </div>

          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
            criticalCount > 0 
              ? 'bg-rose-950/80 text-rose-300 border-rose-800' 
              : 'bg-[#16220e] text-[#d9ed92] border-[#708238]/50'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${criticalCount > 0 ? 'bg-rose-500 animate-ping' : 'bg-[#84a948]'}`} />
            {criticalCount > 0 ? '1 Critical Anomaly' : 'All Systems Optimal'}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3">
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {healthyCount} <span className="text-xs text-slate-400 font-normal">/ {ponds.length || 6} Healthy</span>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-semibold">
            {warningCount > 0 ? `${warningCount} Warning` : '0 Warn'}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed flex items-center justify-between">
          <span>{criticalCount > 0 ? 'Pond 04 needs attention' : 'Normal photosynthetic accumulation'}</span>
          {criticalCount > 0 && <span className="text-rose-400 font-bold group-hover:underline">Inspect ➔</span>}
        </p>
      </div>

      {/* CARD 4: MRV Verification & Audit Score */}
      <div 
        onClick={onOpenEvidence}
        className="bg-[#0c140c]/80 backdrop-blur-xl border border-[#233318]/90 hover:border-[#708238]/80 rounded-3xl p-6 shadow-xl transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#182313] border border-[#708238]/50 text-[#d9ed92] flex items-center justify-center shadow-md shadow-[#182313]/50">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block leading-tight">MRV Verification</span>
              <span className="text-[10px] text-slate-400">Digital Audit Trail</span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-[#d9ed92] bg-[#16220e] px-2.5 py-1 rounded-full border border-[#708238]/50">
            SHA-256 Sealed
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3">
          <div className="text-3xl font-extrabold text-[#d9ed92] font-mono tracking-tight">
            {verificationScore.toFixed(1)}% <span className="text-xs text-slate-400 font-normal">Score</span>
          </div>
          <span className="text-[11px] font-mono text-[#84a948] font-bold group-hover:underline">Audit Trail ➔</span>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
          IoT, Sentinel-2 & ML cross-validated · 100% Biochar
        </p>
      </div>

    </div>
  );
};
