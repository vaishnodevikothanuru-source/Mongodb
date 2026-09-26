const Movie = require('../models/Movie');
const WatchHistory = require('../models/WatchHistory');
const Collection = require('../models/Collection');

// @desc    Get complete personal statistics & analytics from MongoDB
// @route   GET /api/statistics
// @access  Private
const getStatistics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [userMovies, historyList, collectionsCount] = await Promise.all([
      Movie.find({ userId }),
      WatchHistory.find({ userId }),
      Collection.countDocuments({ userId }),
    ]);

    // Totals
    const totalMovies = userMovies.length;
    let watchedCount = 0;
    let unwatchedCount = 0;
    let watchlistCount = 0;
    let favoritesCount = 0;
    let totalWatchTimeMinutes = 0;
    let ratedSum = 0;
    let ratedCount = 0;
    let totalRuntime = 0;

    const genreCounts = {};
    const ratingDistribution = {
      '1-2': 0,
      '3-4': 0,
      '5-6': 0,
      '7-8': 0,
      '9-10': 0,
    };

    userMovies.forEach((movie) => {
      if (movie.status === 'WATCHED') {
        watchedCount++;
        totalWatchTimeMinutes += (movie.runtime || 120) * (movie.timesWatched || 1);
      } else if (movie.status === 'WATCHLIST' || movie.watchlist) {
        watchlistCount++;
      } else {
        unwatchedCount++;
      }

      if (movie.favorite) favoritesCount++;

      if (movie.runtime) {
        totalRuntime += movie.runtime;
      }

      if (movie.personalRating) {
        ratedSum += movie.personalRating;
        ratedCount++;
        const r = movie.personalRating;
        if (r <= 2) ratingDistribution['1-2']++;
        else if (r <= 4) ratingDistribution['3-4']++;
        else if (r <= 6) ratingDistribution['5-6']++;
        else if (r <= 8) ratingDistribution['7-8']++;
        else ratingDistribution['9-10']++;
      }

      (movie.genres || []).forEach((g) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    // Top genres percentage
    const genreArray = Object.keys(genreCounts).map((genre) => ({
      genre,
      count: genreCounts[genre],
      percentage: totalMovies > 0 ? Math.round((genreCounts[genre] / totalMovies) * 100) : 0,
    }));
    genreArray.sort((a, b) => b.count - a.count);

    // Monthly viewing trends (last 6-12 months)
    const monthlyTrends = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Seed last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyTrends[key] = 0;
    }

    historyList.forEach((h) => {
      const d = new Date(h.watchedAt || h.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyTrends[key] !== undefined) {
        monthlyTrends[key]++;
      } else {
        monthlyTrends[key] = 1;
      }
    });

    const monthlyData = Object.keys(monthlyTrends).map((month) => ({
      month,
      moviesWatched: monthlyTrends[month],
    }));

    const totalWatchHours = Math.round(totalWatchTimeMinutes / 60);
    const averageRating = ratedCount > 0 ? (ratedSum / ratedCount).toFixed(1) : 'N/A';
    const averageRuntime = totalMovies > 0 ? Math.round(totalRuntime / totalMovies) : 120;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalMovies,
          watchedCount,
          unwatchedCount,
          watchlistCount,
          favoritesCount,
          collectionsCount,
          totalWatchHours,
          totalWatchMinutes: totalWatchTimeMinutes,
          averageRating,
          averageRuntime,
        },
        genreBreakdown: genreArray.slice(0, 8),
        ratingDistribution,
        monthlyTrends: monthlyData,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatistics,
};
