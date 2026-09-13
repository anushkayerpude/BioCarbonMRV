import React from 'react';
import type { Pond } from '../types';
import { Layers, Eye } from 'lucide-react';

interface BioCarbonPondFleetGridProps {
  ponds: Pond[];
  onSelectPond: (pond: Pond) => void;
  selectedPondId?: string;
}

export const BioCarbonPondFleetGrid: React.FC<BioCarbonPondFleetGridProps> = ({
  ponds,
  onSelectPond,
  selectedPondId
}) => {
  const healthyCount = ponds.filter(p => p.status === 'HEALTHY').length;
  const warningCount = ponds.filter(p => p.status === 'WARNING').length;
  const criticalCount = ponds.filter(p => p.status === 'CRITICAL').length;

  return (
    <div className="w-full h-full bg-[#0c140c]/80 backdrop-blur-2xl border border-[#233318]/90 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#233318]/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#182313] border border-[#708238]/50 text-[#d9ed92] flex items-center justify-center shadow-md shadow-[#182313]/50">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Cultivation Raceway Fleet</span>
              <span className="text-[10px] font-mono font-bold bg-[#16220e] text-[#d9ed92] border border-[#708238]/50 px-2.5 py-0.5 rounded-full">
                {ponds.length} Units Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select any pond below to inspect live IoT telemetry, species purity & predictive growth models
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 bg-[#060a06]/80 px-3 py-1 rounded-xl border border-[#233318]">
            <span className="w-2 h-2 rounded-full bg-[#84a948]" /> {healthyCount} Healthy
          </span>
          <span className="flex items-center gap-1.5 bg-[#060a06]/80 px-3 py-1 rounded-xl border border-[#233318]">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> {warningCount} Warning
          </span>
          <span className="flex items-center gap-1.5 bg-[#060a06]/80 px-3 py-1 rounded-xl border border-[#233318]">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> {criticalCount} Critical
          </span>
        </div>
      </div>

      {/* 6 Raceway Cards Grid: 3 columns x 2 rows in 60% operational panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 flex-1">
        {ponds.map((pond) => {
          const isCritical = pond.status === 'CRITICAL';
          const isWarning = pond.status === 'WARNING';
          const isSelected = selectedPondId === pond.pond_id;

          const statusColor = isCritical
            ? 'border-rose-900/70 bg-[#140b0b]/85 hover:border-rose-500/70 hover:shadow-lg hover:shadow-rose-900/20'
            : isWarning
            ? 'border-amber-900/60 bg-[#141209]/80 hover:border-amber-500/70 hover:shadow-lg hover:shadow-amber-900/20'
            : 'border-[#233318]/90 bg-[#0d160d]/80 hover:border-[#708238]/80 hover:shadow-lg hover:shadow-[#708238]/15';

          return (
            <div
              key={pond.pond_id}
              onClick={() => onSelectPond(pond)}
              className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer group flex flex-col justify-between ${statusColor} ${
                isSelected ? 'ring-2 ring-[#d9ed92] scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-white font-mono">{pond.pond_id}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    isCritical ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-400' : 'bg-[#84a948]'
                  }`} />
                </div>

                <div className="text-xs font-semibold text-slate-200 truncate">{pond.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{pond.area} ha · {pond.species}</div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#233318]/70">
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-base font-extrabold text-white">
                    {pond.current_biomass.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#84a948] font-bold">g/L</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[9px] font-bold">
                  <span className={`${
                    isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-[#a3be8c]'
                  }`}>
                    {pond.status}
                  </span>
                  <span className="text-[#84a948] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-sans font-semibold">
                    <Eye className="w-3 h-3" /> Inspect
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
