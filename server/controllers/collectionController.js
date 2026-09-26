const Collection = require('../models/Collection');
const Movie = require('../models/Movie');

// @desc    Get all custom collections for user
// @route   GET /api/collections
// @access  Private
const getCollections = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const collections = await Collection.find({ userId }).populate('movies');

    res.status(200).json({
      success: true,
      count: collections.length,
      data: collections,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single collection by ID with full movies
// @route   GET /api/collections/:id
// @access  Private
const getCollectionById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const collection = await Collection.findOne({ _id: req.params.id, userId }).populate('movies');

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
        errorCode: 'COLLECTION_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom collection
// @route   POST /api/collections
// @access  Private
const createCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, coverImage, movies = [] } = req.body;

    const collection = await Collection.create({
      userId,
      name,
      description,
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
      movies,
    });

    const populated = await Collection.findById(collection._id).populate('movies');

    res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update collection
// @route   PUT /api/collections/:id
// @access  Private
const updateCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, coverImage, movies } = req.body;

    const collection = await Collection.findOne({ _id: req.params.id, userId });
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
        errorCode: 'COLLECTION_NOT_FOUND',
      });
    }

    if (name) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (coverImage) collection.coverImage = coverImage;
    if (movies) collection.movies = movies;

    await collection.save();
    const updated = await Collection.findById(collection._id).populate('movies');

    res.status(200).json({
      success: true,
      message: 'Collection updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete collection
// @route   DELETE /api/collections/:id
// @access  Private
const deleteCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, userId });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
        errorCode: 'COLLECTION_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Collection deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add movie to collection
// @route   POST /api/collections/:id/movies
// @access  Private
const addMovieToCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { movieId } = req.body;

    const collection = await Collection.findOne({ _id: req.params.id, userId });
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
        errorCode: 'COLLECTION_NOT_FOUND',
      });
    }

    if (!collection.movies.includes(movieId)) {
      collection.movies.push(movieId);
      await collection.save();
    }

    const updated = await Collection.findById(collection._id).populate('movies');

    res.status(200).json({
      success: true,
      message: 'Movie added to collection',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove movie from collection
// @route   DELETE /api/collections/:id/movies/:movieId
// @access  Private
const removeMovieFromCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id, movieId } = req.params;

    const collection = await Collection.findOne({ _id: id, userId });
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
        errorCode: 'COLLECTION_NOT_FOUND',
      });
    }

    collection.movies = collection.movies.filter((m) => m.toString() !== movieId.toString());
    await collection.save();

    res.status(200).json({
      success: true,
      message: 'Movie removed from collection',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addMovieToCollection,
  removeMovieFromCollection,
};
