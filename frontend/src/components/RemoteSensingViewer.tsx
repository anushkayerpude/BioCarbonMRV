import React, { useState } from 'react';
import type { Pond } from '../types';
import { Compass, Camera, Sparkles } from 'lucide-react';

interface RemoteSensingViewerProps {
  ponds: Pond[];
}

export const RemoteSensingViewer: React.FC<RemoteSensingViewerProps> = ({ ponds }) => {
  const [selectedPondId, setSelectedPondId] = useState<string>('P04');
  const [spectralLayer, setSpectralLayer] = useState<'rgb' | 'ngi' | 'segmentation'>('rgb');

  const selectedPond = ponds.find(p => p.pond_id === selectedPondId) || ponds[0];
  const isCritical = selectedPond?.status === 'CRITICAL';

  // Spectral metrics
  const ngiValue = isCritical ? 0.42 : 0.78;
  const algaeIndex = isCritical ? 0.52 : 0.91;
  const imageBiomass = isCritical ? 1.48 : 2.38;
  const imageConfidence = isCritical ? 0.86 : 0.94;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-teal-400" />
              <span>Drone & Satellite Remote Sensing Module</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              OpenCV Spectral Index Pipeline • Raceways Algae Density & Biomass Proxy Extraction
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-mono">Select Pond:</span>
            <select
              value={selectedPondId}
              onChange={(e) => setSelectedPondId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {ponds.map(p => (
                <option key={p.pond_id} value={p.pond_id}>
                  {p.name} ({p.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Image Viewer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Synthetic Image Display Canvas */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                {selectedPond?.name} ({selectedPondId}) • 10cm/px Multispectral Tile
              </h3>
            </div>

            {/* Layer Filter Controls */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {(['rgb', 'ngi', 'segmentation'] as const).map((layer) => (
                <button
                  key={layer}
                  onClick={() => setSpectralLayer(layer)}
                  className={`px-3 py-1 rounded-lg font-bold uppercase transition-all ${
                    spectralLayer === layer ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          {/* Rendered Synthetic Image Tile */}
          <div className="h-80 w-full rounded-2xl border border-slate-800 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
            {/* Tile Background */}
            <div 
              className={`absolute inset-0 transition-all duration-500 ${
                spectralLayer === 'ngi'
                  ? isCritical
                    ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-600'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                  : spectralLayer === 'segmentation'
                  ? 'bg-slate-900 border-4 border-cyan-400'
                  : isCritical
                  ? 'bg-gradient-to-br from-amber-900 via-yellow-950 to-stone-900'
                  : 'bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900'
              }`}
            />

            {/* Raceways Raceway Oval Canvas drawing */}
            <div className="relative z-10 w-full h-full border-4 border-slate-700/80 rounded-3xl flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="w-1.5 h-full bg-slate-600/80 rounded-full" />
              
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                Layer: <strong className="text-teal-400 uppercase">{spectralLayer}</strong>
              </div>

              <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                Confidence: <strong className="text-emerald-400">{(imageConfidence * 100).toFixed(0)}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Image Features Breakdown */}
        <div className="space-y-4">
          
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Extracted Spectral Metrics</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Normalized Green Index (NGI)</span>
                  <span className="text-emerald-400 font-bold">{ngiValue.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${ngiValue * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Algae Canopy Index</span>
                  <span className="text-teal-400 font-bold">{algaeIndex.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-full" style={{ width: `${algaeIndex * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Estimated Image Biomass</span>
                  <span className="text-purple-400 font-bold">{imageBiomass.toFixed(2)} g/L</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: `${(imageBiomass / 3.0) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">OpenCV Pipeline Summary</h4>
            <pre className="text-[11px] font-mono text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto">
{`{
  "pond_id": "${selectedPondId}",
  "algae_index": ${algaeIndex},
  "estimated_biomass": ${imageBiomass},
  "image_confidence": ${imageConfidence}
}`}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
