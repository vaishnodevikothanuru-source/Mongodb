'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Navigation,
  MapPin,
  ArrowRightLeft,
  Calendar,
  Clock,
  Search,
  Train,
  Bus,
  Footprints,
  Sparkles,
  Shuffle,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export function QuickJourneyPlanner() {
  const router = useRouter();
  const { user } = useAuth();

  const [origin, setOrigin] = useState(user?.homeLocation?.name || 'Dwarka Sector 21');
  const [destination, setDestination] = useState(user?.workLocation?.name || 'Noida Electronic City');
  const [selectedMode, setSelectedMode] = useState('all');

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      origin,
      destination,
      mode: selectedMode,
    }).toString();
    router.push(`/routes?${query}`);
  };

  const quickStops = [
    { label: 'Home', val: user?.homeLocation?.name || 'Greenwood Heights, Sector 14' },
    { label: 'Work', val: user?.workLocation?.name || 'Cyber Tech Park, Gate 3' },
    { label: 'Campus', val: user?.collegeLocation?.name || 'University North Campus' },
    { label: 'Airport T3', val: 'IGI Airport Terminal 3' },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Quick Journey Planner</h3>
            <p className="text-xs text-slate-500">Instant AI-ranked multimodal commute recommendations</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3 h-3" /> Live Scoring
        </span>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Origin & Destination Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-2 items-center">
          {/* Origin */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Starting From (Origin)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Enter starting station or address"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pt-5">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Locations"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:rotate-180 duration-300"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Destination
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-500">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination hub"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Location Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 mr-1">Quick Select:</span>
          {quickStops.map((stop) => (
            <button
              key={stop.label}
              type="button"
              onClick={() => setDestination(stop.val)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {stop.label}
            </button>
          ))}
        </div>

        {/* Mode Selector & Submit Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[
              { id: 'all', label: 'All Modes', icon: Shuffle },
              { id: 'metro', label: 'Metro', icon: Train },
              { id: 'bus', label: 'Bus', icon: Bus },
              { id: 'mixed', label: 'Mixed', icon: Sparkles },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedMode === m.id
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Find Smart Routes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuickJourneyPlanner;
