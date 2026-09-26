const Movie = require('../models/Movie');
const WatchHistory = require('../models/WatchHistory');
const Watchlist = require('../models/Watchlist');
const Collection = require('../models/Collection');

// @desc    Get all movies for authenticated user with search, filters, sorting & pagination
// @route   GET /api/movies
// @access  Private
const getMovies = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 20,
      search,
      status,
      favorite,
      watchlist,
      genre,
      director,
      actor,
      minRating,
      maxRating,
      minPersonalRating,
      maxPersonalRating,
      minRuntime,
      maxRuntime,
      year,
      language,
      tag,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { userId };

    // Search filter (text or regex)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { originalTitle: searchRegex },
        { director: searchRegex },
        { cast: searchRegex },
        { genres: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Status filter
    if (status) {
      query.status = status.toUpperCase();
    }

    // Favorite filter
    if (favorite !== undefined && favorite !== '') {
      query.favorite = favorite === 'true';
    }

    // Watchlist filter
    if (watchlist !== undefined && watchlist !== '') {
      query.watchlist = watchlist === 'true';
    }

    // Genre filter
    if (genre) {
      query.genres = genre;
    }

    // Director & Actor
    if (director) {
      query.director = new RegExp(director, 'i');
    }
    if (actor) {
      query.cast = new RegExp(actor, 'i');
    }

    // Tag filter
    if (tag) {
      query.tags = tag;
    }

    // External Rating filter
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = Number(minRating);
      if (maxRating) query.rating.$lte = Number(maxRating);
    }

    // Personal Rating filter
    if (minPersonalRating || maxPersonalRating) {
      query.personalRating = {};
      if (minPersonalRating) query.personalRating.$gte = Number(minPersonalRating);
      if (maxPersonalRating) query.personalRating.$lte = Number(maxPersonalRating);
    }

    // Runtime filter
    if (minRuntime || maxRuntime) {
      query.runtime = {};
      if (minRuntime) query.runtime.$gte = Number(minRuntime);
      if (maxRuntime) query.runtime.$lte = Number(maxRuntime);
    }

    // Year filter
    if (year) {
      query.releaseYear = Number(year);
    }

    // Language filter
    if (language) {
      query.languages = language;
    }

    // Sorting
    const sortField = sort;
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [movies, total] = await Promise.all([
      Movie.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Movie.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: movies,
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

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Private
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in your library',
        errorCode: 'MOVIE_NOT_FOUND',
      });
    }

    // Fetch user collections that include this movie
    const collections = await Collection.find({
      userId: req.user._id,
      movies: movie._id,
    }).select('name _id coverImage');

    // Fetch watch history count
    const historyEntries = await WatchHistory.find({
      userId: req.user._id,
      movieId: movie._id,
    }).sort({ watchedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        movie,
        collections,
        historyEntries,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Import movie into personal library
// @route   POST /api/movies
// @access  Private
const createMovie = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const movieData = req.body;

    // 1. Duplicate Detection by tmdbId, imdbId, or Title + ReleaseYear
    const duplicateQuery = { userId, $or: [] };

    if (movieData.externalIds?.tmdbId) {
      duplicateQuery.$or.push({ 'externalIds.tmdbId': movieData.externalIds.tmdbId });
    }
    if (movieData.externalIds?.imdbId) {
      duplicateQuery.$or.push({ 'externalIds.imdbId': movieData.externalIds.imdbId });
    }
    if (movieData.title) {
      const year = movieData.releaseYear || (movieData.releaseDate ? parseInt(movieData.releaseDate.split('-')[0], 10) : null);
      if (year) {
        duplicateQuery.$or.push({
          title: new RegExp(`^${movieData.title.trim()}$`, 'i'),
          releaseYear: year,
        });
      }
    }

    if (duplicateQuery.$or.length > 0) {
      const existingMovie = await Movie.findOne(duplicateQuery);
      if (existingMovie) {
        return res.status(409).json({
          success: false,
          message: `"${existingMovie.title}" is already in your movie library.`,
          errorCode: 'DUPLICATE_MOVIE',
          data: existingMovie,
        });
      }
    }

    const movie = await Movie.create({
      ...movieData,
      userId,
      dateAdded: new Date(),
    });

    // If added directly as WATCHLIST, sync with Watchlist collection
    if (movie.status === 'WATCHLIST' || movie.watchlist) {
      movie.watchlist = true;
      movie.addedToWatchlistAt = new Date();
      await movie.save();

      await Watchlist.findOneAndUpdate(
        { userId, movieId: movie._id },
        {
          userId,
          movieId: movie._id,
          priority: movie.watchlistPriority || 'Medium',
          notes: movie.notes || '',
        },
        { upsert: true, new: true }
      );
    }

    // If added directly as WATCHED, record history
    if (movie.status === 'WATCHED') {
      movie.watchedAt = movie.watchedAt || new Date();
      movie.timesWatched = movie.timesWatched || 1;
      await movie.save();

      await WatchHistory.create({
        userId,
        movieId: movie._id,
        movieTitle: movie.title,
        posterUrl: movie.posterUrl,
        genres: movie.genres,
        runtime: movie.runtime,
        watchedAt: movie.watchedAt,
        personalRating: movie.personalRating,
        notes: movie.notes,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Movie added to your library successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie details
// @route   PUT /api/movies/:id
// @access  Private
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        errorCode: 'MOVIE_NOT_FOUND',
      });
    }

    // Update allowable fields
    const allowedFields = [
      'title',
      'originalTitle',
      'description',
      'posterUrl',
      'backdropUrl',
      'releaseDate',
      'releaseYear',
      'runtime',
      'genres',
      'languages',
      'country',
      'director',
      'cast',
      'writers',
      'producers',
      'notes',
      'review',
      'favoriteQuote',
      'pros',
      'cons',
      'tags',
      'rewatchRecommendation',
      'watchlistPriority',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        movie[field] = req.body[field];
      }
    });

    const updatedMovie = await movie.save();

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: updatedMovie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie from library
// @route   DELETE /api/movies/:id
// @access  Private
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        errorCode: 'MOVIE_NOT_FOUND',
      });
    }

    // Cleanup references in watchlist, history, and collections
    await Promise.all([
      Watchlist.deleteMany({ userId: req.user._id, movieId: movie._id }),
      WatchHistory.deleteMany({ userId: req.user._id, movieId: movie._id }),
      Collection.updateMany(
        { userId: req.user._id, movies: movie._id },
        { $pull: { movies: movie._id } }
      ),
    ]);

    res.status(200).json({
      success: true,
      message: 'Movie removed from library',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie status
// @route   PATCH /api/movies/:id/status
// @access  Private
const updateMovieStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['WATCHLIST', 'UNWATCHED', 'WATCHING', 'WATCHED', 'ABANDONED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        errorCode: 'INVALID_STATUS',
      });
    }

    const movie = await Movie.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        errorCode: 'MOVIE_NOT_FOUND',
      });
    }

    movie.status = status;

    if (status === 'WATCHLIST') {
      movie.watchlist = true;
      movie.addedToWatchlistAt = new Date();
      await Watchlist.findOneAndUpdate(
        { userId: req.user._id, movieId: movie._id },
        { userId: req.user._id, movieId: movie._id, priority: movie.watchlistPriority || 'Medium' },
        { upsert: true }
      );
    } else {
      movie.watchlist = false;
      await Watchlist.deleteOne({ userId: req.user._id, movieId: movie._id });
    }

    if (status === 'WATCHING') {
      movie.startedWatchingAt = new Date();
    }

    if (status === 'WATCHED') {
      movie.watchedAt = new Date();
      movie.timesWatched = (movie.timesWatched || 0) + 1;

      // Add to watch history
      await WatchHistory.create({
        userId: req.user._id,
        movieId: movie._id,
        movieTitle: movie.title,
        posterUrl: movie.posterUrl,
        genres: movie.genres,
        runtime: movie.runtime,
        watchedAt: movie.watchedAt,
        personalRating: movie.personalRating,
        notes: movie.notes,
      });
    }

    await movie.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle movie favorite
