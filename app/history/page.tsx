'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  History,
  Calendar,
  Clock,
  IndianRupee,
  Train,
  Bus,
  Footprints,
  Leaf,
  Trash2,
  Navigation,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import CrowdIndicator from '@/components/CrowdIndicator';

export default function HistoryPage() {
  const router = useRouter();
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('all');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/journeys/history');
      const data = await res.json();
      if (data.history) {
        setHistoryList(data.history);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear your entire journey history?')) {
      try {
        await fetch('/api/journeys/history', { method: 'DELETE' });
        setHistoryList([]);
      } catch (e) {}
    }
  };

  const handlePlanAgain = (entry: any) => {
    const query = new URLSearchParams({
      origin: entry.origin,
      destination: entry.destination,
      mode: entry.transportType || 'all',
    }).toString();
    router.push(`/routes?${query}`);
  };

  const filteredHistory = historyList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      item.origin.toLowerCase().includes(q) ||
      item.destination.toLowerCase().includes(q) ||
      (item.routeName || '').toLowerCase().includes(q);
    const matchesMode =
      selectedMode === 'all' || (item.transportType || 'metro').toLowerCase() === selectedMode;
    return matchesQuery && matchesMode;
  });

  const totalSpent = historyList.reduce((acc, h) => acc + (h.fare || 0), 0);
  const totalCO2Saved = historyList
    .reduce((acc, h) => acc + (h.co2SavedKg || 1.8), 0)
    .toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Commute Logbook
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              Journey History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review completed transit journeys, track travel expenditures, and rerun frequent searches.
            </p>
          </div>

          {historyList.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Aggregate Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Total Trips</span>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {historyList.length} Journeys
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Transit Spend</span>
              <div className="text-xl font-black text-slate-900 dark:text-white">₹{totalSpent}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Green Offset</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                ~{totalCO2Saved} kg CO2
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by station or line..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['all', 'metro', 'bus', 'train', 'mixed'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMode(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedMode === m
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center text-slate-400">Loading journey history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No journeys match your filter criteria.</p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const histId = item.id || item._id;
              return (
                <div
                  key={histId}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(item.date || item.createdAt || Date.now()).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-emerald-600 uppercase text-[10px]">
                        {item.transportType}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {item.origin} → {item.destination}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Via {item.routeName}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-blue-500" /> {item.travelTime} mins
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> ₹{item.fare}
                      </span>
                      <CrowdIndicator level={item.crowdLevel || 'moderate'} size="sm" />
                      <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                        <Leaf className="w-3 h-3" /> ~{item.co2SavedKg || 1.8}kg CO2 saved
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <button
                      onClick={() => handlePlanAgain(item)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Plan Route Again</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
