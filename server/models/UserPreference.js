const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    favoriteGenres: {
      type: [String],
      default: ['Sci-Fi', 'Action', 'Drama', 'Thriller'],
    },
    favoriteActors: {
      type: [String],
      default: ['Leonardo DiCaprio', 'Christian Bale', 'Cillian Murphy', 'Timothée Chalamet'],
    },
    favoriteDirectors: {
      type: [String],
      default: ['Christopher Nolan', 'Denis Villeneuve', 'Quentin Tarantino', 'Martin Scorsese'],
    },
    preferredLanguages: {
      type: [String],
      default: ['English', 'Korean', 'Japanese', 'French', 'Spanish'],
    },
    preferredDecades: {
      type: [String],
      default: ['2020s', '2010s', '2000s', '1990s'],
    },
    preferredRuntimeMin: {
      type: Number,
      default: 80,
      min: 30,
      max: 300,
    },
    preferredRuntimeMax: {
      type: Number,
      default: 180,
      min: 45,
      max: 360,
    },
    minimumRating: {
      type: Number,
      default: 7.0,
      min: 0,
      max: 10,
    },
    contentPreferences: {
      includeIndie: { type: Boolean, default: true },
      includeForeign: { type: Boolean, default: true },
      includeDocumentary: { type: Boolean, default: false },
      includeAnimation: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      enum: ['dark', 'oled', 'midnight', 'light'],
      default: 'dark',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
