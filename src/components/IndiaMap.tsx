'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WeatherEvent } from '@/types/weather';
import { Compass, Layers, ShieldAlert, Map as MapIcon, Globe } from 'lucide-react';

interface IndiaMapProps {
  events: WeatherEvent[];
  selectedEvent: WeatherEvent | null;
  onSelectEvent: (event: WeatherEvent) => void;
  onOpenDetails: (event: WeatherEvent) => void;
}

type MapLayerType = 'osm' | 'satellite' | 'terrain';

export default function IndiaMap({
  events,
  selectedEvent,
  onSelectEvent,
  onOpenDetails,
}: IndiaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<MapLayerType>('osm');

  // Tile layer providers that require ZERO API Keys and have NO watermarks
  const tileProviders: Record<MapLayerType, { url: string; attribution: string; maxZoom: number }> = {
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors | IMD & SIH 2026',
      maxZoom: 19,
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics | SIH 2026',
      maxZoom: 18,
    },
    terrain: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, USGS, FAO | SIH 2026',
      maxZoom: 18,
    },
  };

  // Load Leaflet dynamically in browser
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      // Add Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!mapContainerRef.current || mapInstanceRef.current) return;

      // Initialize map centered on India
      const map = L.map(mapContainerRef.current, {
        center: [22.8, 80.5],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: true,
      });

      // Default Free OpenStreetMap Layer (NO API KEY REQUIRED)
      const initialLayer = L.tileLayer(tileProviders.osm.url, {
        attribution: tileProviders.osm.attribution,
        maxZoom: tileProviders.osm.maxZoom,
      });

      initialLayer.addTo(map);
      tileLayerRef.current = initialLayer;
      mapInstanceRef.current = map;
      if (isMounted) setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Map Layer (Street / Satellite / Terrain)
  const switchLayer = async (layerType: MapLayerType) => {
    if (!mapInstanceRef.current) return;
    const L = (await import('leaflet')).default;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const provider = tileProviders[layerType];
    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
    setCurrentLayer(layerType);
  };

  // Update markers when events or map instance change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    import('leaflet').then((module) => {
      const L = module.default;

      // Clear existing markers
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      events.forEach((event) => {
        // Color according to severity & status
        let pinColor = '#3b82f6';

        if (event.status === 'flagged') {
          pinColor = '#64748b'; // Gray for flagged/misinformation
        } else if (event.severity === 'critical') {
          pinColor = '#ef4444'; // Red
        } else if (event.severity === 'high') {
          pinColor = '#f97316'; // Orange
        } else if (event.severity === 'moderate') {
          pinColor = '#eab308'; // Yellow
        } else {
          pinColor = '#10b981'; // Green
        }

        // Custom pulsing HTML marker
        const customIcon = L.divIcon({
          className: 'custom-weather-pin',
          html: `
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              ${
                event.severity === 'critical'
                  ? `<div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: ${pinColor}; opacity: 0.5; animation: ping-slow 2s infinite;"></div>`
                  : ''
              }
              <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${pinColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                ${
                  event.category === 'cyclone'
                    ? '🌀'
                    : event.category === 'flood'
                    ? '🌊'
                    : event.category === 'heavy_rainfall'
                    ? '🌧️'
                    : event.category === 'heatwave'
                    ? '☀️'
                    : event.category === 'thunderstorm'
                    ? '⚡'
                    : event.category === 'landslide'
                    ? '⛰️'
                    : '❄️'
                }
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -17],
        });

        const marker = L.marker([event.location.lat, event.location.lng], {
          icon: customIcon,
        }).addTo(map);

        const popupContent = `
          <div style="min-width: 220px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; background: ${pinColor}25; color: ${pinColor}; border: 1px solid ${pinColor}60; padding: 2px 6px; border-radius: 4px;">
                ${event.severity.toUpperCase()}
              </span>
              <span style="font-size: 11px; font-weight: 700; color: #10b981;">
                ${event.confidenceScore}% Confidence
              </span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 4px 0; line-height: 1.3;">
              ${event.title}
            </h4>
            <div style="font-size: 11px; opacity: 0.85; margin-bottom: 8px;">
              📍 ${event.location.name}, ${event.location.state}
            </div>
            <div style="display: flex; gap: 6px;">
              <button 
                id="popup-inspect-${event.id}" 
                style="flex: 1; padding: 6px 10px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;"
              >
                Inspect Evidence
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          onSelectEvent(event);
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`popup-inspect-${event.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              onOpenDetails(event);
            };
          }
        });

        markersRef.current[event.id] = marker;
      });
    });
  }, [events, mapLoaded]);

  // Center on selected event
  useEffect(() => {
    if (!selectedEvent || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.flyTo([selectedEvent.location.lat, selectedEvent.location.lng], 9, {
      duration: 1.2,
    });

    const marker = markersRef.current[selectedEvent.id];
    if (marker) {
      setTimeout(() => marker.openPopup(), 400);
    }
  }, [selectedEvent]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([22.8, 80.5], 5, { duration: 1 });
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[600px] rounded-xl overflow-hidden border border-slate-300 dark:border-[#1b2e4b] shadow-xl bg-slate-100 dark:bg-[#091528] transition-colors">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Controls Overlay: Layer Switcher & Reset */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end space-y-2">
        {/* Layer Selector */}
        <div className="bg-white/95 dark:bg-[#091833]/95 border border-slate-300 dark:border-[#1e3e70] rounded-xl p-1 shadow-lg backdrop-blur-md flex items-center space-x-1 text-xs">
          <button
            onClick={() => switchLayer('osm')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1 transition-all ${
              currentLayer === 'osm'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="OpenStreetMap Standard (Free, Detailed Road & City View)"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Street</span>
          </button>

          <button
            onClick={() => switchLayer('satellite')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1 transition-all ${
              currentLayer === 'satellite'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="ESRI World Imagery Satellite View"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Satellite</span>
          </button>

          <button
            onClick={() => switchLayer('terrain')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1 transition-all ${
              currentLayer === 'terrain'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="ESRI Topographic Terrain View"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terrain</span>
          </button>
        </div>

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="p-2 bg-white/95 hover:bg-slate-100 dark:bg-[#091833]/95 dark:hover:bg-[#112d5e] text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-[#1e3e70] shadow-md backdrop-blur-md transition-all flex items-center space-x-1.5 text-xs font-semibold"
          title="Reset View to Pan-India"
        >
          <Compass className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          <span className="hidden sm:inline">Reset India View</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-[#071326]/95 border border-slate-300 dark:border-[#1a3152] backdrop-blur-md p-2.5 sm:p-3 rounded-xl shadow-xl text-xs max-w-[280px] transition-colors">
        <div className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 mb-1.5 flex items-center space-x-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>India Warning Severity</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-700 dark:text-slate-300">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span>Critical (Red Alert)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>High (Orange Alert)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span>Moderate (Advisory)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Flagged / False Claim</span>
          </div>
        </div>
      </div>
    </div>
  );
}
