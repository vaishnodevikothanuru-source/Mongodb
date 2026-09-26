import React, { useState, useEffect } from 'react';
import { discoverApi } from '../api/discoverApi';
import { moviesApi } from '../api/moviesApi';
import { useToast } from '../context/ToastContext';
import { formatRuntime, getGenreColor, triggerConfetti } from '../utils/helpers';
import {
  Compass,
  Search,
  Sparkles,
  Plus,
  Check,
  Star,
  Flame,
  Smile,
  Zap,
  Moon,
  Heart,
  Ghost,
  Coffee,
} from 'lucide-react';

const MOODS = [
  { label: 'Mind-bending', icon: Zap },
  { label: 'Funny', icon: Smile },
  { label: 'Dark', icon: Moon },
  { label: 'Emotional', icon: Heart },
  { label: 'Exciting', icon: Flame },
  { label: 'Relaxing', icon: Coffee },
  { label: 'Scary', icon: Ghost },
  { label: 'Inspirational', icon: Sparkles },
];

export const DiscoverPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('popular');
  const [activeMood, setActiveMood] = useState('Mind-bending');
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState(null);
  const [importedIds, setImportedIds] = useState(new Set());

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else if (activeTab === 'mood') {
      fetchMoodMovies();
    } else {
      fetchCuratedMovies();
    }
  }, [activeTab, activeMood]);

  const fetchCuratedMovies = async () => {
    try {
      setLoading(true);
      const res = await discoverApi.getCurated(activeTab);
      if (res.success) {
        setMovies(res.data);
      }
    } catch (err) {
      toast.error('Failed to load discovery feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoodMovies = async () => {
    try {
      setLoading(true);
      const res = await discoverApi.getMoodMovies(activeMood);
      if (res.success) {
        setMovies(res.data.discoverCandidates || []);
      }
    } catch (err) {
      toast.error('Failed to load mood movies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const res = await discoverApi.searchExternal(searchQuery.trim());
      if (res.success) {
        setMovies(res.data);
      }
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImportToLibrary = async (movie, targetStatus = 'WATCHLIST') => {
    try {
      setImportingId(movie.tmdbId || movie._id);
      const res = await moviesApi.createMovie({
        title: movie.title,
        originalTitle: movie.originalTitle,
        description: movie.description,
        posterUrl: movie.posterUrl,
        backdropUrl: movie.backdropUrl,
        releaseDate: movie.releaseDate,
        releaseYear: movie.releaseYear,
        runtime: movie.runtime,
        genres: movie.genres,
        languages: movie.languages,
        country: movie.country,
        director: movie.director,
        cast: movie.cast,
        rating: movie.rating,
        voteCount: movie.voteCount,
        status: targetStatus,
        watchlist: targetStatus === 'WATCHLIST',
        externalIds: { tmdbId: movie.tmdbId, imdbId: movie.imdbId },
      });

      if (res.success) {
        setImportedIds((prev) => new Set([...prev, movie.tmdbId || movie._id]));
        if (targetStatus === 'WATCHED') triggerConfetti();
        toast.success(`"${movie.title}" imported into your MongoDB library!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to import movie';
      toast.info(msg);
      setImportedIds((prev) => new Set([...prev, movie.tmdbId || movie._id]));
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-brand-400" />
            <span>Movie Discovery & Import</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Explore global cinema metadata, find moods, and import directly into your MongoDB library.
          </p>
        </div>
      </div>

      {/* External Search Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search external TMDB / global catalog (e.g., Gladiator, Denis Villeneuve)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-12 pr-28 py-3.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-400 shadow-xl"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs rounded-xl transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Category & Mood Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { label: '🔥 Trending', val: 'trending' },
            { label: '⭐ Most Popular', val: 'popular' },
            { label: '🏆 Top Rated', val: 'top_rated' },
            { label: '💎 Hidden Gems', val: 'hidden_gem' },
            { label: '✨ Mood Discovery', val: 'mood' },
          ].map((cat) => (
            <button
              key={cat.val}
              onClick={() => {
                setSearchQuery('');
                setActiveTab(cat.val);
              }}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === cat.val && !searchQuery
                  ? 'bg-brand-500 text-black shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Mood Selector Pills (When Mood tab active) */}
        {activeTab === 'mood' && !searchQuery && (
          <div className="p-4 glass-panel rounded-2xl border border-brand-500/20 flex flex-wrap gap-2 animate-fade-in">
            {MOODS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.label}
                  onClick={() => setActiveMood(m.label)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeMood === m.label
                      ? 'bg-brand-400 text-black font-bold shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Discovery Results Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading discover feed...</div>
      ) : movies.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 space-y-3 max-w-md mx-auto p-6">
          <Compass className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-slate-400">Try searching for a different movie title or genre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie) => {
            const isImported = importedIds.has(movie.tmdbId || movie._id);
            const isBusy = importingId === (movie.tmdbId || movie._id);

            return (
              <div
                key={movie.tmdbId || movie._id}
                className="glass-card rounded-xl overflow-hidden flex flex-col justify-between group border border-slate-800"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-slate-700 text-slate-300 text-xs font-semibold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{movie.rating || 7.5}</span>
                  </div>
                </div>

                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                      {movie.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {movie.releaseYear || (movie.releaseDate ? movie.releaseDate.split('-')[0] : 'N/A')} •{' '}
                      {formatRuntime(movie.runtime)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
                    {isImported ? (
                      <span className="w-full py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>In Library</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleImportToLibrary(movie, 'WATCHLIST')}
                          disabled={isBusy}
                          className="w-full py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isBusy ? 'Importing...' : '+ Watchlist'}</span>
                        </button>
                        <button
                          onClick={() => handleImportToLibrary(movie, 'WATCHED')}
                          disabled={isBusy}
                          className="w-full py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                        >
                          + Mark Watched
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