// @route   PATCH /api/movies/:id/favorite
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        errorCode: 'MOVIE_NOT_FOUND',
      });
    }

    movie.favorite = !movie.favorite;
    await movie.save();

    res.status(200).json({
      success: true,
      message: movie.favorite ? 'Added to favorites' : 'Removed from favorites',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update personal rating
// @route   PATCH /api/movies/:id/rating
// @access  Private
const updateRating = async (req, res, next) => {
  try {
    const { personalRating } = req.body;
    const ratingNum = personalRating === null ? null : Number(personalRating);

    if (ratingNum !== null && (ratingNum < 0 || ratingNum > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Personal rating must be between 0 and 10',
        errorCode: 'INVALID_RATING',
      });
    }

    const movie = await Movie.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        errorCode: 'MOVIE_NOT_FOUND',
      });
    }

    movie.personalRating = ratingNum;
    await movie.save();

    // Update in history if exists
    await WatchHistory.updateMany(
      { userId: req.user._id, movieId: movie._id },
      { personalRating: ratingNum }
    );

    res.status(200).json({
      success: true,
      message: 'Rating saved',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notes, review, quote, pros, and cons
// @route   PATCH /api/movies/:id/review
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const { notes, review, favoriteQuote, pros, cons, rewatchRecommendation } = req.body;

    const movie = await Movie.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        errorCode: 'MOVIE_NOT_FOUND',
      });
    }

    if (notes !== undefined) movie.notes = notes;
    if (review !== undefined) movie.review = review;
    if (favoriteQuote !== undefined) movie.favoriteQuote = favoriteQuote;
    if (pros !== undefined) movie.pros = Array.isArray(pros) ? pros : [];
    if (cons !== undefined) movie.cons = Array.isArray(cons) ? cons : [];
    if (rewatchRecommendation !== undefined) movie.rewatchRecommendation = Boolean(rewatchRecommendation);

    await movie.save();

    res.status(200).json({
      success: true,
      message: 'Review and notes updated',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieStatus,
  toggleFavorite,
  updateRating,
  updateReview,
};
