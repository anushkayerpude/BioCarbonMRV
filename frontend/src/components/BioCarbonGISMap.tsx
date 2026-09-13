import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Pond } from '../types';
import { MapPin, Plus, Minus, Crosshair, Layers } from 'lucide-react';

interface BioCarbonGISMapProps {
  ponds: Pond[];
  onSelectPond: (pond: Pond) => void;
  selectedPondId?: string;
}

// Gujarat Algae Farm Center Coordinates (Ahmedabad, Gujarat)
const farmCenter: [number, number] = [72.6300, 23.2100];

// 6 Raceway Pond GeoJSON Polygon Coordinates
const pondFeatures = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'P01', name: 'Raceway Pond 01', status: 'HEALTHY' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[72.6275, 23.2120], [72.6295, 23.2122], [72.6298, 23.2105], [72.6278, 23.2103], [72.6275, 23.2120]]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'P02', name: 'Raceway Pond 02', status: 'HEALTHY' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[72.6305, 23.2123], [72.6325, 23.2125], [72.6328, 23.2108], [72.6308, 23.2106], [72.6305, 23.2123]]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'P03', name: 'Raceway Pond 03', status: 'HEALTHY' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[72.6278, 23.2098], [72.6298, 23.2100], [72.6301, 23.2083], [72.6281, 23.2081], [72.6278, 23.2098]]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'P04', name: 'Raceway Pond 04', status: 'CRITICAL' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[72.6308, 23.2101], [72.6328, 23.2103], [72.6331, 23.2086], [72.6311, 23.2084], [72.6308, 23.2101]]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'P05', name: 'Raceway Pond 05', status: 'HEALTHY' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[72.6281, 23.2076], [72.6301, 23.2078], [72.6304, 23.2061], [72.6284, 23.2059], [72.6281, 23.2076]]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'P06', name: 'Raceway Pond 06', status: 'WARNING' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[72.6311, 23.2079], [72.6331, 23.2081], [72.6334, 23.2064], [72.6314, 23.2062], [72.6311, 23.2079]]]
      }
    }
  ]
};

const nodePositions: { id: string; coords: [number, number] }[] = [
  { id: 'P01', coords: [72.6286, 23.2112] },
  { id: 'P02', coords: [72.6316, 23.2115] },
  { id: 'P03', coords: [72.6289, 23.2090] },
  { id: 'P04', coords: [72.6319, 23.2093] },
  { id: 'P05', coords: [72.6292, 23.2068] },
  { id: 'P06', coords: [72.6322, 23.2071] }
];

