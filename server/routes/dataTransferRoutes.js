const express = require('express');
const {
  exportJson,
  exportCsv,
  importJson,
} = require('../controllers/dataTransferController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/export/json', exportJson);
router.get('/export/csv', exportCsv);
router.post('/import/json', importJson);

module.exports = router;
