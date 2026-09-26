import React from 'react';
import { Search, SlidersHorizontal, Star, Heart, X, RotateCcw } from 'lucide-react';

const GENRE_LIST = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

export const MovieFilters = ({ filters, onFilterChange, onReset }) => {
  const handleTextChange = (e) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleStatusChange = (status) => {
    onFilterChange({
      ...filters,
      status: filters.status === status ? '' : status,
      page: 1,
    });
  };

  const handleFavoriteToggle = () => {
    onFilterChange({
      ...filters,
      favorite: filters.favorite === 'true' ? '' : 'true',
      page: 1,
    });
  };

  const isFiltered =
    filters.search ||
    filters.status ||
    filters.genre ||
    filters.minPersonalRating ||
    filters.maxRuntime ||
    filters.year ||
    filters.favorite === 'true';

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Top Search & Reset Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            name="search"
            placeholder="Search titles, directors, cast, tags..."
            value={filters.search || ''}
            onChange={handleTextChange}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-400"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Favorite toggle */}
        <button
          type="button"
          onClick={handleFavoriteToggle}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all shrink-0 ${
            filters.favorite === 'true'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10'
              : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${filters.favorite === 'true' ? 'fill-rose-400 text-rose-400' : ''}`}
          />
          <span>Favorites Only</span>
        </button>

        {/* Reset Filters button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { label: 'All Library', val: '' },
          { label: 'Watched', val: 'WATCHED' },
          { label: 'Watchlist', val: 'WATCHLIST' },
          { label: 'Watching', val: 'WATCHING' },
          { label: 'Unwatched', val: 'UNWATCHED' },
        ].map((tab) => {
          const isActive = (filters.status || '') === tab.val;
          return (
            <button
              key={tab.val}
              onClick={() => handleStatusChange(tab.val)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-500 text-black font-bold shadow-md shadow-brand-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Inputs: Genre, Rating, Runtime, Sorting */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-800/80">
        {/* Genre Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Genre
          </label>
          <select
            name="genre"
            value={filters.genre || ''}
            onChange={handleTextChange}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
          >
            <option value="">All Genres</option>
            {GENRE_LIST.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Min Personal Rating */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Personal Rating
          </label>
          <select
            name="minPersonalRating"
            value={filters.minPersonalRating || ''}
            onChange={handleTextChange}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
          >
            <option value="">Any Rating</option>
            <option value="9">9+ ★ Masterpiece</option>
            <option value="8">8+ ★ Highly Rated</option>
            <option value="7">7+ ★ Good</option>
            <option value="5">5+ ★ Average</option>
          </select>
        </div>

        {/* Max Runtime */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Max Duration
          </label>
          <select
            name="maxRuntime"
            value={filters.maxRuntime || ''}
            onChange={handleTextChange}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
          >
            <option value="">Any Runtime</option>
            <option value="90">Under 90 mins</option>
            <option value="120">Under 2 hours</option>
            <option value="150">Under 2.5 hours</option>
            <option value="180">Under 3 hours</option>
          </select>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Sort By
          </label>
          <select
            name="sort"
            value={filters.sort || 'createdAt'}
            onChange={handleTextChange}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
          >
            <option value="createdAt">Recently Added</option>
            <option value="personalRating">Personal Rating (High to Low)</option>
            <option value="rating">External TMDB Rating</option>
            <option value="title">Title (A - Z)</option>
            <option value="releaseYear">Release Year</option>
            <option value="runtime">Duration / Runtime</option>
          </select>
        </div>
      </div>
    </div>
  );
};