export const BioCarbonGISMap: React.FC<BioCarbonGISMapProps> = ({
  ponds,
  onSelectPond,
  selectedPondId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapMode, setMapMode] = useState<'map' | 'satellite' | 'bhuvan' | '3d'>('satellite');
  const [mapLoaded, setMapLoaded] = useState(false);
  const pondsRef = useRef(ponds);
  const onSelectPondRef = useRef(onSelectPond);

  useEffect(() => {
    pondsRef.current = ponds;
    onSelectPondRef.current = onSelectPond;
  }, [ponds, onSelectPond]);

  // Initialize MapLibre GL Map with authentic real raster basemap tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
          },
          'satellite-labels': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256
          },
          'carto-dark-tiles': {
            type: 'raster',
            tiles: [
              'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; CARTO'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            layout: { visibility: 'visible' }
          },
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark-tiles',
            layout: { visibility: 'none' }
          },
          {
            id: 'satellite-labels-layer',
            type: 'raster',
            source: 'satellite-labels',
            layout: { visibility: 'visible' }
          }
        ]
      },
      center: farmCenter,
      zoom: 15.3,
      pitch: 25,
      bearing: 0,
      attributionControl: false
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // Add ISRO Bhuvan WMS water bodies layer
      map.addSource('bhuvan-wms-source', {
        type: 'raster',
        tiles: [
          'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms?service=WMS&request=GetMap&layers=basemap:waterbody_DEM&styles=&format=image/png&transparent=true&version=1.1.1&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}'
        ],
        tileSize: 256
      });

      map.addLayer({
        id: 'bhuvan-wms-layer',
        type: 'raster',
        source: 'bhuvan-wms-source',
        layout: {
          visibility: 'none'
        },
        paint: {
          'raster-opacity': 0.8
        }
      });

      // Add GeoJSON source for raceway ponds
      map.addSource('raceway-ponds', {
        type: 'geojson',
        data: pondFeatures as any
      });

      // Fill Layer for Pond Polygons
      map.addLayer({
        id: 'ponds-fill',
        type: 'fill',
        source: 'raceway-ponds',
        paint: {
          'fill-color': [
            'match',
            ['get', 'status'],
            'CRITICAL', 'rgba(244, 63, 94, 0.35)',
            'WARNING', 'rgba(245, 158, 11, 0.35)',
            'rgba(132, 169, 72, 0.35)'
          ],
          'fill-opacity': 0.85
        }
      });

      // Line Layer for Pond Boundaries
      map.addLayer({
        id: 'ponds-outline',
        type: 'line',
        source: 'raceway-ponds',
        paint: {
          'line-color': [
            'match',
            ['get', 'status'],
            'CRITICAL', '#f43f5e',
            'WARNING', '#f59e0b',
            '#84a948'
          ],
          'line-width': 2.5
        }
      });

      // Click event on Pond Fill layer
      map.on('click', 'ponds-fill', (e: maplibregl.MapLayerMouseEvent) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const pId = feature.properties?.id;
          const foundPond = pondsRef.current.find((p) => p.pond_id === pId);
          if (foundPond) onSelectPondRef.current(foundPond);
        }
      });

      map.on('mouseenter', 'ponds-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'ponds-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    // ResizeObserver ensures map dynamically fills the exact 60% viewport
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
    };
  }, []);

  // Update Markers for Pond Telemetry Nodes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    nodePositions.forEach((node) => {
      const pondData = ponds.find((p) => p.pond_id === node.id);
      const status = pondData ? pondData.status : 'HEALTHY';
      const isSelected = selectedPondId === node.id;

      const el = document.createElement('div');
      el.className = `flex items-center space-x-1.5 px-2 py-1 rounded-full border text-[10px] font-mono font-bold cursor-pointer transition-transform hover:scale-110 shadow-xl ${
        status === 'CRITICAL'
          ? 'bg-rose-950/90 text-rose-300 border-rose-600 animate-pulse'
          : status === 'WARNING'
          ? 'bg-amber-950/90 text-amber-300 border-amber-600'
          : 'bg-[#182313]/95 text-[#d9ed92] border-[#708238]'
      } ${isSelected ? 'ring-2 ring-[#d9ed92] scale-110' : ''}`;

      el.innerHTML = `
        <span class="w-2 h-2 rounded-full ${
          status === 'CRITICAL' ? 'bg-rose-500 animate-ping' : status === 'WARNING' ? 'bg-amber-400' : 'bg-[#84a948]'
        }"></span>
        <span>${node.id}</span>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pondData) onSelectPond(pondData);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(node.coords)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [ponds, selectedPondId, mapLoaded, onSelectPond]);

  // Handle View Mode Switching (Map, Satellite, Bhuvan, 3D)
  const handleViewModeChange = (mode: 'map' | 'satellite' | 'bhuvan' | '3d') => {
    setMapMode(mode);
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Toggle base tile layers
    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty(
        'satellite-layer',
        'visibility',
        (mode === 'satellite' || mode === '3d' || mode === 'bhuvan') ? 'visible' : 'none'
      );
    }
    if (map.getLayer('satellite-labels-layer')) {
      map.setLayoutProperty(
        'satellite-labels-layer',
        'visibility',
        (mode === 'satellite' || mode === '3d') ? 'visible' : 'none'
      );
    }
    if (map.getLayer('carto-dark-layer')) {
      map.setLayoutProperty(
        'carto-dark-layer',
        'visibility',
        mode === 'map' ? 'visible' : 'none'
      );
    }

    // Toggle Bhuvan WMS raster layer
    if (map.getLayer('bhuvan-wms-layer')) {
      map.setLayoutProperty(
        'bhuvan-wms-layer',
        'visibility',
        mode === 'bhuvan' ? 'visible' : 'none'
      );
    }

    if (mode === '3d') {
      map.flyTo({
        center: farmCenter,
        zoom: 16.2,
        pitch: 60,
        bearing: -35,
        duration: 1500
      });
    } else if (mode === 'bhuvan') {
      map.flyTo({
        center: farmCenter,
        zoom: 14.8,
        pitch: 20,
        bearing: 0,
        duration: 1200
      });
    } else if (mode === 'satellite') {
      map.flyTo({
        center: farmCenter,
        zoom: 15.3,
        pitch: 25,
        bearing: 0,
        duration: 1200
      });
    } else {
      map.flyTo({
        center: farmCenter,
        zoom: 15,
        pitch: 0,
        bearing: 0,
        duration: 1200
      });
    }
  };

  return (
    <div className="relative w-full h-[660px] lg:h-[730px] 2xl:h-[780px] rounded-3xl overflow-hidden border border-[#233318]/90 shadow-2xl bg-[#060a06] flex flex-col justify-between">
      
      {/* MAP CONTAINER FOR MAPLIBRE GL JS */}
      <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />

      {/* MAP TOP BAR HEADER OVERLAY */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Location Info Pill */}
        <div className="bg-[#0a110a]/85 backdrop-blur-xl border border-[#233318]/80 px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-3 pointer-events-auto">
          <div className="w-9 h-9 rounded-xl bg-[#1c2710] border border-[#708238]/60 flex items-center justify-center shadow-md shadow-[#1c2710]/60">
            <MapPin className="w-4 h-4 text-[#d9ed92]" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-white font-sans flex items-center gap-2">
                <span>Gujarat Algae Farm</span>
                <span className="text-[10px] font-mono font-bold bg-[#16220e] text-[#d9ed92] border border-[#708238]/70 px-2 py-0.5 rounded-md tracking-wider">
                  PRIMARY SATELLITE & GIS MRV
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">Ahmedabad, Gujarat, India</span>
            </div>

            <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 mt-0.5">
              <span><strong className="text-slate-200">6</strong> Ponds</span>
              <span>•</span>
              <span><strong className="text-slate-200">1.8 ha</strong> Area</span>
              <span>•</span>
              <span className="text-[#a3be8c] font-semibold">Chlorella Monoculture</span>
            </div>
          </div>
        </div>

        {/* Right View Switcher (Map, Satellite, 3D) */}
        <div className="bg-[#0a110a]/85 backdrop-blur-xl border border-[#233318]/80 p-1 rounded-2xl shadow-xl flex items-center space-x-1 pointer-events-auto">
          <button
            onClick={() => handleViewModeChange('map')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mapMode === 'map'
                ? 'bg-[#708238] text-white shadow-md shadow-[#708238]/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182313]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
          <button
            onClick={() => handleViewModeChange('satellite')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mapMode === 'satellite'
                ? 'bg-[#708238] text-white shadow-md shadow-[#708238]/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182313]'
            }`}
          >
            <span>Satellite</span>
          </button>
          <button
            onClick={() => handleViewModeChange('bhuvan')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mapMode === 'bhuvan'
                ? 'bg-[#84a948] text-slate-950 shadow-md shadow-[#84a948]/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182313]'
            }`}
          >
            <span className="text-[9px] font-mono bg-[#283618] text-[#d9ed92] border border-[#708238] px-1 rounded">ISRO</span>
            <span>Bhuvan</span>
          </button>
          <button
            onClick={() => handleViewModeChange('3d')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mapMode === '3d'
                ? 'bg-[#708238] text-white shadow-md shadow-[#708238]/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182313]'
            }`}
          >
            <span>3D</span>
          </button>
        </div>

      </div>

      {/* FLOATING MAP CONTROLS (Top Right of Map) */}
      <div className="absolute right-5 top-20 z-30 flex flex-col items-center space-y-2 bg-[#0a0f0a]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-[#283618] shadow-2xl">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#d9ed92] hover:bg-[#182313] transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#d9ed92] hover:bg-[#182313] transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-5 h-[1px] bg-[#283618]" />

        <button
          onClick={() => {
            mapRef.current?.flyTo({
              center: farmCenter,
              zoom: 15,
              pitch: 0,
              bearing: 0
            });
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#d9ed92] hover:bg-[#182313] transition-colors"
          title="Re-center Map"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleViewModeChange(mapMode === 'map' ? '3d' : 'map')}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#d9ed92] hover:bg-[#182313] transition-colors"
          title="Toggle 3D View"
        >
          <Layers className="w-4 h-4 text-[#a3be8c]" />
        </button>
      </div>

      {/* ISRO BHUVAN HYDROLOGY OVERLAY (Bottom Center) */}
      {mapMode === 'bhuvan' && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden sm:flex">
          <div className="bg-[#0a0f0a]/95 backdrop-blur-xl border border-[#708238]/60 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-3 pointer-events-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-[#84a948] animate-ping" />
            <div className="text-xs">
              <span className="font-mono font-bold text-[#d9ed92] mr-2">ISRO BHUVAN FOUNDATION:</span>
              <span className="text-slate-300 font-medium">Sabarmati River Basin (5A1A2) • Proximity: 2.49 km to Sabarmati Channel • Deep Alluvial Aquifer</span>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING POND HEALTH LEGEND (Bottom Left of Map) */}
      <div className="absolute left-5 bottom-5 z-30 bg-[#0a0f0a]/95 backdrop-blur-xl border border-[#283618] p-3.5 rounded-2xl shadow-2xl pointer-events-auto">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Pond Health
        </span>

        <div className="space-y-1.5 text-xs font-medium text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84a948] shadow-sm shadow-[#84a948]" />
            <span>Healthy</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            <span>Warning</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500 animate-pulse" />
            <span>Critical</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Offline</span>
          </div>
        </div>
      </div>

      {/* FLOATING SCALE BAR (Bottom Right of Map) */}
      <div className="absolute right-5 bottom-5 z-30 bg-[#0a0f0a]/90 backdrop-blur-xl border border-[#283618] px-3 py-1.5 rounded-xl shadow-xl flex items-center space-x-4 text-[10px] font-mono text-slate-400 pointer-events-auto">
        <span>MapLibre GL Engine</span>
        <div className="w-16 h-1 bg-[#283618] relative flex items-center justify-between">
          <div className="w-0.5 h-2 bg-[#708238]" />
          <div className="w-0.5 h-2 bg-[#708238]" />
        </div>
        <span>250 m</span>
      </div>

    </div>
  );
};
