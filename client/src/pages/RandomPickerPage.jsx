import React, { useState, useEffect } from 'react';
import { moviesApi } from '../api/moviesApi';
import { watchlistApi } from '../api/watchlistApi';
import { MovieCard } from '../components/movies/MovieCard';
import { triggerConfetti, formatRuntime } from '../utils/helpers';
import { Dices, Sparkles, Film, Bookmark, Heart, Clock, Shuffle, Check } from 'lucide-react';

export const RandomPickerPage = () => {
  const [source, setSource] = useState('library'); // 'library', 'watchlist', 'favorites'
  const [genre, setGenre] = useState('');
  const [unwatchedOnly, setUnwatchedOnly] = useState(false);
  const [maxRuntime, setMaxRuntime] = useState('');

  const [candidates, setCandidates] = useState([]);
  const [pickedMovie, setPickedMovie] = useState(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [source, genre, unwatchedOnly, maxRuntime]);

  const fetchCandidates = async () => {
    try {
      const params = { limit: 200 };
      if (source === 'favorites') params.favorite = 'true';
      if (source === 'watchlist') params.status = 'WATCHLIST';
      if (unwatchedOnly && source !== 'watchlist') params.status = 'UNWATCHED';
      if (genre) params.genre = genre;
      if (maxRuntime) params.maxRuntime = maxRuntime;

      const res = await moviesApi.getMovies(params);
      if (res.success) {
        setCandidates(res.data);
      }
    } catch (err) {
      console.error('Failed to load candidate pool', err);
    }
  };

  const handlePickRandom = () => {
    if (candidates.length === 0) return;
    setSpinning(true);
    setPickedMovie(null);

    let counter = 0;
    const interval = setInterval(() => {
      const temp = candidates[Math.floor(Math.random() * candidates.length)];
      setPickedMovie(temp);
      counter++;

      if (counter > 15) {
        clearInterval(interval);
        const finalPick = candidates[Math.floor(Math.random() * candidates.length)];
        setPickedMovie(finalPick);
        setSpinning(false);
        triggerConfetti();
      }
    }, 100);
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-brand-500/20">
          <Dices className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-3xl font-black font-display text-white tracking-tight">
          Random Movie Roulette
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Can't decide what to watch? Let the picker choose from your MongoDB library.
        </p>
      </div>

      {/* Filter Parameters */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Source pool */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Source Pool
            </label>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Entire Library', val: 'library', icon: Film },
                { label: 'Watchlist Only', val: 'watchlist', icon: Bookmark },
                { label: 'Favorites Only', val: 'favorites', icon: Heart },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.val}
                    onClick={() => setSource(s.val)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                      source === s.val
                        ? 'bg-brand-500 text-black border-brand-400 shadow'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genre filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
            >
              <option value="">Any Genre</option>
              {['Sci-Fi', 'Action', 'Drama', 'Thriller', 'Comedy', 'Animation', 'Crime', 'Mystery'].map(
                (g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Max duration */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Max Duration
            </label>
            <select
              value={maxRuntime}
              onChange={(e) => setMaxRuntime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
            >
              <option value="">Any Runtime</option>
              <option value="90">Under 90 mins</option>
              <option value="120">Under 2 hours</option>
              <option value="150">Under 2.5 hours</option>
            </select>
          </div>
        </div>

        {/* Spin / Pick Action Button */}
        <div className="pt-3 border-t border-slate-800 flex flex-col items-center gap-2">
          <p className="text-xs text-slate-400">
            Matching candidates in pool: <span className="font-bold text-white">{candidates.length}</span> movies
          </p>

          <button
            onClick={handlePickRandom}
            disabled={candidates.length === 0 || spinning}
            className="w-full sm:w-64 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-400 hover:from-brand-500 hover:to-amber-300 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-brand-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            <Shuffle className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
            <span>{spinning ? 'Selecting...' : 'Pick Tonight\'s Film'}</span>
          </button>
        </div>
      </div>

      {/* Picked Result Display */}
      {pickedMovie && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/40 animate-slide-up space-y-4">
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Tonight's Selection</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <img
              src={pickedMovie.posterUrl}
              alt={pickedMovie.title}
              className="w-36 sm:w-44 rounded-2xl aspect-[2/3] object-cover bg-slate-800 shadow-2xl border border-slate-700 shrink-0"
            />
            <div className="space-y-3 text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {pickedMovie.title}
              </h2>
              <p className="text-xs text-slate-400">
                {pickedMovie.releaseYear || (pickedMovie.releaseDate ? pickedMovie.releaseDate.split('-')[0] : 'N/A')} •{' '}
                {formatRuntime(pickedMovie.runtime)} • Dir. {pickedMovie.director || 'Unknown'}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {pickedMovie.description}
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
                {(pickedMovie.genres || []).map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
