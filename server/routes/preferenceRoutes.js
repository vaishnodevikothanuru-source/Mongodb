const express = require('express');
const { getPreferences, updatePreferences } = require('../controllers/preferenceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.route('/')
  .get(getPreferences)
  .put(updatePreferences);

module.exports = router;
