const mongoose = require('mongoose');

const watchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      default: '',
    },
    genres: {
      type: [String],
      default: [],
    },
    runtime: {
      type: Number,
      default: 120,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    timesWatched: {
      type: Number,
      default: 1,
    },
    personalRating: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

watchHistorySchema.index({ userId: 1, watchedAt: -1 });

module.exports = mongoose.model('WatchHistory', watchHistorySchema);
