const UserPreference = require('../models/UserPreference');

// @desc    Get user preferences
// @route   GET /api/preferences
// @access  Private
const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let preferences = await UserPreference.findOne({ userId });

    if (!preferences) {
      preferences = await UserPreference.create({ userId });
    }

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/preferences
// @access  Private
const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      favoriteGenres,
      favoriteActors,
      favoriteDirectors,
      preferredLanguages,
      preferredDecades,
      preferredRuntimeMin,
      preferredRuntimeMax,
      minimumRating,
      contentPreferences,
      theme,
    } = req.body;

    let preferences = await UserPreference.findOne({ userId });
    if (!preferences) {
      preferences = new UserPreference({ userId });
    }

    if (favoriteGenres !== undefined) preferences.favoriteGenres = favoriteGenres;
    if (favoriteActors !== undefined) preferences.favoriteActors = favoriteActors;
    if (favoriteDirectors !== undefined) preferences.favoriteDirectors = favoriteDirectors;
    if (preferredLanguages !== undefined) preferences.preferredLanguages = preferredLanguages;
    if (preferredDecades !== undefined) preferences.preferredDecades = preferredDecades;
    if (preferredRuntimeMin !== undefined) preferences.preferredRuntimeMin = Number(preferredRuntimeMin);
    if (preferredRuntimeMax !== undefined) preferences.preferredRuntimeMax = Number(preferredRuntimeMax);
    if (minimumRating !== undefined) preferences.minimumRating = Number(minimumRating);
    if (contentPreferences !== undefined) preferences.contentPreferences = contentPreferences;
    if (theme !== undefined) preferences.theme = theme;

    const saved = await preferences.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
};
