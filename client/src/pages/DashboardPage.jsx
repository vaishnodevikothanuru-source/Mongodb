import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moviesApi } from '../api/moviesApi';
import { recommendationsApi } from '../api/recommendationsApi';
import { statsApi } from '../api/statsApi';
import { watchlistApi } from '../api/watchlistApi';
import { MovieCard } from '../components/movies/MovieCard';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { QuickStatusModal } from '../components/movies/QuickStatusModal';
import { AddToCollectionModal } from '../components/movies/AddToCollectionModal';
import { MovieGridSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import {
  Film,
  Bookmark,
  CheckCircle,
  Heart,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PlayCircle,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [recentAdded, setRecentAdded] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [priorityWatchlist, setPriorityWatchlist] = useState([]);

  // Modals state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, moviesRes, recsRes, watchlistRes] = await Promise.all([
        statsApi.getStatistics(),
        moviesApi.getMovies({ limit: 12, sort: 'createdAt', order: 'desc' }),
        recommendationsApi.getRecommendations(),
        watchlistApi.getWatchlist({ limit: 4 }),
      ]);

      if (statsRes.success) setStats(statsRes.data.summary);
      if (moviesRes.success) {
        setRecentAdded(moviesRes.data);
        setContinueWatching(moviesRes.data.filter((m) => m.status === 'WATCHING'));
      }
      if (recsRes.success) setRecommendations(recsRes.data);
      if (watchlistRes.success) setPriorityWatchlist(watchlistRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const openQuickModal = (movie) => {
    setSelectedMovie(movie);
    setQuickModalOpen(true);
  };

  const openCollectionModal = (movie) => {
    setSelectedMovie(movie);
    setCollectionModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 sm:p-8">
        <div className="h-48 rounded-3xl bg-slate-800/40 animate-pulse" />
        <MovieGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-brand-500/20 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Recommendation Engine Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Welcome back, <span className="text-brand-400">{user?.name || 'Film Lover'}</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Your personal movie vault is up to date. You’ve logged{' '}
            <span className="font-bold text-white">{stats?.totalMovies || 0} movies</span> and spent{' '}
            <span className="font-bold text-brand-400">{stats?.totalWatchHours || 0} hours</span>{' '}
            immersed in cinema.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/recommendations"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-sm shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Recommendations</span>
            </Link>
            <Link
              to="/discover"
              className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Film className="w-4 h-4 text-brand-400" />
              <span>Discover & Import</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Library', value: stats?.totalMovies || 0, icon: Film, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Watched', value: stats?.watchedCount || 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Watchlist', value: stats?.watchlistCount || 0, icon: Bookmark, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Favorites', value: stats?.favoritesCount || 0, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Watch Time', value: `${stats?.totalWatchHours || 0} hrs`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="glass-card p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                <p className="text-xl font-bold font-display text-white mt-0.5">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Watching Section (If any movie is currently in 'WATCHING' status) */}
      {continueWatching.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-display text-white">Continue Watching</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {continueWatching.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onMovieUpdated={fetchDashboardData}
                onOpenQuickModal={openQuickModal}
                onOpenCollectionModal={openCollectionModal}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top Personalized Recommendations Carousel */}
      {recommendations?.recommendedForYou?.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-bold font-display text-white">Top Recommendations For You</h2>
            </div>
            <Link
              to="/recommendations"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 group"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.recommendedForYou.slice(0, 4).map((rec, i) => (
              <RecommendationCard
                key={rec.movie.tmdbId || i}
                recommendation={rec}
                onActionSuccess={fetchDashboardData}
              />
            ))}
          </div>
        </section>
      )}

      {/* High Priority Watchlist Grid */}
      {priorityWatchlist.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-display text-white">Watchlist: Up Next</h2>
            </div>
            <Link
              to="/watchlist"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
            >
              <span>Manage Watchlist</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {priorityWatchlist.map((item) => (
              <MovieCard
                key={item._id}
                movie={item.movieId}
                onMovieUpdated={fetchDashboardData}
                onOpenQuickModal={openQuickModal}
                onOpenCollectionModal={openCollectionModal}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Added to Library */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold font-display text-white">Recently Added</h2>
          </div>
          <Link
            to="/library"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 group"
          >
            <span>Explore Full Library</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentAdded.slice(0, 6).map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onMovieUpdated={fetchDashboardData}
              onOpenQuickModal={openQuickModal}
              onOpenCollectionModal={openCollectionModal}
            />
          ))}
        </div>
      </section>

      {/* Quick Status and Collection Modals */}
      <QuickStatusModal
        movie={selectedMovie}
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        onMovieUpdated={fetchDashboardData}
      />
      <AddToCollectionModal
        movie={selectedMovie}
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
      />
    </div>
  );
};
