const express = require('express');
const {
  getRecommendations,
  getSimilarMovies,
  submitFeedback,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getRecommendations);
router.get('/similar', getSimilarMovies);
router.post('/feedback', submitFeedback);

module.exports = router;
