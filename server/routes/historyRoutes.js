const express = require('express');
const {
  getHistory,
  addHistoryEntry,
  deleteHistoryEntry,
  getTimeline,
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHistory)
  .post(addHistoryEntry);

router.get('/timeline', getTimeline);
router.delete('/:id', deleteHistoryEntry);

module.exports = router;
