const mongoose = require('mongoose');

const globalMovieCatalogSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    imdbId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: true,
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
      required: true,
    },
    backdropUrl: {
      type: String,
      default: '',
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
      type: Number,
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
      type: Number,
      default: 7.5,
      index: true,
    },
    voteCount: {
      type: Number,
      default: 1000,
    },
    popularity: {
      type: Number,
      default: 50,
      index: true,
    },
    category: {
      type: String,
      enum: ['trending', 'popular', 'top_rated', 'upcoming', 'hidden_gem', 'critically_acclaimed'],
      default: 'popular',
      index: true,
    },
    moods: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

globalMovieCatalogSchema.index({
  title: 'text',
  director: 'text',
  cast: 'text',
  genres: 'text',
  description: 'text',
});

module.exports = mongoose.model('GlobalMovieCatalog', globalMovieCatalogSchema);
