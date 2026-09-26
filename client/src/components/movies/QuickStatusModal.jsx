import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { RatingStars } from '../common/RatingStars';
import { moviesApi } from '../../api/moviesApi';
import { useToast } from '../../context/ToastContext';
import { triggerConfetti } from '../../utils/helpers';
import { Check, Star, Bookmark, Clock, Eye, Trash2, Plus, Quote } from 'lucide-react';

export const QuickStatusModal = ({ movie, isOpen, onClose, onMovieUpdated }) => {
  const toast = useToast();
  const [status, setStatus] = useState('UNWATCHED');
  const [personalRating, setPersonalRating] = useState(null);
  const [watchlistPriority, setWatchlistPriority] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [review, setReview] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [prosText, setProsText] = useState('');
  const [consText, setConsText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (movie) {
      setStatus(movie.status || 'UNWATCHED');
      setPersonalRating(movie.personalRating || null);
      setWatchlistPriority(movie.watchlistPriority || 'Medium');
      setNotes(movie.notes || '');
      setReview(movie.review || '');
      setFavoriteQuote(movie.favoriteQuote || '');
      setProsText((movie.pros || []).join(', '));
      setConsText((movie.cons || []).join(', '));
    }
  }, [movie]);

  if (!movie) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // 1. Update status
      if (status !== movie.status) {
        await moviesApi.updateStatus(movie._id, status);
        if (status === 'WATCHED') triggerConfetti();
      }

      // 2. Update rating
      if (personalRating !== movie.personalRating) {
        await moviesApi.updateRating(movie._id, personalRating);
        if (personalRating >= 9) triggerConfetti();
      }

      // 3. Update notes and reviews
      const prosArray = prosText.split(',').map((s) => s.trim()).filter(Boolean);
      const consArray = consText.split(',').map((s) => s.trim()).filter(Boolean);

      const reviewRes = await moviesApi.updateReview(movie._id, {
        notes,
        review,
        favoriteQuote,
        pros: prosArray,
        cons: consArray,
      });

      // 4. Update basic movie fields like watchlistPriority
      const updateRes = await moviesApi.updateMovie(movie._id, {
        watchlistPriority,
      });

      toast.success('Movie details saved in MongoDB!');
      if (onMovieUpdated) {
        onMovieUpdated({
          ...movie,
          status,
          personalRating,
          watchlistPriority,
          notes,
          review,
          favoriteQuote,
          pros: prosArray,
          cons: consArray,
        });
      }
      onClose();
    } catch (err) {
      toast.error('Failed to update movie details');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'WATCHLIST', label: 'Watchlist', icon: Bookmark, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
    { value: 'WATCHING', label: 'Watching', icon: Clock, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { value: 'WATCHED', label: 'Watched', icon: Check, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { value: 'UNWATCHED', label: 'Unwatched', icon: Eye, color: 'text-slate-400 border-slate-600 bg-slate-800' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage: ${movie.title}`} maxWidth="max-w-xl">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Status Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Watch Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statusOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? `${opt.color} ring-2 ring-brand-400/50 shadow-lg`
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Watchlist Priority (Only shown if status is WATCHLIST) */}
        {status === 'WATCHLIST' && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Watchlist Priority
            </label>
            <div className="flex gap-2">
              {['High', 'Medium', 'Low'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setWatchlistPriority(p)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    watchlistPriority === p
                      ? p === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : p === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-slate-700 text-slate-200 border-slate-500'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {p} Priority
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Personal Rating */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Personal Rating (1 - 10)
            </label>
            {personalRating && (
              <button
                type="button"
                onClick={() => setPersonalRating(null)}
                className="text-[11px] text-slate-500 hover:text-rose-400"
              >
                Clear Rating
              </button>
            )}
          </div>
          <RatingStars rating={personalRating} onChange={setPersonalRating} size="md" />
        </div>

        {/* Private Review & Quote */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Private Review / Notes
            </label>
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What made this movie standout? Cinematography, soundtrack, plot twists..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Favorite Quote
            </label>
            <div className="relative">
              <Quote className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={favoriteQuote}
                onChange={(e) => setFavoriteQuote(e.target.value)}
                placeholder="Memorable dialogue or line..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Pros (comma separated)
              </label>
              <input
                type="text"
                value={prosText}
                onChange={(e) => setProsText(e.target.value)}
                placeholder="Acting, Score, Visuals..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Cons (comma separated)
              </label>
              <input
                type="text"
                value={consText}
                onChange={(e) => setConsText(e.target.value)}
                placeholder="Pacing, Third act..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-semibold text-sm shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save to Library'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
