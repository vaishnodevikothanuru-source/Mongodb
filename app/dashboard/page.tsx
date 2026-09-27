'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Navigation,
  Bookmark,
  Radio,
  Sparkles,
  Clock,
  IndianRupee,
  Shuffle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Leaf,
  Layers,
  MapPin,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import QuickJourneyPlanner from '@/components/QuickJourneyPlanner';
import RouteCard from '@/components/RouteCard';
import DynamicAlternativeAlert from '@/components/DynamicAlternativeAlert';
import CrowdIndicator from '@/components/CrowdIndicator';
import TransitStatusBadge from '@/components/TransitStatusBadge';
import { INITIAL_SAVED_JOURNEYS } from '@/lib/mockData';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [savedJourneys, setSavedJourneys] = useState<any[]>(INITIAL_SAVED_JOURNEYS);
  const [transitData, setTransitData] = useState<any>(null);
  const [recommendedRoute, setRecommendedRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live transit status
      const transitRes = await fetch('/api/transit/live');
      const transitJson = await transitRes.json();
      setTransitData(transitJson);

      // 2. Fetch saved journeys
      const savedRes = await fetch('/api/saved-journeys');
      const savedJson = await savedRes.json();
      if (savedJson.savedJourneys) {
        setSavedJourneys(savedJson.savedJourneys);
      }

      // 3. Fetch recommended daily route
      const searchRes = await fetch('/api/journeys/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: user?.homeLocation?.name || 'Dwarka Sector 21',
          destination: user?.workLocation?.name || 'Cyber City Hub',
        }),
      });
      const searchJson = await searchRes.json();
      if (searchJson.recommendedRoute) {
        setRecommendedRoute(searchJson.recommendedRoute);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handlePlanAgain = (journey: any) => {
    const query = new URLSearchParams({
      origin: journey.origin,
      destination: journey.destination,
      mode: journey.preferredMode || 'all',
    }).toString();
    router.push(`/routes?${query}`);
  };

  // Compute greeting safely
  const hour = mounted ? new Date().getHours() : 9;
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Find first affected route in the network for dynamic banner
  const delayedUpdate = transitData?.updates?.find((u: any) => u.delay > 0 || u.status === 'delayed');
  const delayedRoute = transitData?.routes?.find((r: any) => r.delayMinutes > 0 || r.status === 'delayed');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Personalized Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                Commuter Central
              </span>
              <span className="text-xs text-slate-400">
                • {mounted ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Today'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {greeting}, {user?.name || 'Commuter'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Your commute radar is active. Live transit systems are operating at ~{transitData?.networkStats?.networkPunctuality || 97}% punctuality.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Radar</span>
            </button>
            <Link
              href="/planner"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Full Planner</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Delay / Alternative Route Alert Banner (Shown if delays exist) */}
        {(delayedRoute || delayedUpdate) && (
          <DynamicAlternativeAlert
            delayMinutes={delayedRoute?.delayMinutes || delayedUpdate?.delay || 8}
            routeName={delayedRoute?.name || delayedUpdate?.routeName || 'Metro Yellow Line'}
            alternativeRouteName="Metro Blue Line → Bus 42 Feeder"
            alternativeRouteId="MXD-MTR-BUS-42"
            timeSavingsText="14 mins faster • Moderate crowd • ₹35"
            onSwitchRoute={(id) => router.push(`/routes?highlight=${id}`)}
          />
        )}

        {/* Main Grid: Quick Planner & Live Transit Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Journey Planner (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <QuickJourneyPlanner />

            {/* Currently Recommended Daily Route */}
            {recommendedRoute && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Recommended Morning Route
                    </h2>
                  </div>
                  <Link
                    href={`/routes?origin=${encodeURIComponent(
                      user?.homeLocation?.name || 'Dwarka'
                    )}&destination=${encodeURIComponent(user?.workLocation?.name || 'Cyber City')}`}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <span>View All Options</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <RouteCard
                  scoredRoute={recommendedRoute}
                  onSelect={() =>
                    router.push(`/routes/${recommendedRoute.route?.routeId || recommendedRoute.routeId || 'MTR-BLU-01'}`)
                  }
                />
              </div>
            )}
          </div>

          {/* Right Column: Live Transit Status & Impact Widget (Span 1) */}
          <div className="space-y-6">
            {/* Current Transit Status Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Current Transit Status</h3>
                    <p className="text-[11px] text-slate-500">Live network snapshot</p>
                  </div>
                </div>
                <Link
                  href="/live-transit"
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Live Board →
                </Link>
              </div>

              {/* Status breakdown pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                    Normal Services
                  </span>
                  <div className="text-lg font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
                    {transitData?.networkStats?.onTimeCount || 5} Lines
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">
                    Delays Reported
                  </span>
                  <div className="text-lg font-black text-amber-900 dark:text-amber-200 mt-0.5">
                    {transitData?.networkStats?.delayedCount || 2} Lines
                  </div>
                </div>
              </div>

              {/* Live Alerts List */}
              <div className="mt-4 space-y-2.5">
                {(transitData?.updates?.slice(0, 3) || []).map((up: any) => (
                  <div
                    key={up.id || up._id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{up.routeName}</span>
                      <TransitStatusBadge status={up.status} delayMinutes={up.delay} />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {up.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Commuter Green Impact & Savings Widget */}
            <div className="bg-gradient-to-tr from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 border border-emerald-800/50 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Eco Commute Impact
                  </h3>
                  <p className="text-[11px] text-emerald-100/70">Your carbon offsets</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center my-3">
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-700/50">
                  <div className="text-lg font-black text-emerald-300">~24.6 kg</div>
                  <div className="text-[10px] text-emerald-100/70">CO2 Saved this Month</div>
                </div>
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-700/50">
                  <div className="text-lg font-black text-emerald-300">₹1,840</div>
                  <div className="text-[10px] text-emerald-100/70">Saved vs Private Cabs</div>
                </div>
              </div>

              <Link
                href="/analytics"
                className="mt-2 block text-center py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                View Full Commute Analytics →
              </Link>
            </div>
          </div>
        </div>

        {/* Saved Journeys Quick Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Frequently Used Saved Journeys
              </h2>
            </div>
            <Link
              href="/saved-journeys"
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Manage Saved ({savedJourneys.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedJourneys.map((item) => (
              <div
                key={item.id || item._id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase">
                      {item.tags?.[0] || 'Daily Commute'}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.departureTimePreference || '08:30 AM'}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {item.origin} → {item.destination}
                  </p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> ~{item.estimatedTime || 35} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> ₹{item.estimatedFare || 40}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handlePlanAgain(item)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Plan Again</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
