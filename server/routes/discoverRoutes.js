const express = require('express');
const {
  getCurated,
  getMoodMovies,
  searchExternalMovies,
  getMovieExternalDetails,
} = require('../controllers/discoverController');

const router = express.Router();

// Public discovery endpoints
router.get('/curated', getCurated);
router.get('/mood', getMoodMovies);
router.get('/search', searchExternalMovies);
router.get('/details/:id', getMovieExternalDetails);

module.exports = router;
