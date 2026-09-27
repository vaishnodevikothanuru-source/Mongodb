'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ArrowUpDown,
  Filter,
  Bookmark,
  MapPin,
  RefreshCw,
  Clock,
  IndianRupee,
  Shuffle,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import RouteCard from '@/components/RouteCard';
import InteractiveMap from '@/components/InteractiveMap';
import RouteComparisonModal from '@/components/RouteComparisonModal';
import DynamicAlternativeAlert from '@/components/DynamicAlternativeAlert';
import { ScoredRoute } from '@/lib/recommendation';
import { useAuth } from '@/lib/context/AuthContext';

function RoutesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const origin = searchParams.get('origin') || user?.homeLocation?.name || 'Dwarka Sector 21';
  const destination = searchParams.get('destination') || user?.workLocation?.name || 'Cyber City Hub';
  const highlightId = searchParams.get('highlight');

  const [routes, setRoutes] = useState<ScoredRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [comparedRouteIds, setComparedRouteIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'fastest' | 'cheapest' | 'crowd'>('match');
  const [savedRouteIds, setSavedRouteIds] = useState<string[]>([]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/journeys/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          preferFastest: true,
          avoidCrowds: true,
        }),
      });
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        setRoutes(data.routes);
        const initialId = highlightId || data.routes[0]?.route?.routeId || data.routes[0]?.route?.id;
        setSelectedRouteId(initialId);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [origin, destination]);

  // Handle Comparison toggle
  const toggleCompare = (routeId: string) => {
    if (comparedRouteIds.includes(routeId)) {
      setComparedRouteIds(comparedRouteIds.filter((id) => id !== routeId));
    } else {
      if (comparedRouteIds.length >= 4) {
        alert('You can compare up to 4 routes at a time.');
        return;
      }
      setComparedRouteIds([...comparedRouteIds, routeId]);
    }
  };

  // Handle Save Journey
  const handleSaveJourney = async (routeItem: any) => {
    const r = routeItem.route || routeItem;
    try {
      await fetch('/api/saved-journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${origin} → ${destination}`,
          origin,
          destination,
          preferredMode: r.transportType,
          estimatedTime: r.estimatedTime,
          estimatedFare: r.fare,
        }),
      });
      setSavedRouteIds((prev) => [...prev, r.routeId || r.id]);
    } catch (e) {}
  };

  // Sorted list
  const sortedRoutes = [...routes].sort((a, b) => {
    if (sortBy === 'fastest') {
      return (
        a.route.estimatedTime +
        (a.route.delayMinutes || 0) -
        (b.route.estimatedTime + (b.route.delayMinutes || 0))
      );
    }
    if (sortBy === 'cheapest') {
      return a.route.fare - b.route.fare;
    }
    if (sortBy === 'crowd') {
      const order = { low: 1, moderate: 2, high: 3 };
      return (
        (order[a.route.crowdLevel as keyof typeof order] || 2) -
        (order[b.route.crowdLevel as keyof typeof order] || 2)
      );
    }
    return b.score - a.score;
  });

  const activeSelectedRoute =
    routes.find((r) => r.route.routeId === selectedRouteId || r.route.id === selectedRouteId)?.route ||
    routes[0]?.route;

  const comparedRoutesList = routes.filter((r) =>
    comparedRouteIds.includes(r.route.routeId || r.route.id)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search Results Summary Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Personalized Route Matches
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{origin}</span>
              <span className="text-slate-400">→</span>
              <span>{destination}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Found {routes.length} multimodal options ranked for your speed, cost, and crowd preferences.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => router.push('/planner')}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Modify Search
            </button>

            {comparedRouteIds.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 animate-pulse"
              >
                Compare ({comparedRouteIds.length}) Routes →
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Alternative Delay Warning if selected line has delays */}
        {activeSelectedRoute?.delayMinutes >= 5 && (
          <DynamicAlternativeAlert
            delayMinutes={activeSelectedRoute.delayMinutes}
            routeName={activeSelectedRoute.name}
            alternativeRouteName="Metro Blue Line → Bus 42 Feeder"
            alternativeRouteId="MXD-MTR-BUS-42"
            timeSavingsText="14 mins faster • Moderate crowd • ₹35"
            onSwitchRoute={(id) => setSelectedRouteId(id)}
          />
        )}

        {/* Two-Column Layout: Routes List & Interactive Map Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Route Cards (Span 7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Sorting & Filter Tabs */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Sort by:
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'match', label: 'Best Match' },
                  { id: 'fastest', label: '⚡ Fastest' },
                  { id: 'cheapest', label: '💰 Lowest Fare' },
                  { id: 'crowd', label: '🟢 Least Crowded' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      sortBy === s.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Routes */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Analyzing live transit network & crowd metrics...
                </p>
              </div>
            ) : sortedRoutes.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500">No routes found matching your criteria.</p>
              </div>
            ) : (
              sortedRoutes.map((scoredItem) => {
                const rId = scoredItem.route.routeId || scoredItem.route.id;
                return (
                  <RouteCard
                    key={rId}
                    scoredRoute={scoredItem}
                    isSelected={selectedRouteId === rId}
                    isCompared={comparedRouteIds.includes(rId)}
                    onToggleCompare={() => toggleCompare(rId)}
                    onSelect={() => setSelectedRouteId(rId)}
                    onSave={() => handleSaveJourney(scoredItem)}
                    isSaved={savedRouteIds.includes(rId)}
                  />
                );
              })
            )}
          </div>

          {/* Right Column: Sticky Live Map & Stop Inspector (Span 5) */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Selected Route Radar
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {activeSelectedRoute?.name || 'Choose a route'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/routes/${activeSelectedRoute?.routeId || 'MTR-BLU-01'}`)}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <span>Step-by-Step Itinerary</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <InteractiveMap
                selectedRoute={activeSelectedRoute}
                originName={origin}
                destinationName={destination}
                heightClass="h-[460px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Factor Comparison Modal */}
      <RouteComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        routes={comparedRoutesList.length > 0 ? comparedRoutesList : routes.slice(0, 3)}
        onSelectRoute={(id) => {
          setSelectedRouteId(id);
          setIsCompareModalOpen(false);
        }}
      />
    </div>
  );
}

export default function RoutesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-500">Loading route results...</div>
      }
    >
      <RoutesContent />
    </Suspense>
  );
}
