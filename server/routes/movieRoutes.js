const express = require('express');
const { body } = require('express-validator');
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieStatus,
  toggleFavorite,
  updateRating,
  updateReview,
} = require('../controllers/movieController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect); // All movie routes are private

router.route('/')
  .get(getMovies)
  .post(
    [
      body('title').trim().notEmpty().withMessage('Movie title is required'),
      validate,
    ],
    createMovie
  );

router.route('/:id')
  .get(getMovieById)
  .put(updateMovie)
  .delete(deleteMovie);

router.patch('/:id/status', updateMovieStatus);
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/rating', updateRating);
router.patch('/:id/review', updateReview);

module.exports = router;
