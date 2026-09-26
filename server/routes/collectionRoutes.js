const express = require('express');
const { body } = require('express-validator');
const {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addMovieToCollection,
  removeMovieFromCollection,
} = require('../controllers/collectionController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCollections)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Collection name is required'),
      validate,
    ],
    createCollection
  );

router.route('/:id')
  .get(getCollectionById)
  .put(updateCollection)
  .delete(deleteCollection);

router.post('/:id/movies', addMovieToCollection);
router.delete('/:id/movies/:movieId', removeMovieFromCollection);

module.exports = router;
