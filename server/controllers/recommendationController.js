const recommendationService = require('../services/recommendationService');
const RecommendationFeedback = require('../models/RecommendationFeedback');
const Movie = require('../models/Movie');

// @desc    Get multi-category personalized recommendations
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar movies for a specific movie details page
// @route   GET /api/recommendations/similar
// @access  Private
const getSimilarMovies = async (req, res, next) => {
  try {
    const { title, genres, director } = req.query;
    const genreArray = genres ? genres.split(',') : [];

    const similar = await recommendationService.getSimilarMovies(title, genreArray, director);

    res.status(200).json({
      success: true,
      data: similar,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit recommendation feedback (like, dislike, hide, etc.)
// @route   POST /api/recommendations/feedback
// @access  Private
const submitFeedback = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { tmdbId, movieTitle, action, reason } = req.body;

    const feedback = await RecommendationFeedback.create({
      userId,
      tmdbId,
      movieTitle,
      action,
      reason: reason || '',
    });

    res.status(201).json({
      success: true,
      message: `Feedback recorded: ${action}`,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getSimilarMovies,
  submitFeedback,
};
