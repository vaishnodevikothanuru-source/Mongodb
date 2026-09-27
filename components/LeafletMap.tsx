'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  Sparkles,
  AlertTriangle,
  Zap,
  Info,
  MapPin,
  Compass,
  Radio,
  ExternalLink,
  Satellite,
  Search,
  Route as RouteIcon,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export interface MapStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  crowdLevel?: 'low' | 'moderate' | 'high';
  isInterchange?: boolean;
  transfersAvailable?: string[];
}

export interface MapRoute {
  routeId: string;
  name: string;
  transportType: string;
  origin?: string;
  destination?: string;
  stops: MapStop[];
  status?: string;
  delayMinutes?: number;
  crowdLevel?: string;
  polylinePoints?: [number, number][];
}

interface LeafletMapProps {
  selectedRoute?: MapRoute | any;
  alternativeRoute?: MapRoute | any;
  originName?: string;
  destinationName?: string;
  heightClass?: string;
  defaultEngine?: 'google' | 'leaflet' | 'vector';
  currentStopIndex?: number;
  progressBetweenStops?: number; // 0 to 1
  isDisruptedAhead?: boolean;
  rerouteStation?: MapStop | null;
}

export function LeafletMap({
  selectedRoute,
  alternativeRoute,
  originName = 'Dwarka Sector 21',
  destinationName = 'Noida Electronic City',
  heightClass = 'h-[440px]',
  defaultEngine = 'leaflet',
  currentStopIndex = 1,
  progressBetweenStops = 0.5,
  isDisruptedAhead = false,
  rerouteStation = null,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [activeEngine, setActiveEngine] = useState<'google' | 'leaflet' | 'vector'>(defaultEngine);
  const [googleViewMode, setGoogleViewMode] = useState<'directions' | 'transit' | 'satellite'>('directions');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapTileStyle, setMapTileStyle] = useState<'dark' | 'osm' | 'voyager'>('dark');
  const [activeStop, setActiveStop] = useState<MapStop | null>(null);
  const [tileError, setTileError] = useState(false);

  // Check if current route is affected (delays >= 4 mins, disruptions, or high crowd)
  const isRouteAffected =
    isDisruptedAhead ||
    selectedRoute?.status === 'delayed' ||
    selectedRoute?.status === 'disrupted' ||
    selectedRoute?.status === 'cancelled' ||
    (selectedRoute?.delayMinutes && selectedRoute.delayMinutes >= 4) ||
    selectedRoute?.crowdLevel === 'high';

  const defaultStops: MapStop[] = [
    { id: '1', name: originName || 'Dwarka Sector 21', latitude: 28.5524, longitude: 77.0583, crowdLevel: 'low', isInterchange: true },
    { id: '2', name: 'Janakpuri West Interchange', latitude: 28.6294, longitude: 77.0778, crowdLevel: 'moderate', isInterchange: true },
    { id: '3', name: 'Rajiv Chowk (Central Hub)', latitude: 28.6328, longitude: 77.2195, crowdLevel: 'high', isInterchange: true },
    { id: '4', name: 'Mandi House Node', latitude: 28.6258, longitude: 77.2343, crowdLevel: 'moderate' },
    { id: '5', name: destinationName || 'Noida Electronic City', latitude: 28.6277, longitude: 77.3725, crowdLevel: 'low' },
  ];

  const stops: MapStop[] =
    selectedRoute?.stops && selectedRoute.stops.length > 0 ? selectedRoute.stops : defaultStops;

  const validStops = stops.filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number');
  const currentStops = validStops.length > 0 ? validStops : defaultStops;

  const safeCurrentIdx = Math.min(currentStops.length - 1, Math.max(0, currentStopIndex));
  const safeNextIdx = Math.min(currentStops.length - 1, safeCurrentIdx + 1);

  // Calculate realtime vehicle interpolated coordinates
  const currStop = currentStops[safeCurrentIdx];
  const nextStop = currentStops[safeNextIdx];
  const vehicleLat = currStop.latitude + (nextStop.latitude - currStop.latitude) * progressBetweenStops;
  const vehicleLng = currStop.longitude + (nextStop.longitude - currStop.longitude) * progressBetweenStops;

  const centerLat = currentStops.reduce((acc, s) => acc + s.latitude, 0) / (currentStops.length || 1);
  const centerLng = currentStops.reduce((acc, s) => acc + s.longitude, 0) / (currentStops.length || 1);

  // Leaflet Map Initialization & Re-sync with fallback handling
  useEffect(() => {
    if (activeEngine !== 'leaflet' || typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    let isCancelled = false;

    const initLeaflet = async () => {
      try {
        L = (await import('leaflet')).default;
        if (isCancelled || !mapContainerRef.current) return;

        // Clean up previous map if exists
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {}
          mapInstanceRef.current = null;
        }

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const map = L.map(mapContainerRef.current, {
          center: [vehicleLat, vehicleLng],
          zoom: 11,
          zoomControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;

        // Tile layer selector with error fallback
        let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        let attribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap';

        if (mapTileStyle === 'osm') {
          tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
          attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        } else if (mapTileStyle === 'voyager') {
          tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        }

        const tileLayer = L.tileLayer(tileUrl, {
          attribution,
          maxZoom: 19,
          subdomains: 'abcd',
        });

        tileLayer.on('tileerror', () => {
          setTileError(true);
        });

        tileLayer.addTo(map);

        const latLngs = currentStops.map((s) => [s.latitude, s.longitude] as [number, number]);

        // 1. Draw Completed Segment (Passed Stops) in Calm Emerald
        const completedLatLngs = latLngs.slice(0, safeCurrentIdx + 1);
        if (completedLatLngs.length >= 2) {
          L.polyline(completedLatLngs, {
            color: '#10b981',
            weight: 6,
            opacity: 0.9,
            lineCap: 'round',
          }).addTo(map);
        }

        // 2. Draw Remaining Ahead Segment (Green if On-Time, Dashed Red/Amber if Disrupted)
        const remainingLatLngs = latLngs.slice(safeCurrentIdx);
        if (remainingLatLngs.length >= 2) {
          L.polyline(remainingLatLngs, {
            color: isRouteAffected ? '#ef4444' : '#3b82f6',
            weight: 5,
            opacity: 0.85,
            dashArray: isRouteAffected ? '6, 6' : undefined,
            lineCap: 'round',
          }).addTo(map);
        }

        // 3. MID-ROUTE ALTERNATE DIVERSION: SHOWN FROM THE CURRENT / REROUTE STATION
        if (isRouteAffected) {
          const pivotIdx = rerouteStation
            ? currentStops.findIndex((s) => s.id === rerouteStation.id || s.name === rerouteStation.name)
            : safeCurrentIdx;
          const validPivotIdx = pivotIdx >= 0 ? pivotIdx : safeCurrentIdx;
          const pivotCoord = latLngs[validPivotIdx] || [vehicleLat, vehicleLng];
          const destCoord = latLngs[latLngs.length - 1];

          // Generate mid-route bypass arc originating precisely from the current point
          const bypassMidLat = (pivotCoord[0] + destCoord[0]) / 2 + 0.04;
          const bypassMidLng = (pivotCoord[1] + destCoord[1]) / 2 - 0.03;

          const altPathPoints: [number, number][] = [
            pivotCoord,
            [bypassMidLat, bypassMidLng],
            destCoord,
          ];

          L.polyline(altPathPoints, {
            color: '#8b5cf6',
            weight: 5,
            dashArray: '8, 8',
            opacity: 0.95,
          }).addTo(map);

          // Marker badge at the midpoint of the bypass
          const altBadgeIcon = L.divIcon({
            className: 'alt-midroute-badge',
            html: `<div style="background:#7c3aed;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:12px;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.5);border:1.5px solid #c4b5fd;">⚡ Divert Here: Save 14m</div>`,
            iconSize: [150, 24],
            iconAnchor: [75, 12],
          });
          L.marker([bypassMidLat, bypassMidLng], { icon: altBadgeIcon }).addTo(map);
        }

        // 4. Station Markers
        currentStops.forEach((stop, idx) => {
          const isOrigin = idx === 0;
          const isDestination = idx === currentStops.length - 1;
          const isCurrentOrApproaching = idx === safeCurrentIdx || idx === safeNextIdx;
          const isPassed = idx < safeCurrentIdx;
          const crowdColor =
            stop.crowdLevel === 'high' ? '#f43f5e' : stop.crowdLevel === 'moderate' ? '#f59e0b' : '#10b981';

          const customHtml = `
            <div style="position:relative;width:26px;height:26px;display:flex;align-items:center;justify-content:center;">
              ${
                isCurrentOrApproaching
                  ? '<div style="position:absolute;width:26px;height:26px;border-radius:50%;background:rgba(59,130,246,0.4);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>'
                  : ''
              }
              <div style="position:absolute;width:18px;height:18px;border-radius:50%;background:${
                isPassed
                  ? '#64748b'
                  : isOrigin
                  ? '#10b981'
                  : isDestination
                  ? '#ec4899'
                  : stop.isInterchange
                  ? '#eab308'
                  : '#3b82f6'
              };border:2.5px solid #0f172a;box-shadow:0 0 8px rgba(0,0,0,0.5);"></div>
              <div style="position:absolute;top:-4px;right:-4px;width:9px;height:9px;border-radius:50%;background:${crowdColor};border:1.5px solid #fff;"></div>
            </div>
          `;

          const icon = L.divIcon({
            className: 'custom-station-icon',
            html: customHtml,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([stop.latitude, stop.longitude], { icon }).addTo(map);

          marker.bindPopup(`
            <div style="padding:4px;font-family:sans-serif;color:#0f172a;min-width:170px;">
              <div style="font-size:10px;font-weight:bold;color:${isPassed ? '#64748b' : '#059669'};text-transform:uppercase;">
                ${isPassed ? '✓ Passed Station' : isOrigin ? 'Starting Terminal' : isDestination ? 'Final Destination' : 'Transit Node'}
              </div>
              <div style="font-size:13px;font-weight:bold;margin:2px 0;">${stop.name}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:4px;">
                Crowd: <strong>${stop.crowdLevel?.toUpperCase() || 'MODERATE'}</strong>
              </div>
              ${stop.isInterchange ? '<div style="font-size:10px;background:#fef3c7;color:#92400e;padding:2px 4px;border-radius:4px;display:inline-block;font-weight:bold;">Interchange Available</div>' : ''}
            </div>
          `);
        });

        // 5. Live Animated Vehicle Beacon
        const vehicleHtml = `
          <div style="position:relative;width:34px;height:34px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;border:2.5px solid #ffffff;box-shadow:0 0 16px rgba(37,99,235,1);animation:pulse 2s infinite;">
            🚆
          </div>
        `;
        const vehicleIcon = L.divIcon({
          className: 'live-gps-vehicle-marker',
          html: vehicleHtml,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const vehicleMarker = L.marker([vehicleLat, vehicleLng], { icon: vehicleIcon }).addTo(map);
        vehicleMarker.bindPopup(`
          <div style="font-family:sans-serif;color:#0f172a;font-size:12px;">
            <strong>Live GPS Transit Unit</strong><br/>
            Line: ${selectedRoute?.name || 'Rapid Transit'}<br/>
            Approaching: <strong>${nextStop?.name || 'Next Station'}</strong><br/>
            Speed: ~54 km/h
          </div>
        `);

        if (latLngs.length > 0) {
          map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40], maxZoom: 14 });
        }

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } catch (err) {
        console.warn('Leaflet map error, switching to Google Open Maps:', err);
        setActiveEngine('google');
      }
    };

    initLeaflet();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [activeEngine, selectedRoute, mapTileStyle, isRouteAffected, safeCurrentIdx, progressBetweenStops]);

  // Google Maps Open Embed URLs
  const originQuery = encodeURIComponent(selectedRoute?.origin || originName || 'Dwarka Sector 21');
  const destQuery = encodeURIComponent(selectedRoute?.destination || destinationName || 'Noida Electronic City');
  const centerCoordsQuery = `${centerLat},${centerLng}`;

  let googleMapsUrl = `https://maps.google.com/maps?saddr=${originQuery}&daddr=${destQuery}&dirflg=r&hl=en&z=12&output=embed`;
  if (googleViewMode === 'satellite') {
    googleMapsUrl = `https://maps.google.com/maps?saddr=${originQuery}&daddr=${destQuery}&t=k&hl=en&z=13&output=embed`;
  } else if (googleViewMode === 'transit') {
    googleMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(selectedRoute?.name || 'Metro Transit')}+near+${centerCoordsQuery}&t=m&hl=en&z=13&output=embed`;
  }

  // Compute SVG Vector coordinates
  const lats = currentStops.map((s) => s.latitude);
  const lngs = currentStops.map((s) => s.longitude);
  const minLat = Math.min(...lats, 28.45);
  const maxLat = Math.max(...lats, 28.75);
  const minLng = Math.min(...lngs, 77.0);
  const maxLng = Math.max(...lngs, 77.4);

  const toSVG = (lat: number, lng: number) => {
    const padding = 50;
    const width = 800 - padding * 2;
    const height = 460 - padding * 2;
    const x = padding + ((lng - minLng) / (maxLng - minLng || 0.1)) * width;
    const y = 460 - (padding + ((lat - minLat) / (maxLat - minLat || 0.1)) * height);
    return { x: Math.max(40, Math.min(760, x)), y: Math.max(40, Math.min(420, y)) };
  };

  const vectorPoints = currentStops.map((s) => toSVG(s.latitude, s.longitude));
  const vectorPath = vectorPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  const currVec = vectorPoints[safeCurrentIdx] || vectorPoints[0];
  const nextVec = vectorPoints[safeNextIdx] || vectorPoints[0];
  const vX = currVec.x + (nextVec.x - currVec.x) * progressBetweenStops;
  const vY = currVec.y + (nextVec.y - currVec.y) * progressBetweenStops;

  // Mid-Route Diversion in Vector Engine
  const pivotVec = vectorPoints[safeCurrentIdx] || vectorPoints[0];
  const destVec = vectorPoints[vectorPoints.length - 1];
  const altMidX = (pivotVec.x + destVec.x) / 2 + 50;
  const altMidY = (pivotVec.y + destVec.y) / 2 - 50;
  const altVectorPath = `M ${pivotVec.x},${pivotVec.y} Q ${altMidX},${altMidY} ${destVec.x},${destVec.y}`;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : heightClass
      }`}
    >
      {/* Top Map Provider Switcher Header */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Route status & Live GPS indicator */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs flex items-center gap-2 shadow-lg pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRouteAffected ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRouteAffected ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="font-bold tracking-wide">
            {selectedRoute?.name || 'Metropolitan Transit Corridor'}
          </span>
          {isRouteAffected ? (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Issue Ahead • Mid-Route Detour Available</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
              On-Time Tracking
            </span>
          )}
        </div>

        {/* Multi-Engine Selector (Google Open Maps / OpenStreetMap / Vector Radar) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 text-xs shadow-lg">
            <button
              onClick={() => setActiveEngine('google')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                activeEngine === 'google'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌍 Google Open Maps</span>
            </button>
            <button
              onClick={() => setActiveEngine('leaflet')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                activeEngine === 'leaflet'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🗺️ OpenStreetMap</span>
            </button>
            <button
              onClick={() => setActiveEngine('vector')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                activeEngine === 'vector'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⚡ Vector Radar</span>
            </button>
          </div>

          {/* Sub-modes for Google Open Maps */}
          {activeEngine === 'google' && (
            <div className="hidden sm:flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setGoogleViewMode('directions')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                  googleViewMode === 'directions' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Directions
              </button>
              <button
                onClick={() => setGoogleViewMode('satellite')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                  googleViewMode === 'satellite' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
            </div>
          )}

          {/* Sub-modes for Leaflet */}
          {activeEngine === 'leaflet' && (
            <div className="hidden sm:flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setMapTileStyle('dark')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                  mapTileStyle === 'dark' ? 'bg-slate-700 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setMapTileStyle('osm')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                  mapTileStyle === 'osm' ? 'bg-slate-700 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                OSM Standard
              </button>
            </div>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:bg-slate-800 backdrop-blur-md"
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ENGINE 1: GOOGLE OPEN MAPS API / EMBED VIEWER */}
      {activeEngine === 'google' && (
        <div className="relative w-full h-full bg-[#0a0f1d] overflow-hidden">
          <iframe
            src={googleMapsUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full filter contrast-[1.05]"
            title="Google Open Maps Transit Viewer"
          />

          {/* Overlay info bar */}
          <div className="absolute bottom-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-[11px] text-slate-300 flex items-center gap-3 shadow-lg">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <RouteIcon className="w-3.5 h-3.5" />
              <span>Google Open Maps Active</span>
            </span>
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destQuery}&travelmode=transit`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1 font-bold bg-blue-950/60 px-2 py-1 rounded-lg border border-blue-800"
            >
              <span>Open in Google Maps App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* ENGINE 2: LEAFLET OPENSTREETMAP */}
      {activeEngine === 'leaflet' && (
        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          {tileError && (
            <div className="absolute top-16 left-3 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/50 text-[11px] text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Network tile fallback active. You can also switch to Google Open Maps.</span>
            </div>
          )}
        </div>
      )}

      {/* ENGINE 3: HIGH-SPEED VECTOR RADAR CANVAS */}
      {activeEngine === 'vector' && (
        <div className="relative w-full h-full bg-[#0a0f1d] overflow-hidden select-none">
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="vgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#vgrid)" />
          </svg>

          <svg viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" className="w-full h-full relative z-10">
            <defs>
              <filter id="vglow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="vRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            {/* Mid-Route Detour Arc in Vector Engine */}
            {isRouteAffected && (
              <g opacity="0.9">
                <path
                  d={altVectorPath}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="4.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
                <text x={altMidX - 30} y={altMidY - 12} fill="#c4b5fd" fontSize="11" fontWeight="bold">
                  ⚡ Mid-Route Diversion Bypass Link
                </text>
              </g>
            )}

            {/* Main Active Route Line */}
            <path
              d={vectorPath}
              fill="none"
              stroke={isRouteAffected ? '#ef4444' : '#2563eb'}
              strokeWidth="9"
              strokeOpacity="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={vectorPath}
              fill="none"
              stroke={isRouteAffected ? '#f59e0b' : 'url(#vRouteGrad)'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#vglow)"
            />

            {/* Station Nodes */}
            {vectorPoints.map((p, idx) => {
              const stop = currentStops[idx];
              const isOrigin = idx === 0;
              const isDestination = idx === vectorPoints.length - 1;
              const isPassed = idx < safeCurrentIdx;
              const isCurrent = idx === safeCurrentIdx;

              return (
                <g key={stop.id} className="cursor-pointer" onClick={() => setActiveStop(stop)}>
                  {isCurrent && (
                    <circle cx={p.x} cy={p.y} r="18" fill="#3b82f6" fillOpacity="0.3" className="animate-ping" />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isOrigin || isDestination ? 10 : stop.isInterchange ? 8 : 6}
                    fill={isPassed ? '#64748b' : isOrigin ? '#10b981' : isDestination ? '#ec4899' : stop.isInterchange ? '#eab308' : '#ffffff'}
                    stroke="#0f172a"
                    strokeWidth="3"
                  />
                  <text
                    x={p.x}
                    y={p.y + (idx % 2 === 0 ? -16 : 22)}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="10"
                    fontWeight="bold"
                    className="drop-shadow-md select-none"
                  >
                    {stop.name}
                  </text>
                </g>
              );
            })}

            {/* Animated Live Vehicle */}
            <g transform={`translate(${vX}, ${vY})`} className="transition-all duration-300">
              <circle cx="0" cy="0" r="16" fill="#3b82f6" fillOpacity="0.4" className="animate-ping" />
              <circle cx="0" cy="0" r="11" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                🚆
              </text>
            </g>
          </svg>

          {/* Stop Details Tooltip */}
          {activeStop && (
            <div className="absolute bottom-4 left-4 sm:w-72 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 shadow-2xl z-30 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Station Node</span>
                <button onClick={() => setActiveStop(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <h4 className="font-bold text-white text-sm">{activeStop.name}</h4>
              <p className="text-slate-400 text-[11px] mt-1">
                Crowd Density: <strong className="text-white capitalize">{activeStop.crowdLevel || 'Moderate'}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Alternate Notice overlay when route is affected */}
      {isRouteAffected && (
        <div className="absolute bottom-3 left-3 z-[300] max-w-sm bg-purple-950/90 backdrop-blur-md p-3 rounded-2xl border border-purple-700 shadow-2xl text-purple-100 text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-0.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Mid-Route Alternate Divert Active</span>
          </div>
          <p className="text-[11px] text-purple-200/90 leading-snug">
            Delay detected ahead from current station. Suggested alternate diversion is displayed in purple.
          </p>
        </div>
      )}
    </div>
  );
}

export default LeafletMap;


