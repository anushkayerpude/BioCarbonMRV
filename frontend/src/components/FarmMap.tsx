import React, { useState } from 'react';
import type { Pond } from '../types';
import { MapPin, Eye } from 'lucide-react';

interface FarmMapProps {
  ponds: Pond[];
  onSelectPond: (pond: Pond) => void;
  selectedPondId?: string;
}

export const FarmMap: React.FC<FarmMapProps> = ({
  ponds,
  onSelectPond,
  selectedPondId
}) => {
  const [viewMode, setViewMode] = useState<'schematic' | 'gis'>('schematic');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/90 text-rose-300 border-rose-600/80',
          dot: 'bg-rose-500 animate-ping',
          text: 'CRITICAL ANOMALY',
          colorClass: 'border-rose-500/80 shadow-rose-900/40'
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-950/90 text-amber-300 border-amber-600/80',
          dot: 'bg-amber-500',
          text: 'WARNING',
          colorClass: 'border-amber-500/80 shadow-amber-900/40'
        };
      default:
        return {
          bg: 'bg-emerald-950/90 text-emerald-300 border-emerald-600/80',
          dot: 'bg-emerald-500',
          text: 'HEALTHY',
          colorClass: 'border-emerald-500/50 shadow-emerald-950/40'
        };
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 mb-6">
      
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>Farm Layout & Digital Twin Ponds</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gujarat Algae Farm (23.21°N, 72.63°E) • 6 Cultivation Raceway Ponds
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('schematic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'schematic'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Digital Twin Grid
          </button>
          <button
            onClick={() => setViewMode('gis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'gis'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite GIS Map
          </button>
        </div>
      </div>

      {/* View 1: Digital Twin Grid View */}
      {viewMode === 'schematic' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ponds.map((pond) => {
            const statusInfo = getStatusBadge(pond.status);
            const isSelected = selectedPondId === pond.pond_id;

            return (
              <div
                key={pond.pond_id}
                onClick={() => onSelectPond(pond)}
                className={`group relative rounded-2xl p-5 border transition-all cursor-pointer bg-slate-900/90 ${
                  statusInfo.colorClass
                } ${
                  isSelected ? 'ring-2 ring-emerald-400 scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                {/* Status bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-white font-mono">{pond.name}</span>
                    <span className="text-xs text-slate-400 font-mono">({pond.pond_id})</span>
                  </div>

                  <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold ${statusInfo.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                    <span>{statusInfo.text}</span>
                  </div>
                </div>

                {/* Raceway Pond Visual representation */}
                <div className="h-28 rounded-xl relative overflow-hidden mb-4 border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                  {/* Pond Algae Water Texture */}
                  <div 
                    className={`absolute inset-0 opacity-80 transition-all ${
                      pond.status === 'CRITICAL'
                        ? 'bg-gradient-to-r from-amber-900/60 via-rose-900/70 to-yellow-900/60'
                        : pond.status === 'WARNING'
                        ? 'bg-gradient-to-r from-emerald-900/60 via-amber-900/50 to-emerald-900/60'
                        : 'bg-gradient-to-r from-emerald-950 via-emerald-800/80 to-teal-900/90'
                    }`}
                  />

                  {/* Raceway Divider Line */}
                  <div className="absolute inset-x-8 top-1/2 h-2 -translate-y-1/2 bg-slate-800/90 rounded-full border border-slate-700" />
                  
                  {/* Live Telemetry Overlay */}
                  <div className="relative z-10 text-center bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Biomass Density</div>
                    <div className="text-xl font-bold font-mono text-white">
                      {pond.current_biomass.toFixed(2)} <span className="text-xs text-emerald-400 font-normal">g/L</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Area</span>
                    <span className="font-mono text-slate-200">{pond.area} ha</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Depth</span>
                    <span className="font-mono text-slate-200">{pond.depth} m</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Species</span>
                    <span className="font-mono text-slate-200">Chlorella</span>
                  </div>
                </div>

                {/* Inspect action button */}
                <div className="mt-3 flex items-center justify-between text-xs text-emerald-400 font-medium group-hover:text-emerald-300">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Inspect Digital Twin
                  </span>
                  <span className="font-mono font-bold">➔</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View 2: GIS Satellite Map Representation */
        <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
            <MapPin className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">GIS Satellite Coordinates: 23.2100° N, 72.6300° E</h3>
          <p className="text-sm text-slate-400 max-w-lg mb-6">
            Gujarat Cultivation Site • 6 Tracked Raceway Units • Multi-Spectral Remote Sensing Active
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {ponds.map(p => (
              <button
                key={p.pond_id}
                onClick={() => onSelectPond(p)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                  p.status === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                    : p.status === 'WARNING'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}
              >
                <span>{p.name} ({p.pond_id})</span>
                <span>• {p.current_biomass.toFixed(2)} g/L</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
