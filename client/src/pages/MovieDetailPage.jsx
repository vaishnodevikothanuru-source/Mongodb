import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { moviesApi } from '../api/moviesApi';
import { recommendationsApi } from '../api/recommendationsApi';
import { RatingStars } from '../components/common/RatingStars';
import { StatusBadge } from '../components/common/StatusBadge';
import { AddToCollectionModal } from '../components/movies/AddToCollectionModal';
import { useToast } from '../context/ToastContext';
import { formatRuntime, formatDate, getGenreColor, triggerConfetti } from '../utils/helpers';
import {
  Star,
  Heart,
  Bookmark,
  Check,
  Calendar,
  Clock,
  Globe,
  Film,
  User,
  Quote,
  Trash2,
  Edit3,
  Sparkles,
  ArrowLeft,
  FolderHeart,
  History,
  CheckCircle2,
} from 'lucide-react';

export const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [movie, setMovie] = useState(null);
  const [collections, setCollections] = useState([]);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit review state
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [notes, setNotes] = useState('');
  const [review, setReview] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [prosText, setProsText] = useState('');
  const [consText, setConsText] = useState('');

  // Collection modal
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await moviesApi.getMovieById(id);
      if (res.success) {
        const m = res.data.movie;
        setMovie(m);
        setCollections(res.data.collections || []);
        setHistoryEntries(res.data.historyEntries || []);

        setNotes(m.notes || '');
        setReview(m.review || '');
        setFavoriteQuote(m.favoriteQuote || '');
        setProsText((m.pros || []).join(', '));
        setConsText((m.cons || []).join(', '));

        // Fetch similar movies
        const simRes = await recommendationsApi.getSimilar({
          title: m.title,
          genres: (m.genres || []).join(','),
          director: m.director,
        });
        if (simRes.success) setSimilarMovies(simRes.data);
      }
    } catch (err) {
      toast.error('Movie could not be found');
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await moviesApi.updateStatus(movie._id, newStatus);
      if (res.success) {
        if (newStatus === 'WATCHED') triggerConfetti();
        toast.success(`Status updated to ${newStatus}`);
        setMovie(res.data);
        fetchDetails();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await moviesApi.toggleFavorite(movie._id);
      if (res.success) {
        toast.success(res.message);
        setMovie(res.data);
      }
    } catch (err) {
      toast.error('Failed to update favorite');
    }
  };

  const handleRatingChange = async (newRating) => {
    try {
      const res = await moviesApi.updateRating(movie._id, newRating);
      if (res.success) {
        if (newRating >= 9) triggerConfetti();
        toast.success('Rating updated in MongoDB');
        setMovie(res.data);
      }
    } catch (err) {
      toast.error('Failed to update rating');
    }
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    try {
      const prosArray = prosText.split(',').map((s) => s.trim()).filter(Boolean);
      const consArray = consText.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await moviesApi.updateReview(movie._id, {
        notes,
        review,
        favoriteQuote,
        pros: prosArray,
        cons: consArray,
      });

      if (res.success) {
        toast.success('Review & notes saved');
        setMovie(res.data);
        setIsEditingReview(false);
      }
    } catch (err) {
      toast.error('Failed to save review');
    }
  };

  const handleDeleteMovie = async () => {
    if (window.confirm(`Are you sure you want to remove "${movie.title}" from your library?`)) {
      try {
        await moviesApi.deleteMovie(movie._id);
        toast.success('Movie deleted from library');
        navigate('/library');
      } catch (err) {
        toast.error('Failed to delete movie');
      }
    }
  };

  if (loading || !movie) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-96 rounded-3xl bg-slate-800/40 animate-pulse" />
        <div className="h-32 rounded-2xl bg-slate-800/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to previous page</span>
      </button>

      {/* Cinematic Hero Backdrop Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl">
        {/* Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-25 filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/70 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
          {/* Poster Box */}
          <div className="w-48 sm:w-64 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 shrink-0 bg-slate-900 aspect-[2/3]">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Metadata Section */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={movie.status} size="md" />
              {movie.favorite && (
                <span className="px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-400" />
                  <span>Favorite</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight leading-tight">
              {movie.title}
            </h1>

            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-sm text-slate-400 italic">Original title: {movie.originalTitle}</p>
            )}

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>{movie.releaseDate || movie.releaseYear || 'N/A'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>{formatRuntime(movie.runtime)}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{movie.rating ? `${movie.rating}/10 (${movie.voteCount} votes)` : 'No TMDB rating'}</span>
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(movie.genres || []).map((genre) => (
                <span
                  key={genre}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getGenreColor(genre)}`}
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl pt-2">
              {movie.description || 'No description available for this movie.'}
            </p>

            {/* Quick Status Control Bar */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-700">
                {['WATCHLIST', 'WATCHING', 'WATCHED', 'UNWATCHED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      movie.status === st
                        ? 'bg-brand-500 text-black font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'WATCHLIST' ? '+ Watchlist' : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleToggleFavorite}
                className={`p-2.5 rounded-xl border transition-all ${
                  movie.favorite
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-rose-400'
                }`}
                title={movie.favorite ? 'Favorited' : 'Favorite'}
              >
                <Heart className={`w-4 h-4 ${movie.favorite ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={() => setCollectionModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FolderHeart className="w-4 h-4 text-brand-400" />
                <span>Collections ({collections.length})</span>
              </button>

              <button
                onClick={handleDeleteMovie}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-colors ml-auto"
                title="Remove movie from library"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: User Personal Space (Left) & Credits / Technical Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Personal Rating, Review, Quotes, Pros/Cons & Watch History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Rating Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-brand-400 fill-brand-400" />
                <span>Your Personal Rating</span>
              </h2>
              {movie.personalRating && (
                <span className="text-xs text-brand-400 font-bold px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/30">
                  {movie.personalRating} / 10
                </span>
              )}
            </div>
            <RatingStars
              rating={movie.personalRating}
              onChange={handleRatingChange}
              size="lg"
            />
          </div>

          {/* Personal Review & Notes Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-400" />
                <span>Private Review & Notes</span>
              </h2>
              {!isEditingReview && (
                <button
                  onClick={() => setIsEditingReview(true)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                >
                  Edit Review
                </button>
              )}
            </div>

            {isEditingReview ? (
              <form onSubmit={handleSaveReview} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Your Review
                  </label>
                  <textarea
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write your private impressions..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Favorite Quote
                  </label>
                  <input
                    type="text"
                    value={favoriteQuote}
                    onChange={(e) => setFavoriteQuote(e.target.value)}
                    placeholder="Memorable quote from film..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
                  />
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingReview(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold"
                  >
                    Save Review
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {movie.review ? (
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    "{movie.review}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">No private review logged yet.</p>
                )}

                {movie.favoriteQuote && (
                  <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-start gap-2.5">
                    <Quote className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <p className="text-xs italic text-brand-300">"{movie.favoriteQuote}"</p>
                  </div>
                )}

                {(movie.pros?.length > 0 || movie.cons?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {movie.pros?.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Pros</span>
                        <ul className="text-xs text-emerald-200/90 list-disc list-inside space-y-0.5">
                          {movie.pros.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {movie.cons?.length > 0 && (
                      <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1.5">
                        <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Cons</span>
                        <ul className="text-xs text-rose-200/90 list-disc list-inside space-y-0.5">
                          {movie.cons.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Watch History Log for this Movie */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-brand-400" />
              <span>Watch History ({historyEntries.length} log entries • Watched {movie.timesWatched || 0} times)</span>
            </h2>
            {historyEntries.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No watch sessions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {historyEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300 font-medium">
                      {formatDate(entry.watchedAt)}
                    </span>
                    {entry.personalRating && (
                      <span className="text-brand-400 font-bold">
                        Rated: {entry.personalRating}/10
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Cast, Director, Technical Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white">Credits & Production</h2>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Director</p>
                <p className="text-slate-200 font-semibold text-sm mt-0.5">{movie.director || 'Unknown'}</p>
              </div>

              {movie.cast?.length > 0 && (
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">Top Cast</p>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.cast.map((actor) => (
                      <span
                        key={actor}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.languages?.length > 0 && (
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Languages</p>
                  <p className="text-slate-200 mt-0.5">{movie.languages.join(', ')}</p>
                </div>
              )}

              {movie.country && (
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Country</p>
                  <p className="text-slate-200 mt-0.5">{movie.country}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies Carousel */}
      {similarMovies.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold font-display text-white">Similar Movies You Might Like</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {similarMovies.slice(0, 6).map((sim) => (
              <div key={sim._id} className="glass-card rounded-xl overflow-hidden p-2 space-y-2">
                <img
                  src={sim.posterUrl}
                  alt={sim.title}
                  className="w-full aspect-[2/3] object-cover rounded-lg"
                />
                <p className="font-semibold text-xs text-slate-100 line-clamp-1">{sim.title}</p>
                <p className="text-[10px] text-slate-400">{sim.releaseYear} • {sim.rating} ★</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add To Collection Modal */}
      <AddToCollectionModal
        movie={movie}
        isOpen={collectionModalOpen}
        onClose={() => {
          setCollectionModalOpen(false);
          fetchDetails();
        }}
      />
    </div>
  );
};
