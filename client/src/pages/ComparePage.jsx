import React, { useState, useEffect } from 'react';
import { moviesApi } from '../api/moviesApi';
import { RatingStars } from '../components/common/RatingStars';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatRuntime, getGenreColor } from '../utils/helpers';
import { Scale, Star, Clock, Calendar, Film, User, Check, X } from 'lucide-react';

export const ComparePage = () => {
  const [allMovies, setAllMovies] = useState([]);
  const [movieAId, setMovieAId] = useState('');
  const [movieBId, setMovieBId] = useState('');
  const [movieA, setMovieA] = useState(null);
  const [movieB, setMovieB] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await moviesApi.getMovies({ limit: 100 });
      if (res.success && res.data.length >= 2) {
        setAllMovies(res.data);
        setMovieAId(res.data[0]._id);
        setMovieBId(res.data[1]._id);
        setMovieA(res.data[0]);
        setMovieB(res.data[1]);
      } else if (res.data) {
        setAllMovies(res.data);
      }
    } catch (err) {
      console.error('Failed to load movies for compare', err);
    }
  };

  const handleSelectA = (id) => {
    setMovieAId(id);
    setMovieA(allMovies.find((m) => m._id === id) || null);
  };

  const handleSelectB = (id) => {
    setMovieBId(id);
    setMovieB(allMovies.find((m) => m._id === id) || null);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2.5">
          <Scale className="w-7 h-7 text-brand-400" />
          <span>Movie Comparison Tool</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Compare metrics, ratings, runtime, director, and personal notes side-by-side.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-400 mb-1.5">
            Movie A
          </label>
          <select
            value={movieAId}
            onChange={(e) => handleSelectA(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
          >
            {allMovies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title} ({m.releaseYear || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
            Movie B
          </label>
          <select
            value={movieBId}
            onChange={(e) => handleSelectB(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {allMovies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title} ({m.releaseYear || 'N/A'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      {movieA && movieB ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A */}
          <div className="glass-card p-6 rounded-3xl border border-brand-500/30 space-y-6">
            <div className="flex gap-4 items-start">
              <img
                src={movieA.posterUrl}
                alt={movieA.title}
                className="w-24 sm:w-32 aspect-[2/3] object-cover rounded-xl bg-slate-800 shrink-0 shadow-lg"
              />
              <div className="space-y-1.5">
                <StatusBadge status={movieA.status} />
                <h2 className="text-xl font-bold text-white mt-1">{movieA.title}</h2>
                <p className="text-xs text-slate-400">Dir. {movieA.director || 'Unknown'}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(movieA.genres || []).map((g) => (
                    <span key={g} className={`px-2 py-0.5 text-[10px] font-medium rounded border ${getGenreColor(g)}`}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Personal Rating</span>
                <span className="font-bold text-brand-400">
                  {movieA.personalRating ? `${movieA.personalRating} / 10` : 'Unrated'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">External Rating</span>
                <span className="font-bold text-amber-400">{movieA.rating} ★</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Runtime</span>
                <span className="font-semibold text-slate-200">{formatRuntime(movieA.runtime)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Times Watched</span>
                <span className="font-semibold text-slate-200">{movieA.timesWatched || 0} times</span>
              </div>

              <div className="py-1.5">
                <span className="text-slate-400 block mb-1">Top Cast</span>
                <p className="text-slate-200">{movieA.cast?.slice(0, 4).join(', ') || 'N/A'}</p>
              </div>

              {movieA.review && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Your Review</span>
                  <p className="text-xs text-slate-300 italic mt-0.5">"{movieA.review}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Card B */}
          <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-6">
            <div className="flex gap-4 items-start">
              <img
                src={movieB.posterUrl}
                alt={movieB.title}
                className="w-24 sm:w-32 aspect-[2/3] object-cover rounded-xl bg-slate-800 shrink-0 shadow-lg"
              />
              <div className="space-y-1.5">
                <StatusBadge status={movieB.status} />
                <h2 className="text-xl font-bold text-white mt-1">{movieB.title}</h2>
                <p className="text-xs text-slate-400">Dir. {movieB.director || 'Unknown'}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(movieB.genres || []).map((g) => (
                    <span key={g} className={`px-2 py-0.5 text-[10px] font-medium rounded border ${getGenreColor(g)}`}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Personal Rating</span>
                <span className="font-bold text-cyan-400">
                  {movieB.personalRating ? `${movieB.personalRating} / 10` : 'Unrated'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">External Rating</span>
                <span className="font-bold text-amber-400">{movieB.rating} ★</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Runtime</span>
                <span className="font-semibold text-slate-200">{formatRuntime(movieB.runtime)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Times Watched</span>
                <span className="font-semibold text-slate-200">{movieB.timesWatched || 0} times</span>
              </div>

              <div className="py-1.5">
                <span className="text-slate-400 block mb-1">Top Cast</span>
                <p className="text-slate-200">{movieB.cast?.slice(0, 4).join(', ') || 'N/A'}</p>
              </div>

              {movieB.review && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Your Review</span>
                  <p className="text-xs text-slate-300 italic mt-0.5">"{movieB.review}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 text-sm">
          Please add at least 2 movies to your library to compare.
        </div>
      )}
    </div>
  );
};
