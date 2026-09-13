import React, { useState } from 'react';
import { Flame, Waves, Building, Sprout, Box, Fish, Zap, ShieldCheck, Info } from 'lucide-react';

interface BiomassFateTrackerProps {
  netCo2Kg: number;
}

export const BiomassFateTracker: React.FC<BiomassFateTrackerProps> = ({
  netCo2Kg = 41097.5
}) => {
  const [selectedPathway, setSelectedPathway] = useState<string>('biochar');

  const pathways = [
    {
      id: 'biochar',
      name: 'Biochar & Pyrolysis Soil Injection',
      score: 100.0,
      horizon: '1000+ Years (Geological)',
      tier: 'TIER 1 · PERMANENT',
      icon: Flame,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/60 border-amber-500/50',
      description: 'Pyrolyzed at 600°C into recalcitrant carbon biochar injected into deep soil matrices.'
    },
    {
      id: 'deep_sea',
      name: 'Deep-Sea Anoxic Sediment Burial',
      score: 100.0,
      horizon: '1000+ Years (Oceanic)',
      tier: 'TIER 1 · PERMANENT',
      icon: Waves,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/60 border-cyan-500/50',
      description: 'Compressed biomass blocks deposited in deep benthic ocean trenches devoid of oxygen.'
    },
    {
      id: 'concrete',
      name: 'Bio-Concrete Building Additive',
      score: 95.0,
      horizon: '500+ Years (Built Env)',
      tier: 'TIER 1 · PERMANENT',
      icon: Building,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/60 border-purple-500/50',
      description: 'Mineralized algae ash incorporated into structural concrete and infrastructure composite.'
    },
    {
      id: 'soil_amendment',
      name: 'Agricultural Soil Amendment',
      score: 75.0,
      horizon: '100+ Years (Regenerative)',
      tier: 'TIER 2 · DURABLE',
      icon: Sprout,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/60 border-emerald-500/50',
      description: 'Enriched organic bio-stimulant promoting long-term soil humic substance formation.'
    },
    {
      id: 'bioplastic',
      name: 'Durable Bio-Polymers & Composites',
      score: 60.0,
      horizon: '50+ Years (Industrial)',
      tier: 'TIER 2 · DURABLE',
      icon: Box,
      color: 'text-teal-400',
      bgColor: 'bg-teal-950/60 border-teal-500/50',
      description: 'Algae biopolymers formulated for long-lifecycle automotive and construction panels.'
    },
    {
      id: 'animal_feed',
      name: 'Aquaculture & Cattle Protein Feed',
      score: 15.0,
      horizon: '1-5 Years (Short Cycle)',
      tier: 'TIER 3 · SHORT CYCLE',
      icon: Fish,
      color: 'text-amber-300',
      bgColor: 'bg-slate-900 border-slate-800',
      description: 'High-protein feed substitute. Fast metabolic turnover results in rapid carbon re-release.'
    },
    {
      id: 'biofuel',
      name: 'Aviation Biofuel / Combustion',
      score: 0.0,
      horizon: 'Immediate Emission (Recycled)',
      tier: 'TIER 4 · NEUTRAL',
      icon: Zap,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/40 border-rose-800/60',
      description: 'Refined into sustainable aviation fuel. Carbon is combusted and re-emitted immediately.'
    }
  ];

  const current = pathways.find((p) => p.id === selectedPathway) || pathways[0];
  const permanentCreditsKg = (netCo2Kg * current.score) / 100.0;
  const permanentCreditsTonnes = permanentCreditsKg / 1000.0;

  return (
    <div className="bg-[#0a0f0a]/95 backdrop-blur-2xl border border-[#283618]/90 rounded-3xl p-6 shadow-2xl space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#283618]/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#a3be8c]" />
            <h3 className="text-base font-extrabold text-white">Biomass Fate & Permanence Tracking</h3>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#1c2710] text-[#d9ed92] border border-[#708238] rounded-full">
              AUDIT COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Assign permanence scores based on post-harvest end-product disposition. Avoid false claims from short-cycle uses.
          </p>
        </div>

        <div className="bg-[#10170d] px-4 py-2 rounded-2xl border border-[#283618] text-right">
          <span className="text-[10px] text-slate-400 block font-mono">Verified Permanent Credits</span>
          <span className="text-xl font-black text-[#d9ed92] font-mono">
            {permanentCreditsTonnes.toFixed(2)} <span className="text-xs text-slate-300">t CO₂e</span>
          </span>
        </div>
      </div>

      {/* PATHWAY SELECTOR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pathways.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedPathway === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedPathway(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-[#10170d] border-[#84a948] ring-2 ring-[#708238]/40 scale-[1.02]'
                  : 'bg-[#0a0f0a]/60 border-[#283618]/70 hover:border-[#708238]/40'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-xl border ${item.bgColor}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-xs font-bold text-white">{item.name}</span>
                </div>

                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  item.score >= 90 ? 'bg-[#283618] text-[#d9ed92] border border-[#708238]' :
                  item.score >= 60 ? 'bg-[#1c2710] text-[#a3be8c] border border-[#606c38]' :
                  item.score >= 15 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {item.score}% PERMANENCE
                </span>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                {item.description}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono border-t border-[#283618]/60 pt-2 text-slate-400">
                <span>{item.horizon}</span>
                <span className={item.color}>{item.tier}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED PERMANENCE BREAKDOWN PANEL */}
      <div className="bg-[#0a0f0a] p-5 rounded-2xl border border-[#283618]/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start space-x-3 max-w-xl">
          <Info className="w-5 h-5 text-[#a3be8c] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-1">
              PERMANENCE CALCULATION SUMMARY ({current.name})
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Net CO₂ Removed ({netCo2Kg.toFixed(1)} kg) × Permanence Score ({current.score}%) ={' '}
              <strong className="text-[#d9ed92]">{permanentCreditsKg.toFixed(1)} kg ({permanentCreditsTonnes.toFixed(3)} tonnes)</strong> verified permanent carbon credits.
            </p>
          </div>
        </div>

        <div className="w-full md:w-64 bg-[#10170d] p-3 rounded-xl border border-[#283618] space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Permanence Score</span>
            <span className="text-[#d9ed92] font-bold">{current.score}%</span>
          </div>

          <div className="w-full h-2 bg-[#1b250e] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#556b2f] via-[#708238] to-[#d9ed92] transition-all duration-500"
              style={{ width: `${current.score}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>0% (Combustion)</span>
            <span>100% (1000+ Yrs)</span>
          </div>
        </div>
      </div>

    </div>
  );
};
