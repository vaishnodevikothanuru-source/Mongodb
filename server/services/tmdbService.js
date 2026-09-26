const axios = require('axios');
const GlobalMovieCatalog = require('../models/GlobalMovieCatalog');

const TMDB_BASE_URL = process.env.MOVIE_API_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

// Genre ID mapping for TMDB
const TMDB_GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const formatTMDBMovie = (tmdbMovie) => {
  const genres = tmdbMovie.genres
    ? tmdbMovie.genres.map((g) => g.name)
    : (tmdbMovie.genre_ids || []).map((id) => TMDB_GENRES[id] || 'General');

  const releaseYear = tmdbMovie.release_date
    ? parseInt(tmdbMovie.release_date.split('-')[0], 10)
    : null;

  return {
    tmdbId: tmdbMovie.id,
    imdbId: tmdbMovie.imdb_id || null,
    title: tmdbMovie.title || tmdbMovie.original_title,
    originalTitle: tmdbMovie.original_title,
    description: tmdbMovie.overview || '',
    posterUrl: tmdbMovie.poster_path
      ? `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    backdropUrl: tmdbMovie.backdrop_path
      ? `${TMDB_BACKDROP_BASE}${tmdbMovie.backdrop_path}`
      : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    releaseDate: tmdbMovie.release_date || '',
    releaseYear,
    runtime: tmdbMovie.runtime || 120,
    genres,
    languages: tmdbMovie.spoken_languages
      ? tmdbMovie.spoken_languages.map((l) => l.english_name || l.name)
      : [tmdbMovie.original_language === 'en' ? 'English' : tmdbMovie.original_language],
    country: tmdbMovie.production_countries && tmdbMovie.production_countries.length > 0
      ? tmdbMovie.production_countries[0].name
      : 'USA',
    director: 'Unknown Director',
    cast: [],
    writers: [],
    producers: [],
    rating: tmdbMovie.vote_average ? Math.round(tmdbMovie.vote_average * 10) / 10 : 7.0,
    voteCount: tmdbMovie.vote_count || 100,
  };
};

class TMDBService {
  constructor() {
    this.apiKey = process.env.MOVIE_API_KEY;
  }

  isKeyConfigured() {
    return Boolean(this.apiKey && this.apiKey !== 'YOUR_TMDB_API_KEY');
  }

  async searchMovies(query, page = 1) {
    if (this.isKeyConfigured()) {
      try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
          params: {
            api_key: this.apiKey,
            query,
            page,
            include_adult: false,
          },
          timeout: 6000,
        });

        const results = response.data.results.map(formatTMDBMovie);
        return {
          results,
          page: response.data.page,
          totalPages: response.data.total_pages,
          totalResults: response.data.total_results,
        };
      } catch (err) {
        console.warn('TMDB API search failed, falling back to local database catalog:', err.message);
      }
    }

    // Fallback to GlobalMovieCatalog in MongoDB
    const regex = new RegExp(query, 'i');
    const limit = 20;
    const skip = (page - 1) * limit;

    const [catalogMovies, total] = await Promise.all([
      GlobalMovieCatalog.find({
        $or: [{ title: regex }, { director: regex }, { cast: regex }, { genres: regex }],
      })
        .skip(skip)
        .limit(limit),
      GlobalMovieCatalog.countDocuments({
        $or: [{ title: regex }, { director: regex }, { cast: regex }, { genres: regex }],
      }),
    ]);

    return {
      results: catalogMovies,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1,
      totalResults: total,
    };
  }

  async getMovieDetails(tmdbId) {
    if (this.isKeyConfigured()) {
      try {
        const [detailsRes, creditsRes] = await Promise.all([
          axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
            params: { api_key: this.apiKey },
            timeout: 6000,
          }),
          axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}/credits`, {
            params: { api_key: this.apiKey },
            timeout: 6000,
          }),
        ]);

        const formatted = formatTMDBMovie(detailsRes.data);

        // Extract credits
        if (creditsRes.data) {
          const director = creditsRes.data.crew?.find((c) => c.job === 'Director');
          if (director) formatted.director = director.name;

          formatted.writers = creditsRes.data.crew
            ?.filter((c) => ['Screenplay', 'Writer', 'Story'].includes(c.job))
            .map((c) => c.name)
            .slice(0, 4) || [];

          formatted.producers = creditsRes.data.crew
            ?.filter((c) => c.job === 'Producer')
            .map((c) => c.name)
            .slice(0, 3) || [];

          formatted.cast = creditsRes.data.cast?.slice(0, 8).map((c) => c.name) || [];
        }

        return formatted;
      } catch (err) {
        console.warn(`TMDB details failed for ${tmdbId}, searching database catalog:`, err.message);
      }
    }

    // Fallback to GlobalMovieCatalog
    const found = await GlobalMovieCatalog.findOne({ tmdbId: Number(tmdbId) });
    if (found) return found;

    return null;
  }

  async getCuratedCategory(category = 'popular', page = 1) {
    if (this.isKeyConfigured()) {
      try {
        let endpoint = `${TMDB_BASE_URL}/movie/popular`;
        if (category === 'trending') endpoint = `${TMDB_BASE_URL}/trending/movie/week`;
        if (category === 'top_rated') endpoint = `${TMDB_BASE_URL}/movie/top_rated`;
        if (category === 'upcoming') endpoint = `${TMDB_BASE_URL}/movie/upcoming`;

        const response = await axios.get(endpoint, {
          params: { api_key: this.apiKey, page },
          timeout: 6000,
        });

        const results = response.data.results.map(formatTMDBMovie);
        return {
          results,
          page: response.data.page,
          totalPages: response.data.total_pages,
          totalResults: response.data.total_results,
        };
      } catch (err) {
        console.warn(`TMDB category ${category} failed, falling back to local database catalog:`, err.message);
      }
    }

    // Fallback from MongoDB GlobalMovieCatalog
    const limit = 20;
    const skip = (page - 1) * limit;

    let filter = {};
    if (category === 'top_rated') filter = { rating: { $gte: 8.0 } };
    else if (category === 'hidden_gem') filter = { category: 'hidden_gem' };
    else if (category === 'upcoming') filter = { category: 'upcoming' };
    else if (category === 'trending') filter = { category: 'trending' };

    const [catalogMovies, total] = await Promise.all([
      GlobalMovieCatalog.find(filter).sort({ rating: -1, popularity: -1 }).skip(skip).limit(limit),
      GlobalMovieCatalog.countDocuments(filter),
    ]);

    return {
      results: catalogMovies,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1,
      totalResults: total,
    };
  }
}

module.exports = new TMDBService();
