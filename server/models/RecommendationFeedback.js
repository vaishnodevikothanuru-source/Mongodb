const mongoose = require('mongoose');

const recommendationFeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tmdbId: {
      type: Number,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
    },
    movieTitle: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['like', 'dislike', 'hide', 'added_watchlist', 'marked_watched', 'clicked'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

recommendationFeedbackSchema.index({ userId: 1, action: 1 });
recommendationFeedbackSchema.index({ userId: 1, tmdbId: 1 });

module.exports = mongoose.model('RecommendationFeedback', recommendationFeedbackSchema);
