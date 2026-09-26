const Movie = require('../models/Movie');
const WatchHistory = require('../models/WatchHistory');
const UserPreference = require('../models/UserPreference');
const RecommendationFeedback = require('../models/RecommendationFeedback');
const GlobalMovieCatalog = require('../models/GlobalMovieCatalog');

class RecommendationService {
  /**
   * Main recommendation engine entry point
   * Computes personalized scores and builds categorized recommendation lists
   */
  async getPersonalizedRecommendations(userId) {
    // 1. Fetch user's persistent data from MongoDB
    const [userMovies, preferences, watchHistory, feedbackList, allCatalogMovies] = await Promise.all([
      Movie.find({ userId }),
      UserPreference.findOne({ userId }),
      WatchHistory.find({ userId }).sort({ watchedAt: -1 }).limit(30),
      RecommendationFeedback.find({ userId }),
      GlobalMovieCatalog.find({}),
    ]);

    // 2. Build exclusion set (already in library, in watchlist, or disliked/hidden)
    const libraryTmdbIds = new Set();
    const libraryTitles = new Set();
    const dislikedTmdbIds = new Set();

    userMovies.forEach((m) => {
      if (m.externalIds?.tmdbId) libraryTmdbIds.add(m.externalIds.tmdbId);
      if (m.title) libraryTitles.add(m.title.toLowerCase().trim());
    });

    feedbackList.forEach((fb) => {
      if (['dislike', 'hide'].includes(fb.action) && fb.tmdbId) {
        dislikedTmdbIds.add(fb.tmdbId);
      }
    });

    // 3. Extract user tastes from MongoDB
    const genreFrequency = {};
    const genreTotalScore = {};
    const directorCounts = {};
    const actorCounts = {};
    let totalWatchedRuntime = 0;
    let watchedCount = 0;

    userMovies.forEach((movie) => {
      const isHighRated = movie.personalRating && movie.personalRating >= 7.5;
      const isFavorite = movie.favorite;
      const weight = isFavorite ? 3 : isHighRated ? 2 : 1;

      // Genres
      (movie.genres || []).forEach((g) => {
        genreFrequency[g] = (genreFrequency[g] || 0) + weight;
        if (movie.personalRating) {
          genreTotalScore[g] = (genreTotalScore[g] || 0) + movie.personalRating;
        }
      });

      // Directors
      if (movie.director && movie.director !== 'Unknown Director') {
        directorCounts[movie.director] = (directorCounts[movie.director] || 0) + weight;
      }

      // Actors
      (movie.cast || []).slice(0, 5).forEach((actor) => {
        actorCounts[actor] = (actorCounts[actor] || 0) + weight;
      });

      if (movie.status === 'WATCHED') {
        watchedCount++;
        totalWatchedRuntime += movie.runtime || 120;
      }
    });

    // Merge in explicit user preferences
    const prefGenres = preferences?.favoriteGenres || [];
    const prefActors = preferences?.favoriteActors || [];
    const prefDirectors = preferences?.favoriteDirectors || [];
    const prefMinRating = preferences?.minimumRating || 7.0;
    const prefRuntimeMin = preferences?.preferredRuntimeMin || 80;
    const prefRuntimeMax = preferences?.preferredRuntimeMax || 180;
    const prefLanguages = preferences?.preferredLanguages || ['English'];

    prefGenres.forEach((g) => {
      genreFrequency[g] = (genreFrequency[g] || 0) + 4;
    });
    prefDirectors.forEach((d) => {
      directorCounts[d] = (directorCounts[d] || 0) + 4;
    });
    prefActors.forEach((a) => {
      actorCounts[a] = (actorCounts[a] || 0) + 4;
    });

    // Sort user's top preferences
    const topGenres = Object.keys(genreFrequency).sort((a, b) => genreFrequency[b] - genreFrequency[a]);
    const topDirectors = Object.keys(directorCounts).sort((a, b) => directorCounts[b] - directorCounts[a]);
    const topActors = Object.keys(actorCounts).sort((a, b) => actorCounts[b] - actorCounts[a]);

    // Highly rated movies for "Because you liked"
    const highlyRatedUserMovies = userMovies
      .filter((m) => m.personalRating && m.personalRating >= 8.0)
      .sort((a, b) => b.personalRating - a.personalRating);

    // Watchlist movies for "Based on your watchlist"
    const watchlistMovies = userMovies.filter((m) => m.watchlist || m.status === 'WATCHLIST');

    // 4. Candidate Scoring Algorithm
    const scoredCandidates = [];

    for (const candidate of allCatalogMovies) {
      // Exclude if already in library or disliked
      if (libraryTmdbIds.has(candidate.tmdbId) || libraryTitles.has(candidate.title.toLowerCase().trim())) {
        continue;
      }
      if (dislikedTmdbIds.has(candidate.tmdbId)) {
        continue;
      }

      // --- Component 1: Genre Match (Weight: 30%) ---
      let genreMatches = 0;
      const matchedGenres = [];
      (candidate.genres || []).forEach((g) => {
        if (genreFrequency[g]) {
          genreMatches += genreFrequency[g];
          matchedGenres.push(g);
        }
      });
      const maxGenrePoints = Math.max(...Object.values(genreFrequency), 1) * 3;
      const genreScore = Math.min(1.0, (genreMatches / maxGenrePoints) || 0) * 30;

      // --- Component 2: Director Match (Weight: 15%) ---
      let directorScore = 0;
      let matchedDirector = null;
      if (candidate.director && directorCounts[candidate.director]) {
        directorScore = 15;
        matchedDirector = candidate.director;
      }

      // --- Component 3: Actor Match (Weight: 15%) ---
      const matchedActors = [];
      (candidate.cast || []).forEach((actor) => {
        if (actorCounts[actor]) {
          matchedActors.push(actor);
        }
      });
      const actorScore = Math.min(1.0, matchedActors.length / 2) * 15;

      // --- Component 4: Rating Compatibility (Weight: 15%) ---
      // Higher base rating and compatibility with minimum rating preference
      const candRating = candidate.rating || 7.0;
      let ratingScore = (candRating / 10) * 15;
      if (candRating < prefMinRating) {
        ratingScore *= 0.5;
      }

      // --- Component 5: Watch History & Watchlist Similarity (Weight: 20%) ---
      let historySimilarity = 0;
      if (watchHistory.length > 0) {
        const lastWatchedGenres = new Set(watchHistory.slice(0, 5).flatMap((h) => h.genres || []));
        const overlap = (candidate.genres || []).filter((g) => lastWatchedGenres.has(g));
        historySimilarity = (overlap.length / Math.max((candidate.genres || []).length, 1)) * 10;
      } else {
        historySimilarity = 5;
      }

      let watchlistSimilarity = 0;
      if (watchlistMovies.length > 0) {
        const wlGenres = new Set(watchlistMovies.flatMap((m) => m.genres || []));
        const wlOverlap = (candidate.genres || []).filter((g) => wlGenres.has(g));
        watchlistSimilarity = (wlOverlap.length / Math.max((candidate.genres || []).length, 1)) * 10;
      } else {
        watchlistSimilarity = 5;
      }

      // --- Component 6: Runtime & Language Compatibility (Weight: 5%) ---
      let prefScore = 5;
      if (candidate.runtime && (candidate.runtime < prefRuntimeMin || candidate.runtime > prefRuntimeMax)) {
        prefScore -= 2;
      }
      const hasLanguage = (candidate.languages || []).some((l) => prefLanguages.includes(l));
      if (!hasLanguage && (candidate.languages || []).length > 0) {
        prefScore -= 1;
      }
      prefScore = Math.max(0, prefScore);

      // Total Final Recommendation Score (0 - 100)
      const totalScore = Math.round(
        genreScore + directorScore + actorScore + ratingScore + historySimilarity + watchlistSimilarity + prefScore
      );

      // Construct Transparent Explanation String
      const explanationParts = [];
      if (matchedDirector) {
        explanationParts.push(`Directed by ${matchedDirector}`);
      }
      if (matchedActors.length > 0) {
        explanationParts.push(`Features ${matchedActors.slice(0, 2).join(' & ')}`);
      }
      if (matchedGenres.length > 0) {
        explanationParts.push(`Matches your affinity for ${matchedGenres.slice(0, 2).join(' & ')}`);
      }
      if (candRating >= 8.0) {
        explanationParts.push(`Critically acclaimed (${candRating}/10)`);
      }

      const explanation =
        explanationParts.length > 0
          ? `Recommended because: ${explanationParts.join(' • ')}`
          : `High compatibility with your movie preferences`;

      scoredCandidates.push({
        movie: candidate,
        score: Math.min(99, Math.max(45, totalScore)),
        matchedGenres,
        matchedDirector,
        matchedActors,
        explanation,
      });
    }

    // Sort by descending score
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 5. Build Dynamic Recommendation Categories
    const recommendedForYou = scoredCandidates.slice(0, 12);

    // "Because You Watched [X]"
    let becauseYouWatched = null;
    if (watchHistory.length > 0) {
      const anchorHistory = watchHistory[0];
      const anchorGenres = new Set(anchorHistory.genres || []);
      const matched = scoredCandidates
        .filter((c) => (c.movie.genres || []).some((g) => anchorGenres.has(g)))
        .slice(0, 8)
        .map((c) => ({
          ...c,
          categoryExplanation: `Because you watched "${anchorHistory.movieTitle}"`,
        }));

      becauseYouWatched = {
        anchorMovie: anchorHistory.movieTitle,
        items: matched,
      };
    }

    // "Because You Liked [X]"
    let becauseYouLiked = null;
    if (highlyRatedUserMovies.length > 0) {
      const anchorMovie = highlyRatedUserMovies[0];
      const anchorGenres = new Set(anchorMovie.genres || []);
      const matched = scoredCandidates
        .filter(
          (c) =>
            (c.movie.genres || []).some((g) => anchorGenres.has(g)) ||
            (anchorMovie.director && c.movie.director === anchorMovie.director)
        )
        .slice(0, 8)
        .map((c) => ({
          ...c,
          categoryExplanation: `Because you rated "${anchorMovie.title}" ${anchorMovie.personalRating}/10`,
        }));

      becauseYouLiked = {
        anchorMovie: anchorMovie.title,
        rating: anchorMovie.personalRating,
        items: matched,
      };
    }

    // "Based on Your Watchlist"
    let basedOnWatchlist = null;
    if (watchlistMovies.length > 0) {
      const wlGenres = new Set(watchlistMovies.flatMap((m) => m.genres || []));
      const matched = scoredCandidates
        .filter((c) => (c.movie.genres || []).some((g) => wlGenres.has(g)))
        .slice(0, 8)
        .map((c) => ({
          ...c,
          categoryExplanation: `Similar to titles in your Watchlist`,
        }));

      basedOnWatchlist = {
        watchlistCount: watchlistMovies.length,
        items: matched,
      };
    }

    // "Hidden Gems"
    const hiddenGems = scoredCandidates
      .filter((c) => c.movie.category === 'hidden_gem' || (c.movie.rating >= 7.8 && c.movie.voteCount < 1500))
      .slice(0, 8)
      .map((c) => ({
        ...c,
        categoryExplanation: `Lesser-known high-rated gem matching your taste`,
      }));

    // "More From Your Favorite Directors"
    let directorSpotlight = null;
    if (topDirectors.length > 0) {
      const targetDirector = topDirectors[0];
      const matched = scoredCandidates
        .filter((c) => c.movie.director && c.movie.director.toLowerCase() === targetDirector.toLowerCase())
        .slice(0, 8)
        .map((c) => ({
          ...c,
          categoryExplanation: `Directed by ${targetDirector}`,
        }));

      directorSpotlight = {
        director: targetDirector,
        items: matched,
      };
    }

    // "More From Your Favorite Actors"
    let actorSpotlight = null;
    if (topActors.length > 0) {
      const targetActor = topActors[0];
      const matched = scoredCandidates
        .filter((c) => (c.movie.cast || []).some((act) => act.toLowerCase() === targetActor.toLowerCase()))
        .slice(0, 8)
        .map((c) => ({
          ...c,
          categoryExplanation: `Starring ${targetActor}`,
        }));

      actorSpotlight = {
        actor: targetActor,
        items: matched,
      };
    }

    // "Rewatch Suggestions" (From user's own library!)
    const rewatchSuggestions = userMovies
      .filter(
        (m) =>
          m.status === 'WATCHED' &&
          (m.favorite || (m.personalRating && m.personalRating >= 8.5) || m.rewatchRecommendation)
      )
      .slice(0, 6)
      .map((m) => ({
        movie: m,
        score: 95,
        explanation: `You rated this ${m.personalRating || 9}/10! Perfect time to revisit.`,
        isExistingLibrary: true,
      }));

    return {
      recommendedForYou,
      becauseYouWatched,
      becauseYouLiked,
      basedOnWatchlist,
      hiddenGems,
      directorSpotlight,
      actorSpotlight,
      rewatchSuggestions,
      userTasteSummary: {
        topGenres: topGenres.slice(0, 5),
        topDirectors: topDirectors.slice(0, 3),
        topActors: topActors.slice(0, 4),
        totalAnalyzedMovies: userMovies.length,
        avgWatchRuntime: watchedCount > 0 ? Math.round(totalWatchedRuntime / watchedCount) : 120,
      },
    };
  }

  /**
   * Get similar movies for a specific movie details page
   */
  async getSimilarMovies(movieTitle, genres = [], director = null) {
    const query = {
      $or: [
        { genres: { $in: genres } },
        ...(director && director !== 'Unknown Director' ? [{ director }] : []),
      ],
      title: { $ne: movieTitle },
    };

    const similar = await GlobalMovieCatalog.find(query).sort({ rating: -1 }).limit(10);
    return similar;
  }
}

module.exports = new RecommendationService();
