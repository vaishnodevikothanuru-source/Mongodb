import React, { useState, useEffect } from 'react';
import { statsApi } from '../api/statsApi';
import { useToast } from '../context/ToastContext';
import {
  BarChart3,
  Clock,
  Film,
  CheckCircle,
  Star,
  Bookmark,
  Heart,
  TrendingUp,
  FolderHeart,
} from 'lucide-react';

export const StatisticsPage = () => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await statsApi.getStatistics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400">Loading viewing analytics...</div>;
  }

  const { summary, genreBreakdown, ratingDistribution, monthlyTrends } = data;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-brand-400" />
          <span>Viewing Analytics & Statistics</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Deep metrics and viewing behavior calculated in real-time from your MongoDB database records.
        </p>
      </div>

      {/* Hero Watch-Time Tracker Banner */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-brand-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Watch-Time Intelligence
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
              {summary.totalWatchHours}{' '}
              <span className="text-xl sm:text-2xl font-medium text-slate-400">Hours Watched</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Approximately {summary.totalWatchMinutes.toLocaleString()} minutes of runtime across{' '}
              {summary.watchedCount} completed film viewings.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center min-w-[120px]">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Avg Runtime</p>
              <p className="text-xl font-bold font-display text-brand-400 mt-1">
                {summary.averageRuntime}m
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center min-w-[120px]">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Avg Rating</p>
              <p className="text-xl font-bold font-display text-amber-400 mt-1">
                {summary.averageRating} ★
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Movies', value: summary.totalMovies, icon: Film, color: 'text-brand-400' },
          { label: 'Watched', value: summary.watchedCount, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Unwatched', value: summary.unwatchedCount, icon: Clock, color: 'text-slate-400' },
          { label: 'Watchlist', value: summary.watchlistCount, icon: Bookmark, color: 'text-cyan-400' },
          { label: 'Favorites', value: summary.favoritesCount, icon: Heart, color: 'text-rose-400' },
          { label: 'Collections', value: summary.collectionsCount, icon: FolderHeart, color: 'text-purple-400' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="glass-card p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <Icon className={`w-5 h-5 ${item.color}`} />
              <div>
                <p className="text-xl font-bold font-display text-white">{item.value}</p>
                <p className="text-xs text-slate-400">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Breakdown Grid: Genres (Left) & Rating Spread (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Genre Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-brand-400" />
            <span>Genre Breakdown</span>
          </h3>

          <div className="space-y-3.5">
            {genreBreakdown.map((g) => (
              <div key={g.genre} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{g.genre}</span>
                  <span className="text-brand-400">{g.count} movies ({g.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(5, g.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Spread Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Personal Rating Distribution</span>
          </h3>

          <div className="space-y-3.5">
            {Object.entries(ratingDistribution).map(([range, count]) => {
              const totalRated = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
              const pct = totalRated > 0 ? Math.round((count / totalRated) * 100) : 0;

              return (
                <div key={range} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">{range} Stars</span>
                    <span className="text-amber-400">{count} movies ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Viewing Activity Bar Chart */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Monthly Viewing Activity (Last 6 Months)</span>
        </h3>

        <div className="flex items-end justify-between gap-2 h-44 pt-6 px-2">
          {monthlyTrends.map((m) => {
            const maxVal = Math.max(...monthlyTrends.map((t) => t.moviesWatched), 5);
            const heightPercent = Math.round((m.moviesWatched / maxVal) * 100);

            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-slate-300">{m.moviesWatched}</span>
                <div
                  className="w-full max-w-[48px] bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-xl transition-all duration-700 hover:brightness-125"
                  style={{ height: `${Math.max(10, heightPercent)}%` }}
                />
                <span className="text-[10px] text-slate-400 font-medium truncate">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
