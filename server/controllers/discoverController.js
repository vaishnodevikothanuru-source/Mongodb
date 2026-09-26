const tmdbService = require('../services/tmdbService');
const GlobalMovieCatalog = require('../models/GlobalMovieCatalog');
const Movie = require('../models/Movie');

const MOOD_MAP = {
  'Mind-bending': ['Sci-Fi', 'Mystery', 'Thriller'],
  Funny: ['Comedy', 'Animation'],
  Dark: ['Thriller', 'Crime', 'Horror', 'Mystery'],
  Emotional: ['Drama', 'Romance'],
  Exciting: ['Action', 'Adventure', 'Sci-Fi'],
  Relaxing: ['Animation', 'Comedy', 'Family'],
  Scary: ['Horror', 'Thriller'],
  Romantic: ['Romance', 'Drama', 'Comedy'],
  Inspirational: ['Drama', 'Biography', 'History', 'Documentary'],
  'Family-friendly': ['Family', 'Animation', 'Adventure'],
};

// @desc    Get curated discovery movies (trending, popular, top_rated, upcoming, hidden_gem)
// @route   GET /api/discover/curated
// @access  Public / Private
const getCurated = async (req, res, next) => {
  try {
    const { category = 'popular', page = 1 } = req.query;
    const result = await tmdbService.getCuratedCategory(category, Number(page));

    res.status(200).json({
      success: true,
      data: result.results,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        total: result.totalResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mood-based movies
// @route   GET /api/discover/mood
// @access  Private
const getMoodMovies = async (req, res, next) => {
  try {
    const { mood = 'Mind-bending' } = req.query;
    const genres = MOOD_MAP[mood] || ['Drama'];

    // 1. First check user's own library matching mood
    let userMatches = [];
    if (req.user) {
      userMatches = await Movie.find({
        userId: req.user._id,
        genres: { $in: genres },
      })
        .sort({ rating: -1, personalRating: -1 })
        .limit(6);
    }

    // 2. Discover candidates matching mood
    const discoverMatches = await GlobalMovieCatalog.find({
      genres: { $in: genres },
    })
      .sort({ rating: -1, popularity: -1 })
      .limit(12);

    res.status(200).json({
      success: true,
      data: {
        mood,
        targetGenres: genres,
        fromYourLibrary: userMatches,
        discoverCandidates: discoverMatches,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search external movie APIs / Global Catalog
// @route   GET /api/discover/search
// @access  Public / Private
const searchExternalMovies = async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        errorCode: 'MISSING_QUERY',
      });
    }

    const results = await tmdbService.searchMovies(query.trim(), Number(page));

    res.status(200).json({
      success: true,
      data: results.results,
      pagination: {
        page: results.page,
        totalPages: results.totalPages,
        total: results.totalResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed metadata for single movie
// @route   GET /api/discover/details/:id
// @access  Public / Private
const getMovieExternalDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const details = await tmdbService.getMovieDetails(id);

    if (!details) {
      return res.status(404).json({
        success: false,
        message: 'Movie metadata could not be found',
        errorCode: 'METADATA_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurated,
  getMoodMovies,
  searchExternalMovies,
  getMovieExternalDetails,
};
