'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicLeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[440px] bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-800">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-300">Initializing Leaflet / OpenStreetMap Transit Radar...</p>
      </div>
    </div>
  ),
});

export interface InteractiveMapProps {
  selectedRoute?: any;
  alternativeRoute?: any;
  originName?: string;
  destinationName?: string;
  heightClass?: string;
  defaultEngine?: 'google' | 'leaflet' | 'vector';
  currentStopIndex?: number;
  progressBetweenStops?: number;
  isDisruptedAhead?: boolean;
  rerouteStation?: any;
}

export function InteractiveMap(props: InteractiveMapProps) {
  return <DynamicLeafletMap {...props} />;
}

export default InteractiveMap;


