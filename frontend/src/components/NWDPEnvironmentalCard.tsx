import React from 'react';
import type { NWDPEnvironmentalContext } from '../types';
import { Thermometer, Sun, CloudRain, Droplets, MapPin, Database, Clock, Info } from 'lucide-react';

interface NWDPEnvironmentalCardProps {
  nwdpContext: NWDPEnvironmentalContext | null;
}

export const NWDPEnvironmentalCard: React.FC<NWDPEnvironmentalCardProps> = ({ nwdpContext }) => {
  if (!nwdpContext || !nwdpContext.parameters) {
    return (
      <div className="glass-panel rounded-2xl p-4 border border-amber-500/30 text-slate-400">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Database className="w-4 h-4" /> Latest NWDP Observation
        </div>
        <p className="text-xs text-slate-400">Loading NWDP environmental telemetry context...</p>
      </div>
    );
  }

  const { parameters, timestamp, source } = nwdpContext;
  const temp = parameters.temperature;
  const solar = parameters.solar_radiation;
  const rain = parameters.rainfall;
  const humid = parameters.relative_humidity;

  const stationName = temp?.station_name || 'Gandhinagar Hydro-Met Station';
  const stationId = temp?.station_id || 'NWDP-GJ-001';
  const distanceKm = temp?.distance_to_aoi_km || 2.33;

  // Format observation timestamp
  const obsTime = timestamp ? new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }) : '2026-07-28 07:00 UTC';

  return (
    <div className="glass-panel rounded-2xl p-4 border border-amber-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 shadow-lg relative overflow-hidden group">
      
      {/* Top Header Badge & Source Label */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-500/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              Latest NWDP Observation
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                DATA SOURCE = {source || 'NWDP'}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span className="text-slate-200 font-medium">{stationName}</span> ({stationId}) • <span className="text-amber-400 font-semibold">{distanceKm} km from AOI</span>
            </p>
          </div>
        </div>

        {/* Timestamp Badge */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{obsTime}</span>
        </div>
      </div>

      {/* Distinction Alert Banner: Station Environmental Context vs Pond IoT */}
      <div className="flex items-start gap-1.5 text-[10px] text-amber-200/90 bg-amber-950/40 border border-amber-500/20 rounded-lg p-2 mb-3">
        <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong className="text-amber-300">Station Environmental Context:</strong> External ambient weather observation from NWDP Gujarat station node. Distinct from pond-level IoT sensor readings.
        </span>
      </div>

      {/* 4 Multi-Parameter Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        {/* 1. Temperature */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-medium uppercase tracking-wider">Air Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold text-white font-mono">{temp?.value !== undefined ? temp.value.toFixed(1) : '--'}</span>
            <span className="text-xs text-amber-400 font-semibold">{temp?.unit || '°C'}</span>
          </div>
        </div>

        {/* 2. Solar Radiation */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80 hover:border-yellow-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-medium uppercase tracking-wider">Solar Rad</span>
            <Sun className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold text-yellow-300 font-mono">{solar?.value !== undefined ? solar.value.toFixed(0) : '--'}</span>
            <span className="text-[10px] text-yellow-400 font-semibold">{solar?.unit || 'W/m²'}</span>
          </div>
        </div>

        {/* 3. Rainfall */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-medium uppercase tracking-wider">Rainfall</span>
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold text-cyan-300 font-mono">{rain?.value !== undefined ? rain.value.toFixed(1) : '--'}</span>
            <span className="text-xs text-cyan-400 font-semibold">{rain?.unit || 'mm'}</span>
          </div>
        </div>

        {/* 4. Relative Humidity */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-medium uppercase tracking-wider">Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold text-blue-300 font-mono">{humid?.value !== undefined ? humid.value.toFixed(1) : '--'}</span>
            <span className="text-xs text-blue-400 font-semibold">{humid?.unit || '%'}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
