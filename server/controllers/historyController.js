const WatchHistory = require('../models/WatchHistory');
const Movie = require('../models/Movie');

// @desc    Get user's watch history
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, genre, search, startDate, endDate } = req.query;

    const query = { userId };

    if (genre) {
      query.genres = genre;
    }

    if (search) {
      query.movieTitle = new RegExp(search.trim(), 'i');
    }

    if (startDate || endDate) {
      query.watchedAt = {};
      if (startDate) query.watchedAt.$gte = new Date(startDate);
      if (endDate) query.watchedAt.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [history, total] = await Promise.all([
      WatchHistory.find(query).sort({ watchedAt: -1 }).skip(skip).limit(limitNum).populate('movieId'),
      WatchHistory.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add entry to watch history
// @route   POST /api/history
// @access  Private
const addHistoryEntry = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { movieId, watchedAt, personalRating, notes } = req.body;

    const movie = await Movie.findOne({ _id: movieId, userId });
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in library',
        errorCode: 'MOVIE_NOT_FOUND',
      });
    }

    const watchDate = watchedAt ? new Date(watchedAt) : new Date();

    const history = await WatchHistory.create({
      userId,
      movieId: movie._id,
      movieTitle: movie.title,
      posterUrl: movie.posterUrl,
      genres: movie.genres,
      runtime: movie.runtime,
      watchedAt: watchDate,
      personalRating: personalRating !== undefined ? personalRating : movie.personalRating,
      notes: notes || '',
    });

    // Update movie state
    movie.status = 'WATCHED';
    movie.watchedAt = watchDate;
    movie.timesWatched = (movie.timesWatched || 0) + 1;
    if (personalRating !== undefined) movie.personalRating = personalRating;
    await movie.save();

    res.status(201).json({
      success: true,
      message: 'Watch history logged',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete entry from watch history
// @route   DELETE /api/history/:id
// @access  Private
const deleteHistoryEntry = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const history = await WatchHistory.findOneAndDelete({ _id: req.params.id, userId });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Watch history record not found',
        errorCode: 'HISTORY_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Watch history entry removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chronological viewing timeline grouped by Month and Year
// @route   GET /api/history/timeline
// @access  Private
const getTimeline = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const history = await WatchHistory.find({ userId }).sort({ watchedAt: -1 }).populate('movieId');

    // Group by Year-Month e.g. "September 2026"
    const timeline = {};
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    history.forEach((entry) => {
      const date = new Date(entry.watchedAt || entry.createdAt);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (!timeline[key]) {
        timeline[key] = [];
      }
      timeline[key].push(entry);
    });

    res.status(200).json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  addHistoryEntry,
  deleteHistoryEntry,
  getTimeline,
};
