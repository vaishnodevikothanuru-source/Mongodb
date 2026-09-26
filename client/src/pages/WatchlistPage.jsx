import React, { useState, useEffect } from 'react';
import { watchlistApi } from '../api/watchlistApi';
import { moviesApi } from '../api/moviesApi';
import { MovieCard } from '../components/movies/MovieCard';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { QuickStatusModal } from '../components/movies/QuickStatusModal';
import { useToast } from '../context/ToastContext';
import { triggerConfetti, formatRuntime } from '../utils/helpers';
import { Bookmark, Clock, Flame, Sparkles, Check, Trash2, Sliders } from 'lucide-react';

export const WatchlistPage = () => {
  const toast = useToast();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePriority, setActivePriority] = useState('ALL');
  const [availableTime, setAvailableTime] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [quickModalOpen, setQuickModalOpen] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, [activePriority, availableTime]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activePriority !== 'ALL') params.priority = activePriority;
      if (availableTime) params.maxRuntime = availableTime;

      const res = await watchlistApi.getWatchlist(params);
      if (res.success) {
        setWatchlist(res.data);
      }
    } catch (err) {
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (itemId, newPriority) => {
    try {
      await watchlistApi.updatePriority(itemId, { priority: newPriority });
      toast.success(`Priority set to ${newPriority}`);
      fetchWatchlist();
    } catch (err) {
      toast.error('Failed to update priority');
    }
  };

  const handleMarkWatched = async (movie) => {
    try {
      await moviesApi.updateStatus(movie._id, 'WATCHED');
      triggerConfetti();
      toast.success(`"${movie.title}" marked as watched!`);
      fetchWatchlist();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleRemove = async (itemId, title) => {
    try {
      await watchlistApi.removeFromWatchlist(itemId);
      toast.info(`"${title}" removed from watchlist`);
      fetchWatchlist();
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const highPriority = watchlist.filter((w) => w.priority === 'High');
  const mediumPriority = watchlist.filter((w) => w.priority === 'Medium');
  const lowPriority = watchlist.filter((w) => w.priority === 'Low');

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-cyan-400" />
            <span>Smart Watchlist</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Prioritize and manage movies you plan to watch ({watchlist.length} items)
          </p>
        </div>
      </div>

      {/* Smart Intelligence & Filter Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs">
          {[
            { label: `All (${watchlist.length})`, val: 'ALL' },
            { label: '🔥 High Priority', val: 'High' },
            { label: '⏳ Medium Priority', val: 'Medium' },
            { label: '📅 Low Priority', val: 'Low' },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setActivePriority(tab.val)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activePriority === tab.val
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Smart Time Filter: "I have 2 hours" */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Available Time:</span>
          <select
            value={availableTime}
            onChange={(e) => setAvailableTime(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="">Any Runtime</option>
            <option value="90">"I have 90 minutes"</option>
            <option value="120">"I have 2 hours"</option>
            <option value="150">"I have 2.5 hours"</option>
          </select>
        </div>
      </div>

      {/* Watchlist Items */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading your watchlist...</div>
      ) : watchlist.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 space-y-3 max-w-md mx-auto p-6">
          <Bookmark className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-400">
            Browse recommendations or discover movies to queue for your upcoming movie nights.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {watchlist.map((item) => {
            const movie = item.movieId;
            if (!movie) return null;

            return (
              <div
                key={item._id}
                className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Movie poster & info */}
                <div className="flex items-center gap-4">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-16 h-24 rounded-xl object-cover bg-slate-800 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white hover:text-cyan-400 transition-colors">
                        {movie.title}
                      </h3>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <p className="text-xs text-slate-400">
                      {movie.releaseYear || (movie.releaseDate ? movie.releaseDate.split('-')[0] : 'N/A')} •{' '}
                      {formatRuntime(movie.runtime)} • {movie.genres?.slice(0, 2).join(', ')}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-cyan-300 italic max-w-lg">
                        Note: "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Priority selector */}
                  <select
                    value={item.priority}
                    onChange={(e) => handlePriorityChange(item._id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="High">🔥 High</option>
                    <option value="Medium">⏳ Medium</option>
                    <option value="Low">📅 Low</option>
                  </select>

                  <button
                    onClick={() => handleMarkWatched(movie)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Watched</span>
                  </button>

                  <button
                    onClick={() => handleRemove(item._id, movie.title)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick modal */}
      <QuickStatusModal
        movie={selectedMovie}
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        onMovieUpdated={fetchWatchlist}
      />
    </div>
  );
};
