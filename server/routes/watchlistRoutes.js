const express = require('express');
const {
  getWatchlist,
  addToWatchlist,
  updateWatchlistPriority,
  removeFromWatchlist,
  getSmartWatchlistSuggestions,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWatchlist)
  .post(addToWatchlist);

router.get('/suggestions', getSmartWatchlistSuggestions);
router.patch('/:id/priority', updateWatchlistPriority);
router.delete('/:id', removeFromWatchlist);

module.exports = router;
