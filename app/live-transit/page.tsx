'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Radio,
  Clock,
  AlertTriangle,
  Users,
  Train,
  Bus,
  Shuffle,
  RefreshCw,
  Sparkles,
  Zap,
  Filter,
  CheckCircle2,
  ArrowRight,
  Send,
  MapPin,
  Compass,
  Play,
  Pause,
  FastForward,
  ShieldAlert,
  Navigation,
  Gauge,
  Thermometer,
  Wifi,
  Wind,
  Check,
  RotateCcw,
} from 'lucide-react';
import CrowdIndicator from '@/components/CrowdIndicator';
import TransitStatusBadge from '@/components/TransitStatusBadge';
import InteractiveMap from '@/components/InteractiveMap';

export default function LiveTransitPage() {
  const [transitData, setTransitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [simulating, setSimulating] = useState(false);
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  // Active Corridor & Live Follower Engine State
  const [activeSelectedRoute, setActiveSelectedRoute] = useState<any>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(1);
  const [progressBetweenStops, setProgressBetweenStops] = useState<number>(0.35);
  const [isTrackingActive, setIsTrackingActive] = useState<boolean>(true);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(1);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(54);
  const [nextStopCountdownSec, setNextStopCountdownSec] = useState<number>(45);
  const [isDockedAtStation, setIsDockedAtStation] = useState<boolean>(false);

  // Dynamic Mid-Route Incident / Disruption State
  const [isDisruptedAhead, setIsDisruptedAhead] = useState<boolean>(false);
  const [disruptionIncident, setDisruptionIncident] = useState<any>(null);
  const [hasAcceptedDivert, setHasAcceptedDivert] = useState<boolean>(false);
  const [originalRouteBackup, setOriginalRouteBackup] = useState<any>(null);

  // Commuter Delay Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportRouteId, setReportRouteId] = useState('MTR-BLU-01');
  const [reportDelay, setReportDelay] = useState(6);
  const [reportCrowd, setReportCrowd] = useState<'low' | 'moderate' | 'high'>('high');
  const [reportMessage, setReportMessage] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Fetch initial live data
  const fetchLiveTransit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transit/live');
      const data = await res.json();
      setTransitData(data);
      if (data.routes && data.routes.length > 0) {
        if (!activeSelectedRoute) {
          setActiveSelectedRoute(data.routes[0]);
        } else {
          const updated = data.routes.find((r: any) => r.routeId === activeSelectedRoute.routeId);
          if (updated) setActiveSelectedRoute(updated);
        }
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTransit();
  }, []);

  const routes: any[] = transitData?.routes || [];
  const updates: any[] = transitData?.updates || [];
  const currentStops: any[] = activeSelectedRoute?.stops || [
    { id: '1', name: 'Dwarka Sector 21 Terminal', latitude: 28.5524, longitude: 77.0583, crowdLevel: 'low', isInterchange: true },
    { id: '2', name: 'Janakpuri West Interchange', latitude: 28.6294, longitude: 77.0778, crowdLevel: 'moderate', isInterchange: true },
    { id: '3', name: 'Rajiv Chowk (Central Hub)', latitude: 28.6328, longitude: 77.2195, crowdLevel: 'high', isInterchange: true },
    { id: '4', name: 'Mandi House Node', latitude: 28.6258, longitude: 77.2343, crowdLevel: 'moderate' },
    { id: '5', name: 'Noida Electronic City', latitude: 28.6277, longitude: 77.3725, crowdLevel: 'low' },
  ];

  // 1. Real-Time Route Follower Tick Engine
  useEffect(() => {
    if (!isTrackingActive || currentStops.length < 2) return;

    const interval = setInterval(() => {
      if (isDockedAtStation) {
        // Station dwell time
        setCurrentSpeedKmh(0);
        setIsDockedAtStation(false);
        return;
      }

      // In motion speed fluctuations (48 to 68 km/h)
      setCurrentSpeedKmh(Math.floor(52 + Math.sin(Date.now() / 2000) * 12));

      // Advance progress
      setProgressBetweenStops((prev) => {
        const step = 0.05 * simSpeedMultiplier;
        const next = prev + step;

        if (next >= 1.0) {
          // Reached next station
          setCurrentStopIndex((prevIdx) => {
            if (prevIdx >= currentStops.length - 2) {
              return 0; // Loop back or completed
            }
            return prevIdx + 1;
          });
          setIsDockedAtStation(true);
          setNextStopCountdownSec(60);
          return 0;
        }

        // Update countdown seconds
        setNextStopCountdownSec((sec) => Math.max(2, Math.round((1 - next) * 60)));
        return next;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isTrackingActive, currentStops.length, simSpeedMultiplier, isDockedAtStation]);

  // Compute Mid-Route Alternate Detour from the CURRENT Station
  const currentStation = currentStops[Math.min(currentStops.length - 1, currentStopIndex)];
  const nextStation = currentStops[Math.min(currentStops.length - 1, currentStopIndex + 1)];

  const getMidRouteAlternateBypass = () => {
    const alternateBypasses = [
      {
        id: 'bypass-mag-01',
        name: 'Magenta Line Skywalk Link → Express Shuttler',
        transportType: 'metro',
        transferStation: currentStation?.name || 'Janakpuri West',
        timeSavingsMinutes: 14,
        fare: 35,
        crowdLevel: 'low',
        summary: `Transfer at ${currentStation?.name || 'this junction'} to bypass track congestion ahead. Direct rapid express corridor with air conditioning.`,
        instructions: `Disembark at Platform 2 → Cross skybridge interchange → Board Magenta Express line.`,
      },
      {
        id: 'bypass-bus-500',
        name: 'City Feeder Express Bus 500 (Dedicated Corridor)',
        transportType: 'bus',
        transferStation: currentStation?.name || 'Janakpuri West',
        timeSavingsMinutes: 11,
        fare: 25,
        crowdLevel: 'moderate',
        summary: `Exit Gate 3 for dedicated BRT electric bus corridor avoiding rail signal delays.`,
        instructions: `Take Gate 3 exit → Board Bus Bay 4 (Departs every 4 mins).`,
      },
    ];
    return alternateBypasses[0];
  };

  const currentAlternateBypass = getMidRouteAlternateBypass();

  // Trigger Sudden Incident / Delay Ahead
  const handleTriggerIncidentAhead = () => {
    setIsDisruptedAhead(true);
    setHasAcceptedDivert(false);
    setDisruptionIncident({
      location: `Between ${currentStation?.name || 'Current Stop'} and ${nextStation?.name || 'Next Stop'}`,
      delayMinutes: 14,
      severity: 'high',
      reason: 'Signal interlock failure & high platform rush detected',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setSimulationToast(`⚠️ Disruption detected ahead of ${currentStation?.name}! Mid-route bypass calculated.`);
    setTimeout(() => setSimulationToast(null), 5000);
  };

  // Accept & Divert Commute from Current Station
  const handleAcceptDivert = () => {
    setOriginalRouteBackup(activeSelectedRoute);
    setHasAcceptedDivert(true);
    setIsDisruptedAhead(false);

    // Switch corridor to bypass line
    const bypassRoute = {
      ...activeSelectedRoute,
      name: currentAlternateBypass.name,
      status: 'on-time',
      delayMinutes: 0,
      stops: [
        currentStation,
        { id: 'bp-1', name: `${currentStation?.name} Skywalk Bypass Node`, latitude: (currentStation?.latitude || 28.62) + 0.02, longitude: (currentStation?.longitude || 77.1) + 0.03, crowdLevel: 'low', isInterchange: true },
        { id: 'bp-2', name: 'Ring Road Feeder Terminal', latitude: (currentStation?.latitude || 28.62) + 0.03, longitude: (currentStation?.longitude || 77.2) + 0.04, crowdLevel: 'low' },
        currentStops[currentStops.length - 1],
      ],
    };

    setActiveSelectedRoute(bypassRoute);
    setCurrentStopIndex(0);
    setProgressBetweenStops(0.1);
    setSimulationToast(`⚡ Diverted commute active from ${currentStation?.name}! Saving ~14 mins.`);
    setTimeout(() => setSimulationToast(null), 5000);
  };

  // Revert back to original corridor
  const handleRevertRoute = () => {
    if (originalRouteBackup) {
      setActiveSelectedRoute(originalRouteBackup);
    }
    setHasAcceptedDivert(false);
    setIsDisruptedAhead(false);
    setDisruptionIncident(null);
  };

  // Select another corridor
  const handleSelectCorridor = (corridor: any) => {
    setActiveSelectedRoute(corridor);
    setCurrentStopIndex(0);
    setProgressBetweenStops(0.1);
    setIsDisruptedAhead(corridor.status === 'delayed' || corridor.status === 'disrupted' || (corridor.delayMinutes && corridor.delayMinutes >= 4));
    setHasAcceptedDivert(false);
  };

  // Commuter Delay Report Submit
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/transit/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: reportRouteId,
          routeName: activeSelectedRoute?.name || 'Metro Transit Corridor',
          transportType: activeSelectedRoute?.transportType || 'metro',
          delay: reportDelay,
          crowdLevel: reportCrowd,
          status: reportDelay > 10 ? 'disrupted' : reportDelay > 0 ? 'delayed' : 'on-time',
          message: reportMessage || `Live passenger report: ${reportDelay}m headway delay near ${currentStation?.name}`,
          severity: reportDelay > 8 ? 'warning' : 'info',
        }),
      });
      setReportSubmitted(true);
      await fetchLiveTransit();
      setTimeout(() => {
        setReportSubmitted(false);
        setReportModalOpen(false);
      }, 1600);
    } catch (e) {}
  };

  const networkStats = transitData?.networkStats || {
    totalRoutes: 7,
    onTimeCount: 5,
    delayedCount: 2,
    disruptedCount: 0,
    networkPunctuality: 94,
    averageDelayMinutes: 6,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header & Mission Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Real-Time Transit Follower & Cockpit
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white">
              {activeSelectedRoute?.name || 'Metro Blue Line (Rapid Transit)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live tracking along active corridor with automated mid-route disruption detection and point-of-incident rerouting.
            </p>
          </div>

          {/* Follower Engine Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsTrackingActive(!isTrackingActive)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isTrackingActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isTrackingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTrackingActive ? 'Tracking Live' : 'Resume Follower'}</span>
            </button>

            <button
              onClick={() => setSimSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 5 : 1))}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1"
              title="Simulation speed multiplier"
            >
              <FastForward className="w-3.5 h-3.5 text-blue-500" />
              <span>{simSpeedMultiplier}x Speed</span>
            </button>

            <button
              onClick={handleTriggerIncidentAhead}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Issue Ahead</span>
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Report Delay</span>
            </button>
          </div>
        </div>

        {/* Dynamic Simulation Toast Alert */}
        {simulationToast && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{simulationToast}</span>
          </div>
        )}

        {/* MID-ROUTE DISRUPTION & POINT-OF-INCIDENT ALTERNATIVE DETOUR CARD */}
        {isDisruptedAhead && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/80 via-purple-950/70 to-slate-900 border-2 border-amber-500 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-400 animate-bounce" />
                <span>DISRUPTION AHEAD OF {currentStation?.name?.toUpperCase()}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold">
                +{disruptionIncident?.delayMinutes || 14}m Delay Incurred If Unaltered
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Box: Current Delayed Route Impact */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-red-500/40 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-red-400">
                  <span>🛑 Stay on {activeSelectedRoute?.name}</span>
                  <span>Delayed (+14m)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {disruptionIncident?.reason || 'Track congestion and signal slowdown detected ahead.'}
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Expected Arrival: ~<strong>38 mins</strong> • High platform crowd surge
                </div>
              </div>

              {/* Right Box: Suggested Mid-Route Detour from Current Point */}
              <div className="p-4 rounded-2xl bg-purple-950/80 border-2 border-purple-500 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>⚡ Divert at {currentStation?.name}</span>
                  </span>
                  <span className="bg-purple-500 text-white px-2 py-0.5 rounded font-black text-[10px]">
                    SAVE 14 MINS
                  </span>
                </div>
                <p className="text-purple-100 font-semibold text-xs">
                  {currentAlternateBypass.name}
                </p>
                <p className="text-purple-200/80 text-[11px]">
                  {currentAlternateBypass.instructions}
                </p>
                <div className="flex items-center justify-between text-[11px] text-purple-300 pt-1 border-t border-purple-800/60">
                  <span>Fare: ₹{currentAlternateBypass.fare}</span>
                  <span>Crowd: Low (Air Conditioned)</span>
                  <span>ETA: ~<strong>22 mins</strong></span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleAcceptDivert}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-xl shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Accept & Divert Commute from {currentStation?.name} →</span>
              </button>

              <button
                onClick={() => setIsDisruptedAhead(false)}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
              >
                Dismiss & Stay on Route
              </button>
            </div>
          </div>
        )}

        {/* Accepted Divert Confirmation Bar */}
        {hasAcceptedDivert && (
          <div className="p-4 rounded-3xl bg-purple-950/80 border border-purple-600 text-purple-100 text-xs shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-purple-400 font-bold" />
              <span>
                <strong>Mid-Route Bypass Active:</strong> You are now following the diverted corridor from {currentStation?.name}.
              </span>
            </div>
            <button
              onClick={handleRevertRoute}
              className="text-xs font-bold text-purple-300 underline hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revert to Original Line</span>
            </button>
          </div>
        )}

        {/* Real-Time Cockpit Telemetry HUD Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Speed Widget */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Transit Speed</span>
              <Gauge className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {currentSpeedKmh} <span className="text-xs font-medium text-slate-400">km/h</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {isDockedAtStation ? 'Station Dwell (Boarding)' : 'Cruising Headway'}
            </p>
          </div>

          {/* Current / Approaching Station */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Current / Approaching</span>
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
              {nextStation?.name || currentStation?.name}
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Platform {currentStation?.isInterchange ? '2 (Skywalk)' : '1'}
            </p>
          </div>

          {/* Next Stop Countdown */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Stop Arrival ETA</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {isDockedAtStation ? 'Arrived' : `${nextStopCountdownSec}s`}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {currentStops.length - currentStopIndex - 1} stops remaining
            </p>
          </div>

          {/* Realtime Coach Crowd Sensor */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Coach Occupancy</span>
              <Users className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
              <CrowdIndicator level={currentStation?.crowdLevel || 'moderate'} size="sm" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Coach 3 Density: 48%</p>
          </div>

          {/* Ambient In-Transit Telemetry */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>In-Transit Climate</span>
              <Thermometer className="w-3.5 h-3.5 text-teal-500" />
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
              <span>22.5°C</span>
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5">
                <Wifi className="w-3 h-3" /> 5G
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Air Cleanliness: PM2.5 Good</p>
          </div>
        </div>

        {/* Live Synchronized Map Radar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <Navigation className="w-4 h-4" />
                <span>Live Route Follower Radar & Mid-Route Divert Visualizer</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {activeSelectedRoute?.name}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">
                Current Position: <strong>{currentStation?.name}</strong> (Stop {currentStopIndex + 1} of {currentStops.length})
              </span>
            </div>
          </div>

          <InteractiveMap
            selectedRoute={activeSelectedRoute}
            originName={activeSelectedRoute?.origin}
            destinationName={activeSelectedRoute?.destination}
            heightClass="h-[440px]"
            currentStopIndex={currentStopIndex}
            progressBetweenStops={progressBetweenStops}
            isDisruptedAhead={isDisruptedAhead}
            rerouteStation={currentStation}
          />
        </div>

        {/* Station-by-Station Realtime Stepper Timeline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Station-by-Station Progress
              </h3>
              <p className="text-xs text-slate-500">
                Follows your train in real time along the corridor
              </p>
            </div>
            <span className="text-xs text-emerald-600 font-bold">
              ● Live Beacon Active
            </span>
          </div>

          {/* Stepper horizontal list */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {currentStops.map((stop: any, idx: number) => {
              const isPassed = idx < currentStopIndex;
              const isCurrent = idx === currentStopIndex;
              const isNext = idx === currentStopIndex + 1;
              const isUpcoming = idx > currentStopIndex + 1;

              return (
                <div
                  key={stop.id || idx}
                  className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-md'
                      : isNext
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400'
                      : isPassed
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                        style={{
                          backgroundColor: isPassed ? '#64748b' : isCurrent ? '#2563eb' : isNext ? '#10b981' : '#94a3b8'
                        }}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </span>

                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-bold text-[10px] animate-pulse">
                          Current Train
                        </span>
                      )}

                      {isNext && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px]">
                          Approaching
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {stop.name}
                    </h4>

                    {stop.isInterchange && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                        Interchange Hub
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {isPassed ? 'Departed' : isCurrent ? 'At Station' : `~+${(idx - currentStopIndex) * 4}m`}
                    </span>
                    <CrowdIndicator level={stop.crowdLevel || 'moderate'} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All City Corridors Switcher Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Select Another Live Corridor to Follow
            </h3>
            <span className="text-xs text-slate-500">{routes.length} Active Lines</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {routes.map((route) => {
              const isSelected = activeSelectedRoute?.routeId === route.routeId;
              return (
                <button
                  key={route.routeId || route.id}
                  onClick={() => handleSelectCorridor(route)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">{route.routeId}</span>
                      <TransitStatusBadge status={route.status} delayMinutes={route.delayMinutes} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{route.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{route.origin} → {route.destination}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {isSelected ? '● Currently Following' : 'Switch Follower →'}
                    </span>
                    <CrowdIndicator level={route.crowdLevel} size="sm" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Authority Bulletins Wire */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Transit Authority Live Operations Feed
              </h3>
            </div>
            <span className="text-xs text-slate-400">Real-Time Dispatch</span>
          </div>

          <div className="space-y-2.5">
            {updates.map((up) => (
              <div
                key={up.id || up._id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-slate-900 dark:text-white">{up.routeName}</span>
                    <TransitStatusBadge status={up.status} delayMinutes={up.delay} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">{up.message}</p>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(up.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commuter Delay Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
            {reportSubmitted ? (
              <div className="text-center py-8 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Report Broadcasted!
                </h3>
                <p className="text-xs text-slate-500">
                  Your report has been broadcasted to all active commuters and reflected on the radar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Report Delay / Crowd Surge
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Help fellow commuters with real-time on-the-ground observations
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Select Corridor
                  </label>
                  <select
                    value={reportRouteId}
                    onChange={(e) => setReportRouteId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none"
                  >
                    {routes.map((r) => (
                      <option key={r.routeId || r.id} value={r.routeId || r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Delay Encountered ({reportDelay} mins)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="2"
                    value={reportDelay}
                    onChange={(e) => setReportDelay(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Station / Coach Crowd Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'moderate', 'high'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setReportCrowd(lvl)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                          reportCrowd === lvl
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Message / Details
                  </label>
                  <input
                    type="text"
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    placeholder="e.g. Platform 2 rush, slow door closures"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    Publish Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
