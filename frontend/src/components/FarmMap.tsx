import React, { useState, useEffect, useRef } from 'react';
import type { Pond } from '../types';
import { MapPin, Eye, Layers, Plus, Minus, Crosshair } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const [viewMode, setViewMode] = useState<'gis' | 'schematic'>('gis');
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'street' | 'dark'>('satellite');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayersRef = useRef<{ [key: string]: L.TileLayer }>({});
  const polygonGroupRef = useRef<L.FeatureGroup | null>(null);

  // Gujarat Algae Farm Center [Latitude, Longitude]
  const farmCenter: [number, number] = [23.2100, 72.6300];

  // 6 Raceway Pond Polygon Coordinates in Leaflet [Lat, Lng] format
  const pondPolygons: { [id: string]: [number, number][] } = {
    P01: [[23.2120, 72.6275], [23.2122, 72.6295], [23.2105, 72.6298], [23.2103, 72.6278]],
    P02: [[23.2123, 72.6305], [23.2125, 72.6325], [23.2108, 72.6328], [23.2106, 72.6308]],
    P03: [[23.2098, 72.6278], [23.2100, 72.6298], [23.2083, 72.6301], [23.2081, 72.6281]],
    P04: [[23.2101, 72.6308], [23.2103, 72.6328], [23.2086, 72.6331], [23.2084, 72.6311]],
    P05: [[23.2076, 72.6281], [23.2078, 72.6301], [23.2061, 72.6304], [23.2059, 72.6284]],
    P06: [[23.2079, 72.6311], [23.2081, 72.6331], [23.2064, 72.6334], [23.2062, 72.6314]]
  };

  // Initialize Real Leaflet Map
  useEffect(() => {
    if (viewMode !== 'gis' || !mapContainerRef.current) return;

    // Avoid double initialization
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: farmCenter,
      zoom: 15.5,
      zoomControl: false,
      attributionControl: false
    });
    leafletMapRef.current = map;

    // Real Basemap Tile Layers
    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Esri World Imagery' }
    );

    const street = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19, attribution: 'OpenStreetMap contributors' }
    );

    const dark = L.tileLayer(
      'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
      { maxZoom: 19, attribution: 'CARTO Dark Matter' }
    );

    tileLayersRef.current = { satellite, street, dark };
    tileLayersRef.current[activeLayer].addTo(map);

    // Feature group for ponds
    const fg = L.featureGroup().addTo(map);
    polygonGroupRef.current = fg;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      leafletMapRef.current = null;
    };
  }, [viewMode]);

  // Update Tile Layer when user toggles
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || viewMode !== 'gis') return;

    Object.values(tileLayersRef.current).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });

    if (tileLayersRef.current[activeLayer]) {
      tileLayersRef.current[activeLayer].addTo(map);
    }
  }, [activeLayer, viewMode]);

  // Render Ponds and Markers on Leaflet Map
  useEffect(() => {
    const map = leafletMapRef.current;
    const fg = polygonGroupRef.current;
    if (!map || !fg || viewMode !== 'gis') return;

    fg.clearLayers();

    ponds.forEach(pond => {
      const coords = pondPolygons[pond.pond_id];
      if (!coords) return;

      const isCritical = pond.status === 'CRITICAL';
      const isWarning = pond.status === 'WARNING';
      const isSelected = selectedPondId === pond.pond_id;

      const color = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#84a948';
      const fillColor = isCritical 
        ? 'rgba(244, 63, 94, 0.45)' 
        : isWarning 
        ? 'rgba(245, 158, 11, 0.45)' 
        : 'rgba(132, 169, 72, 0.45)';

      // Polygon Boundary
      const polygon = L.polygon(coords, {
        color: isSelected ? '#d9ed92' : color,
        weight: isSelected ? 3.5 : 2.5,
        fillColor: fillColor,
        fillOpacity: 0.75
      }).addTo(fg);

      polygon.on('click', () => {
        onSelectPond(pond);
      });

      // Compute Center for DivIcon Marker
      const centerLat = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
      const centerLng = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;

      const customIcon = L.divIcon({
        className: 'leaflet-pond-marker-wrapper',
        html: `
          <div style="background: rgba(10, 16, 10, 0.95); border: 1.5px solid ${color}; color: #f8fafc; padding: 3px 8px; border-radius: 20px; font-family: ui-monospace, monospace; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); cursor: pointer; white-space: nowrap; ${isSelected ? 'outline: 2px solid #d9ed92;' : ''}">
            <span style="width: 7px; height: 7px; border-radius: 9999px; background: ${color}; ${isCritical ? 'box-shadow: 0 0 8px #f43f5e;' : ''}"></span>
            <span>${pond.pond_id}</span>
            <span style="color: #d9ed92; font-weight: 800;">${pond.current_biomass.toFixed(2)} g/L</span>
          </div>
        `,
        iconSize: [110, 24],
        iconAnchor: [55, 12]
      });

      const marker = L.marker([centerLat, centerLng], { icon: customIcon }).addTo(fg);

      marker.on('click', () => {
        onSelectPond(pond);
      });
    });
  }, [ponds, selectedPondId, viewMode]);

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
    <div className="bg-[#0c140c]/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-[#233318]/90 shadow-2xl mb-8">
      
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#233318]/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#182313] border border-[#708238]/60 text-[#d9ed92] flex items-center justify-center shadow-md shadow-[#182313]/60">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 font-sans">
              <span>Gujarat Algae Farm & Digital Twin</span>
              <span className="text-[10px] font-mono font-bold bg-[#16220e] text-[#d9ed92] border border-[#708238]/60 px-2 py-0.5 rounded-full">
                LEAFLET ENGINE
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              23.2100° N, 72.6300° E • 6 Tracked Raceway Units (10.5 ha Total AOI)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#060a06]/90 p-1.5 rounded-2xl border border-[#233318]">
          <button
            onClick={() => setViewMode('gis')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'gis'
                ? 'bg-[#708238] text-white shadow-md shadow-[#708238]/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182313]'
            }`}
          >
            Real Leaflet Map
          </button>
          <button
            onClick={() => setViewMode('schematic')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'schematic'
                ? 'bg-[#708238] text-white shadow-md shadow-[#708238]/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182313]'
            }`}
          >
            Digital Twin Grid
          </button>
        </div>
      </div>

      {/* VIEW 1: Real Leaflet Map */}
      {viewMode === 'gis' ? (
        <div className="relative w-full h-[580px] lg:h-[640px] rounded-2xl overflow-hidden border border-[#233318]/90 shadow-2xl bg-[#060a06]">
          {/* Leaflet DOM container */}
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

          {/* Floating Top Controls: Layer Switcher */}
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-[#0a110a]/90 backdrop-blur-xl p-1 rounded-2xl border border-[#233318] shadow-xl">
            <button
              onClick={() => setActiveLayer('satellite')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeLayer === 'satellite'
                  ? 'bg-[#708238] text-white shadow-md shadow-[#708238]/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#182313]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setActiveLayer('street')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeLayer === 'street'
                  ? 'bg-[#708238] text-white shadow-md shadow-[#708238]/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#182313]'
              }`}
            >
              <span>Streets</span>
            </button>
            <button
              onClick={() => setActiveLayer('dark')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeLayer === 'dark'
                  ? 'bg-[#708238] text-white shadow-md shadow-[#708238]/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#182313]'
              }`}
            >
              <span>Dark Matter</span>
            </button>
          </div>

          {/* Floating Zoom & Re-Center Controls */}
          <div className="absolute right-4 top-16 z-20 flex flex-col items-center space-y-1.5 bg-[#0a110a]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-[#233318] shadow-xl">
            <button
              onClick={() => leafletMapRef.current?.zoomIn()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#d9ed92] hover:bg-[#182313] transition-colors"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => leafletMapRef.current?.zoomOut()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#d9ed92] hover:bg-[#182313] transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-5 h-[1px] bg-[#233318]" />
            <button
              onClick={() => leafletMapRef.current?.setView(farmCenter, 15.5)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#d9ed92] hover:bg-[#182313] transition-colors"
              title="Re-center"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Bottom Left: Selected Pond Quick Info Pill */}
          <div className="absolute left-4 bottom-4 z-20 bg-[#0a110a]/90 backdrop-blur-xl p-3 rounded-2xl border border-[#233318] shadow-xl text-xs font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Leaflet Live Interactive MRV
            </span>
            <span className="text-slate-200 font-semibold">Click any raceway polygon to inspect Digital Twin</span>
          </div>

        </div>
      ) : (
        /* VIEW 2: Digital Twin Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ponds.map((pond) => {
            const statusInfo = getStatusBadge(pond.status);
            const isSelected = selectedPondId === pond.pond_id;

            return (
              <div
                key={pond.pond_id}
                onClick={() => onSelectPond(pond)}
                className={`group relative rounded-2xl p-5 border transition-all cursor-pointer bg-[#0c140c]/85 ${
                  statusInfo.colorClass
                } ${
                  isSelected ? 'ring-2 ring-[#d9ed92] scale-[1.02]' : 'hover:scale-[1.01]'
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
                <div className="h-28 rounded-xl relative overflow-hidden mb-4 border border-[#233318] bg-[#060a06] flex items-center justify-center p-2">
                  <div 
                    className={`absolute inset-0 opacity-80 transition-all ${
                      pond.status === 'CRITICAL'
                        ? 'bg-gradient-to-r from-amber-900/60 via-rose-900/70 to-yellow-900/60'
                        : pond.status === 'WARNING'
                        ? 'bg-gradient-to-r from-emerald-900/60 via-amber-900/50 to-emerald-900/60'
                        : 'bg-gradient-to-r from-[#141d0b] via-[#283618] to-[#141d0b]'
                    }`}
                  />
                  <div className="absolute inset-x-8 top-1/2 h-2 -translate-y-1/2 bg-[#1c2710] rounded-full border border-[#708238]/50" />
                  
                  <div className="relative z-10 text-center bg-[#0a110a]/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#233318]">
                    <div className="text-[10px] text-slate-400">Biomass Density</div>
                    <div className="text-xl font-bold font-mono text-white">
                      {pond.current_biomass.toFixed(2)} <span className="text-xs text-[#d9ed92] font-normal">g/L</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-[#233318]/80 pt-3">
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
                <div className="mt-3 flex items-center justify-between text-xs text-[#d9ed92] font-medium group-hover:text-white transition-colors">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Inspect Digital Twin
                  </span>
                  <span className="font-mono font-bold">➔</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
