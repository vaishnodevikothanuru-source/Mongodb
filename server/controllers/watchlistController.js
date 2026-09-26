const Watchlist = require('../models/Watchlist');
const Movie = require('../models/Movie');

// @desc    Get user's watchlist with priority sorting and filters
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { priority, genre, maxRuntime, sort = 'priority', order = 'asc' } = req.query;

    const query = { userId };
    if (priority) query.priority = priority;

    const watchlistItems = await Watchlist.find(query).populate({
      path: 'movieId',
      match: genre ? { genres: genre } : {},
    });

    // Filter out any populated items where movieId became null or didn't match genre
    let filtered = watchlistItems.filter((item) => item.movieId);

    // Filter by runtime if provided
    if (maxRuntime) {
      filtered = filtered.filter((item) => item.movieId.runtime <= Number(maxRuntime));
    }

    // Sort items
    const priorityWeight = { High: 1, Medium: 2, Low: 3 };
    filtered.sort((a, b) => {
      if (sort === 'priority') {
        const diff = (priorityWeight[a.priority] || 2) - (priorityWeight[b.priority] || 2);
        return order === 'desc' ? -diff : diff;
      }
      if (sort === 'runtime') {
        return (a.movieId.runtime || 0) - (b.movieId.runtime || 0);
      }
      if (sort === 'rating') {
        return (b.movieId.rating || 0) - (a.movieId.rating || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { movieId, priority = 'Medium', notes = '', tags = [], targetWatchDate } = req.body;

    const movie = await Movie.findOne({ _id: movieId, userId });
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in your library',
        errorCode: 'MOVIE_NOT_FOUND',
      });
    }

    movie.status = 'WATCHLIST';
    movie.watchlist = true;
    movie.watchlistPriority = priority;
    movie.addedToWatchlistAt = new Date();
    await movie.save();

    const watchlistItem = await Watchlist.findOneAndUpdate(
      { userId, movieId },
      {
        userId,
        movieId,
        priority,
        notes,
        tags,
        targetWatchDate: targetWatchDate || null,
      },
      { upsert: true, new: true }
    ).populate('movieId');

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist with priority',
      data: watchlistItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update priority and notes in watchlist
// @route   PATCH /api/watchlist/:id/priority
// @access  Private
const updateWatchlistPriority = async (req, res, next) => {
  try {
    const { priority, notes, priorityOrder } = req.body;
    const userId = req.user._id;

    const item = await Watchlist.findOne({ _id: req.params.id, userId });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist entry not found',
        errorCode: 'WATCHLIST_NOT_FOUND',
      });
    }

    if (priority) item.priority = priority;
    if (notes !== undefined) item.notes = notes;
    if (priorityOrder !== undefined) item.priorityOrder = priorityOrder;

    await item.save();

    // Sync back to Movie record
    await Movie.findByIdAndUpdate(item.movieId, { watchlistPriority: item.priority });

    const populated = await Watchlist.findById(item._id).populate('movieId');

    res.status(200).json({
      success: true,
      message: 'Watchlist updated',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
const removeFromWatchlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const item = await Watchlist.findOneAndDelete({
      $or: [{ _id: req.params.id, userId }, { movieId: req.params.id, userId }],
    });

    if (item) {
      await Movie.findByIdAndUpdate(item.movieId, {
        watchlist: false,
        status: 'UNWATCHED',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from watchlist',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Smart Watchlist AI suggestions (e.g., "I have 90 minutes", "Tonight's Picks")
// @route   GET /api/watchlist/suggestions
// @access  Private
const getSmartWatchlistSuggestions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { availableMinutes = 120, mood } = req.query;

    const watchlistItems = await Watchlist.find({ userId }).populate('movieId');
    const validItems = watchlistItems.filter((w) => w.movieId);

    // Prioritize high priority & matching available runtime
    const maxMins = Number(availableMinutes);
    const suitable = validItems
      .filter((w) => (w.movieId.runtime || 120) <= maxMins + 10)
      .sort((a, b) => {
        const pOrder = { High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority] || 1) - (pOrder[a.priority] || 1);
      });

    res.status(200).json({
      success: true,
      data: {
        availableMinutes: maxMins,
        recommendedTonight: suitable.slice(0, 5),
        allFitting: suitable,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  updateWatchlistPriority,
  removeFromWatchlist,
  getSmartWatchlistSuggestions,
};
