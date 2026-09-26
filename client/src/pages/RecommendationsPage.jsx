import React, { useState, useEffect } from 'react';
import { recommendationsApi } from '../api/recommendationsApi';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { MovieGridSkeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Flame,
  Award,
  Compass,
  Bookmark,
  RefreshCw,
  Film,
  User,
  Heart,
  Repeat,
} from 'lucide-react';

export const RecommendationsPage = () => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await recommendationsApi.getRecommendations();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 sm:p-8">
        <div className="h-40 rounded-3xl bg-slate-800/40 animate-pulse" />
        <MovieGridSkeleton count={8} />
      </div>
    );
  }

  const taste = data?.userTasteSummary;

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Taste Profile Summary */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Multi-Factor Recommendation Algorithm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              Personalized Movie Recommendations
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Tuned from your MongoDB watch history, ratings, favorite directors, and custom preferences.
            </p>
          </div>

          <button
            onClick={fetchRecommendations}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-400 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
            <span>Recalculate Feed</span>
          </button>
        </div>

        {/* Real User Taste Chips */}
        {taste && (
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Your Top Genres
              </span>
              <p className="text-brand-300 font-semibold mt-0.5">
                {taste.topGenres?.length > 0 ? taste.topGenres.join(', ') : 'Sci-Fi, Action, Thriller'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Favored Directors
              </span>
              <p className="text-white font-semibold mt-0.5">
                {taste.topDirectors?.length > 0 ? taste.topDirectors.join(', ') : 'Christopher Nolan, Denis Villeneuve'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Average Preferred Duration
              </span>
              <p className="text-white font-semibold mt-0.5">{taste.avgWatchRuntime || 120} minutes</p>
            </div>
          </div>
        )}
      </div>

      {/* 1. Recommended For You (Top Overall Match) */}
      {data?.recommendedForYou?.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold font-display text-white">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.recommendedForYou.map((rec, i) => (
              <RecommendationCard
                key={rec.movie.tmdbId || i}
                recommendation={rec}
                onActionSuccess={fetchRecommendations}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Because You Watched... */}
      {data?.becauseYouWatched?.items?.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold font-display text-white">
              Because You Watched "{data.becauseYouWatched.anchorMovie}"
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.becauseYouWatched.items.map((rec, i) => (
              <RecommendationCard
                key={rec.movie.tmdbId || i}
                recommendation={rec}
                onActionSuccess={fetchRecommendations}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Because You Liked... */}
      {data?.becauseYouLiked?.items?.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold font-display text-white">
              Because You Rated "{data.becauseYouLiked.anchorMovie}" {data.becauseYouLiked.rating}/10
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.becauseYouLiked.items.map((rec, i) => (
              <RecommendationCard
                key={rec.movie.tmdbId || i}
                recommendation={rec}
                onActionSuccess={fetchRecommendations}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Based on Your Watchlist */}
      {data?.basedOnWatchlist?.items?.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-display text-white">
              Based On Movies in Your Watchlist
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.basedOnWatchlist.items.map((rec, i) => (
              <RecommendationCard
                key={rec.movie.tmdbId || i}
                recommendation={rec}
                onActionSuccess={fetchRecommendations}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Hidden Gems */}
      {data?.hiddenGems?.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold font-display text-white">
              Hidden Gems Matching Your Taste
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.hiddenGems.map((rec, i) => (
              <RecommendationCard
                key={rec.movie.tmdbId || i}
                recommendation={rec}
                onActionSuccess={fetchRecommendations}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Rewatch Suggestions */}
      {data?.rewatchSuggestions?.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Repeat className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold font-display text-white">
              Rewatch Suggestions (From Your Library)
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.rewatchSuggestions.map((rec, i) => (
              <RecommendationCard
                key={rec.movie._id || i}
                recommendation={rec}
                onActionSuccess={fetchRecommendations}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
