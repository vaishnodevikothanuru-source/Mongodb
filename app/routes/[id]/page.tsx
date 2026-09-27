'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Train,
  Bus,
  Footprints,
  Clock,
  IndianRupee,
  Shuffle,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MapPin,
  Layers,
  Leaf,
  Star,
  Navigation2,
  ShieldCheck,
} from 'lucide-react';
import InteractiveMap from '@/components/InteractiveMap';
import CrowdIndicator from '@/components/CrowdIndicator';
import TransitStatusBadge from '@/components/TransitStatusBadge';
import DynamicAlternativeAlert from '@/components/DynamicAlternativeAlert';
import FeedbackModal from '@/components/FeedbackModal';
import { useAuth } from '@/lib/context/AuthContext';

export default function RouteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [journeyStarted, setJourneyStarted] = useState(false);

  useEffect(() => {
    fetch(`/api/routes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.route) {
          setRoute(data.route);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!route) return;
    try {
      await fetch('/api/saved-journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${route.origin} → ${route.destination}`,
          origin: route.origin,
          destination: route.destination,
          preferredMode: route.transportType,
          estimatedTime: route.estimatedTime,
          estimatedFare: route.fare,
        }),
      });
      setIsSaved(true);
    } catch (e) {}
  };

  const handleStartJourney = async () => {
    if (!route) return;
    setJourneyStarted(true);

    // Log to journey history
    try {
      await fetch('/api/journeys/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: route.origin,
          destination: route.destination,
          routeId: route.routeId || route.id,
          routeName: route.name,
          transportType: route.transportType,
          travelTime: route.estimatedTime + (route.delayMinutes || 0),
          fare: route.fare,
          crowdLevel: route.crowdLevel,
          co2SavedKg: route.co2SavedKg || 1.8,
        }),
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading route itinerary & live tracking...</p>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen py-20 text-center">
        <p className="text-sm text-slate-500">Route details could not be found.</p>
        <Link href="/routes" className="text-xs font-bold text-emerald-600 underline mt-2 inline-block">
          Return to Routes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation back and header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Route Details
                </span>
                <span className="text-slate-400 text-xs">• {route.routeId}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {route.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved to Profile' : 'Save Commute'}</span>
            </button>

            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Rate Trip</span>
            </button>
          </div>
        </div>

        {/* Dynamic Alternative Delay Warning if route has delays */}
        {route.delayMinutes >= 5 && (
          <DynamicAlternativeAlert
            delayMinutes={route.delayMinutes}
            routeName={route.name}
            alternativeRouteName="Metro Blue Line → Bus 42 Feeder"
            alternativeRouteId="MXD-MTR-BUS-42"
            timeSavingsText="14 mins faster • Moderate crowd • ₹35"
            onSwitchRoute={(id) => router.push(`/routes/${id}`)}
          />
        )}

        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Time</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{route.estimatedTime + (route.delayMinutes || 0)} mins</span>
            </div>
            {route.delayMinutes > 0 && (
              <span className="text-[10px] text-amber-600 font-semibold">Includes +{route.delayMinutes}m delay</span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Fare</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <IndianRupee className="w-4 h-4 text-emerald-500" />
              <span>₹{route.fare}</span>
            </div>
            <span className="text-[10px] text-slate-400">Smart Card Discount eligible</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">Crowd Level</span>
            <div className="mt-1">
              <CrowdIndicator level={route.crowdLevel} showBar />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">Transit Status</span>
            <div className="mt-1">
              <TransitStatusBadge status={route.status} delayMinutes={route.delayMinutes} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">Eco Savings</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <Leaf className="w-4 h-4" />
              <span>~{route.co2SavedKg || 2.4} kg</span>
            </div>
            <span className="text-[10px] text-slate-400">CO2 emissions saved</span>
          </div>
        </div>

        {/* Interactive Map & Live Vehicle Visualizer */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation2 className="w-4 h-4 text-emerald-600" />
              <span>Live Vehicle Radar & Station Path</span>
            </h3>
            <span className="text-xs text-slate-400">Animated GPS Simulation Active</span>
          </div>
          <InteractiveMap selectedRoute={route} heightClass="h-[380px]" />
        </div>

        {/* Step-by-Step Detailed Itinerary & Stops Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Timeline (Span 8) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Step-by-Step Travel Itinerary
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Turn-by-turn walking instructions, interchange nodes, and platform guidelines
                </p>
              </div>

              {!journeyStarted ? (
                <button
                  onClick={handleStartJourney}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  🚀 Start This Journey
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Journey In Progress
                </span>
              )}
            </div>

            {/* Segments timeline */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {route.segments?.map((seg: any, idx: number) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Icon Node */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md z-10 flex-shrink-0"
                    style={{ backgroundColor: seg.lineColor || '#10b981' }}
                  >
                    {seg.mode === 'walk' ? '🚶' : seg.mode === 'bus' ? '🚌' : '🚆'}
                  </div>

                  {/* Segment Details Card */}
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {seg.lineName}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {seg.durationMinutes} mins • {seg.distanceKm} km
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {seg.fromStop} → {seg.toStop}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {seg.instructions}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Fare: ₹{seg.fare}</span>
                      <CrowdIndicator level={seg.crowdLevel || 'low'} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* All Intermediate Station Stops List */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Intermediate Station Stops ({route.stops?.length || 0})
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {route.stops?.map((stop: any, idx: number) => (
                  <div key={stop.id || idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {stop.name}
                        </span>
                        {stop.isInterchange && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                            Interchange Hub
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">+{stop.timeOffsetMinutes || idx * 4} min</span>
                      <CrowdIndicator level={stop.crowdLevel || 'moderate'} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Schedule & Commuter Tips (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Schedule Board */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Departure Schedule (Live Headways)
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Frequency: Every <strong className="text-slate-900 dark:text-white">{route.frequencyMinutes || 5} minutes</strong>
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(route.scheduleTimes || ['08:00 AM', '08:05 AM', '08:10 AM', '08:15 AM']).map(
                  (slot: string, i: number) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      {slot}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* AI Recommendation Summary */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Recommendation Breakdown
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {route.summary ||
                  'High frequency corridor providing continuous air-conditioned travel and direct skywalk interchange access.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        routeId={route.routeId || route.id}
        routeName={route.name}
      />
    </div>
  );
}
