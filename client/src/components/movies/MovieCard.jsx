import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Bookmark, Play, Check, Eye, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { formatRuntime, getGenreColor, triggerConfetti } from '../../utils/helpers';
import { moviesApi } from '../../api/moviesApi';
import { useToast } from '../../context/ToastContext';

export const MovieCard = ({ movie, onMovieUpdated, onOpenQuickModal, onOpenCollectionModal }) => {
  const toast = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isFav, setIsFav] = useState(movie.favorite);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsFav(!isFav);
      const res = await moviesApi.toggleFavorite(movie._id);
      if (res.success) {
        toast.success(res.message);
        if (onMovieUpdated) onMovieUpdated(res.data);
      }
    } catch (err) {
      setIsFav(isFav); // revert
      toast.error('Failed to update favorite status');
    }
  };

  const handleQuickStatus = async (e, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoadingAction(true);
      const res = await moviesApi.updateStatus(movie._id, newStatus);
      if (res.success) {
        if (newStatus === 'WATCHED') triggerConfetti();
        toast.success(res.message);
        if (onMovieUpdated) onMovieUpdated(res.data);
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div
      className="group relative glass-card rounded-xl overflow-hidden flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Media Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges (Favorite & Personal Rating) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          {movie.personalRating !== null && movie.personalRating !== undefined ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-brand-500/40 text-brand-400 text-xs font-bold shadow-lg">
              <Star className="w-3 h-3 fill-brand-400 text-brand-400" />
              <span>{movie.personalRating}</span>
            </div>
          ) : movie.rating ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-slate-700 text-slate-300 text-xs font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{movie.rating}</span>
            </div>
          ) : <div />}

          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
              isFav
                ? 'bg-rose-500/30 border-rose-500/60 text-rose-400'
                : 'bg-black/60 border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-400/40'
            }`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Status Pill on Bottom of Poster */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <StatusBadge status={movie.status || 'UNWATCHED'} />
        </div>

        {/* Hover Quick Action Layer */}
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-3 transition-opacity duration-200 z-20 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Link
            to={`/movies/${movie._id}`}
            className="w-full py-2 px-3 rounded-lg bg-brand-500 hover:bg-brand-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Full Details</span>
          </Link>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenQuickModal && onOpenQuickModal(movie);
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
            <span>Edit Status & Review</span>
          </button>

          {movie.status !== 'WATCHED' ? (
            <button
              onClick={(e) => handleQuickStatus(e, 'WATCHED')}
              disabled={loadingAction}
              className="w-full py-1.5 px-3 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Watched</span>
            </button>
          ) : (
            <button
              onClick={(e) => handleQuickStatus(e, 'WATCHLIST')}
              disabled={loadingAction}
              className="w-full py-1.5 px-3 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Add to Watchlist</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
        <div>
          <Link to={`/movies/${movie._id}`}>
            <h3 className="font-semibold text-sm text-slate-100 hover:text-brand-400 line-clamp-1 transition-colors">
              {movie.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span>{movie.releaseYear || (movie.releaseDate ? movie.releaseDate.split('-')[0] : 'N/A')}</span>
            <span>•</span>
            <span>{formatRuntime(movie.runtime)}</span>
            {movie.director && movie.director !== 'Unknown Director' && (
              <>
                <span>•</span>
                <span className="truncate max-w-[80px]">{movie.director}</span>
              </>
            )}
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 pt-1">
          {(movie.genres || []).slice(0, 2).map((genre) => (
            <span
              key={genre}
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${getGenreColor(
                genre
              )}`}
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
