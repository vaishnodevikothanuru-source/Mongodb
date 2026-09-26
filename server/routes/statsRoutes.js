const express = require('express');
const { getStatistics } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getStatistics);

module.exports = router;
