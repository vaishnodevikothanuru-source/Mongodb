import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Bookmark, Check, Plus, Star, Sparkles, Info } from 'lucide-react';
import { recommendationsApi } from '../../api/recommendationsApi';
import { moviesApi } from '../../api/moviesApi';
import { useToast } from '../../context/ToastContext';
import { formatRuntime, getGenreColor, triggerConfetti } from '../../utils/helpers';

export const RecommendationCard = ({ recommendation, onActionSuccess }) => {
  const { movie, score, explanation, isExistingLibrary } = recommendation;
  const toast = useToast();
  const [feedbackSent, setFeedbackSent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (action) => {
    try {
      setFeedbackSent(action);
      await recommendationsApi.sendFeedback({
        tmdbId: movie.tmdbId,
        movieId: movie._id,
        movieTitle: movie.title,
        action,
      });

      if (action === 'like') toast.success(`Liked! Your recommendations will reflect this taste.`);
      if (action === 'dislike') toast.info(`Dismissed. We'll tune your feed.`);
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      toast.error('Failed to submit feedback');
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      setLoading(true);
      if (isExistingLibrary) {
        await moviesApi.updateStatus(movie._id, 'WATCHLIST');
      } else {
        await moviesApi.createMovie({
          ...movie,
          status: 'WATCHLIST',
          watchlist: true,
          watchlistPriority: 'High',
          externalIds: { tmdbId: movie.tmdbId, imdbId: movie.imdbId },
        });
      }
      handleFeedback('added_watchlist');
      toast.success(`"${movie.title}" added to your Watchlist!`);
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkWatched = async () => {
    try {
      setLoading(true);
      if (isExistingLibrary) {
        await moviesApi.updateStatus(movie._id, 'WATCHED');
      } else {
        await moviesApi.createMovie({
          ...movie,
          status: 'WATCHED',
          watchedAt: new Date(),
          externalIds: { tmdbId: movie.tmdbId, imdbId: movie.imdbId },
        });
      }
      triggerConfetti();
      handleFeedback('marked_watched');
      toast.success(`"${movie.title}" marked as watched!`);
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (feedbackSent === 'dislike' || feedbackSent === 'hide') {
    return null; // hide card instantly
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800/90 group">
      <div>
        {/* Poster Media Box */}
        <div className="relative aspect-[16/9] sm:aspect-[2/3] w-full overflow-hidden bg-slate-900">
          <img
            src={movie.posterUrl || movie.backdropUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Recommendation Match Score Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-brand-500/50 text-brand-400 font-display font-bold text-xs shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>{score}% Match</span>
          </div>

          {/* Rating */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-slate-700 text-slate-300 text-xs font-semibold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{movie.rating || 7.5}</span>
          </div>

          {/* Quick action buttons on poster hover */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
            <button
              onClick={() => handleFeedback('like')}
              className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                feedbackSent === 'like'
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-black/60 border-slate-700 text-slate-300 hover:text-emerald-400'
              }`}
              title="I like this recommendation"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleFeedback('dislike')}
              className="p-1.5 rounded-full bg-black/60 border border-slate-700 text-slate-300 hover:text-rose-400 backdrop-blur-md transition-all"
              title="Not interested"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-4 space-y-2.5">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white hover:text-brand-400 line-clamp-1 transition-colors">
              {movie.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {movie.releaseYear || (movie.releaseDate ? movie.releaseDate.split('-')[0] : 'N/A')} • {formatRuntime(movie.runtime)}
              {movie.director && ` • Dir. ${movie.director}`}
            </p>
          </div>

          {/* Explanation Box */}
          {explanation && (
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-brand-500/20 text-xs text-brand-300/90 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
              <p className="line-clamp-2 leading-relaxed">{explanation}</p>
            </div>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-1">
            {(movie.genres || []).slice(0, 3).map((g) => (
              <span
                key={g}
                className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${getGenreColor(g)}`}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={handleAddToWatchlist}
          disabled={loading}
          className="py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>+ Watchlist</span>
        </button>

        <button
          onClick={handleMarkWatched}
          disabled={loading}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Watched</span>
        </button>
      </div>
    </div>
  );
};
