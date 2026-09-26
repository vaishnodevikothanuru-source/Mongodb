import React, { useState, useEffect } from 'react';
import { historyApi } from '../api/historyApi';
import { useToast } from '../context/ToastContext';
import { formatDate, formatRuntime } from '../utils/helpers';
import { History, Calendar, Star, Trash2, Search, Play } from 'lucide-react';

export const WatchHistoryPage = () => {
  const toast = useToast();
  const [timeline, setTimeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await historyApi.getTimeline();
      if (res.success) {
        setTimeline(res.data);
      }
    } catch (err) {
      toast.error('Failed to load watch history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id, title) => {
    if (window.confirm(`Delete watch history record for "${title}"?`)) {
      try {
        await historyApi.deleteEntry(id);
        toast.info('Watch history entry deleted');
        fetchTimeline();
      } catch (err) {
        toast.error('Failed to delete history record');
      }
    }
  };

  const timelineMonths = Object.keys(timeline);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-brand-400" />
          <span>Viewing Timeline & History</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Chronological record of movies watched, personal ratings, and rewatches in MongoDB.
        </p>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading viewing history...</div>
      ) : timelineMonths.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 space-y-3 max-w-md mx-auto p-6">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Watch History Logged Yet</h3>
          <p className="text-xs text-slate-400">
            Mark movies as 'Watched' in your library or dashboard to build your cinematic timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800 before:z-0">
          {timelineMonths.map((monthKey) => {
            const entries = timeline[monthKey];
            return (
              <div key={monthKey} className="space-y-4 relative z-10">
                {/* Month header badge */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-500 text-black font-bold flex items-center justify-center text-xs shadow-lg shadow-brand-500/30">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-lg font-bold font-display text-white tracking-wide">
                    {monthKey} <span className="text-xs text-slate-400 font-normal">({entries.length} movies)</span>
                  </h2>
                </div>

                {/* Month Entries */}
                <div className="pl-9 space-y-3">
                  {entries.map((item) => (
                    <div
                      key={item._id}
                      className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.posterUrl}
                          alt={item.movieTitle}
                          className="w-12 h-16 rounded-lg object-cover bg-slate-800 shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-white hover:text-brand-400 transition-colors">
                            {item.movieTitle}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>Watched on: {formatDate(item.watchedAt)}</span>
                            <span>•</span>
                            <span>{formatRuntime(item.runtime)}</span>
                            {item.timesWatched > 1 && (
                              <span className="px-2 py-0.5 rounded bg-brand-500/15 border border-brand-500/30 text-brand-300 font-bold text-[10px]">
                                Rewatched {item.timesWatched}x
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-xs text-slate-300 italic mt-1 max-w-lg">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {item.personalRating && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/80 border border-brand-500/40 text-brand-400 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-brand-400 text-brand-400" />
                            <span>{item.personalRating}/10</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteEntry(item._id, item.movieTitle)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Remove from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
