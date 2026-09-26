const Movie = require('../models/Movie');

// @desc    Export user library as JSON
// @route   GET /api/data/export/json
// @access  Private
const exportJson = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const movies = await Movie.find({ userId }).select('-__v -userId');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="my_movie_library.json"');
    res.status(200).json({
      exportDate: new Date().toISOString(),
      user: req.user.email,
      totalMovies: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export user library as CSV
// @route   GET /api/data/export/csv
// @access  Private
const exportCsv = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const movies = await Movie.find({ userId });

    const headers = [
      'Title',
      'ReleaseYear',
      'Director',
      'Genres',
      'Status',
      'PersonalRating',
      'ExternalRating',
      'Runtime',
      'Favorite',
      'Watchlist',
      'WatchlistPriority',
      'WatchedAt',
      'Review',
      'Notes',
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = movies.map((m) => [
      escapeCsv(m.title),
      escapeCsv(m.releaseYear || ''),
      escapeCsv(m.director || ''),
      escapeCsv((m.genres || []).join('; ')),
      escapeCsv(m.status),
      escapeCsv(m.personalRating !== null ? m.personalRating : ''),
      escapeCsv(m.rating || ''),
      escapeCsv(m.runtime || 120),
      escapeCsv(m.favorite ? 'Yes' : 'No'),
      escapeCsv(m.watchlist ? 'Yes' : 'No'),
      escapeCsv(m.watchlistPriority || ''),
      escapeCsv(m.watchedAt ? new Date(m.watchedAt).toISOString().split('T')[0] : ''),
      escapeCsv(m.review || ''),
      escapeCsv(m.notes || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="my_movie_library.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Import movies from JSON payload
// @route   POST /api/data/import/json
// @access  Private
const importJson = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { movies } = req.body;

    if (!Array.isArray(movies) || movies.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload. "movies" array is required.',
        errorCode: 'INVALID_IMPORT_PAYLOAD',
      });
    }

    let importedCount = 0;
    let duplicateCount = 0;
    const errors = [];

    for (const movieData of movies) {
      if (!movieData.title) continue;

      // Duplicate check
      const existing = await Movie.findOne({
        userId,
        title: new RegExp(`^${movieData.title.trim()}$`, 'i'),
      });

      if (existing) {
        duplicateCount++;
        continue;
      }

      try {
        await Movie.create({
          ...movieData,
          userId,
          _id: undefined, // ensure clean MongoDB ID generation
          dateAdded: new Date(),
        });
        importedCount++;
      } catch (err) {
        errors.push({ title: movieData.title, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Import complete: ${importedCount} imported, ${duplicateCount} duplicates skipped.`,
      data: {
        importedCount,
        duplicateCount,
        errors,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportJson,
  exportCsv,
  importJson,
};
