const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    originalTitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    posterUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    },
    backdropUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    },
    releaseDate: {
      type: String,
      default: '',
    },
    releaseYear: {
      type: Number,
      index: true,
    },
    runtime: {
      type: Number, // in minutes
      default: 120,
    },
    genres: {
      type: [String],
      default: [],
      index: true,
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    country: {
      type: String,
      default: 'USA',
    },
    director: {
      type: String,
      default: 'Unknown Director',
      index: true,
    },
    cast: {
      type: [String],
      default: [],
      index: true,
    },
    writers: {
      type: [String],
      default: [],
    },
    producers: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number, // External rating (e.g., TMDB / IMDb 0-10)
      default: 7.0,
      min: 0,
      max: 10,
    },
    voteCount: {
      type: Number,
      default: 100,
    },

    // User personal fields
    personalRating: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['WATCHLIST', 'UNWATCHED', 'WATCHING', 'WATCHED', 'ABANDONED'],
      default: 'UNWATCHED',
      index: true,
    },
    favorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    watchlist: {
      type: Boolean,
      default: false,
      index: true,
    },
    watchlistPriority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    watchlistOrder: {
      type: Number,
      default: 0,
    },

    // Timestamps for movie events
    addedToWatchlistAt: {
      type: Date,
      default: null,
    },
    startedWatchingAt: {
      type: Date,
      default: null,
    },
    watchedAt: {
      type: Date,
      default: null,
      index: true,
    },
    timesWatched: {
      type: Number,
      default: 0,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Personal review & notes
    notes: {
      type: String,
      default: '',
    },
    review: {
      type: String,
      default: '',
    },
    favoriteQuote: {
      type: String,
      default: '',
    },
    pros: {
      type: [String],
      default: [],
    },
    cons: {
      type: [String],
      default: [],
    },
    rewatchRecommendation: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    // External identifiers
    externalIds: {
      tmdbId: { type: Number, index: true },
      imdbId: { type: String, index: true },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal performance
movieSchema.index({ userId: 1, status: 1 });
movieSchema.index({ userId: 1, favorite: 1 });
movieSchema.index({ userId: 1, watchlist: 1 });
movieSchema.index({ userId: 1, genres: 1 });
movieSchema.index({ userId: 1, personalRating: -1 });
movieSchema.index({ userId: 1, releaseYear: -1 });
movieSchema.index({ userId: 1, 'externalIds.tmdbId': 1 });

// Full text search index
movieSchema.index(
  {
    title: 'text',
    originalTitle: 'text',
    director: 'text',
    cast: 'text',
    genres: 'text',
    tags: 'text',
    notes: 'text',
    review: 'text',
  },
  {
    weights: {
      title: 10,
      originalTitle: 7,
      director: 5,
      cast: 4,
      genres: 3,
      tags: 3,
      notes: 1,
      review: 1,
    },
    name: 'MovieTextIndex',
  }
);

// Extract releaseYear before save if releaseDate is provided
movieSchema.pre('save', function (next) {
  if (this.releaseDate && !this.releaseYear) {
    const yearMatch = this.releaseDate.match(/\d{4}/);
    if (yearMatch) {
      this.releaseYear = parseInt(yearMatch[0], 10);
    }
  }
  next();
});

module.exports = mongoose.model('Movie', movieSchema);
