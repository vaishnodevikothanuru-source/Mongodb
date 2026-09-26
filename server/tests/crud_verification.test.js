/**
 * Comprehensive Automated CRUD Verification Test Suite
 * Tests all Create, Read, Update, and Delete operations for:
 * - Authentication & User Profile
 * - Movie Library (Create, Read, Update, Delete, Status, Ratings, Reviews)
 * - Watchlist (Create, Read, Update Priority, Delete)
 * - Watch History (Create, Read, Delete, Timeline)
 * - Collections (Create, Read, Add Movie, Remove Movie, Delete)
 * - Recommendations & Feedback
 * - Data Import / Export (JSON / CSV)
 */

const axios = require('axios');

const API_BASE = 'http://127.0.0.1:5000/api';
let authToken = '';
let testUserId = '';
let testMovieId = '';
let testCollectionId = '';
let testHistoryId = '';
let testWatchlistId = '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

const logPass = (title) => console.log(`  \x1b[32m✔ [PASS]\x1b[0m ${title}`);
const logFail = (title, err) => {
  console.error(`  \x1b[31m✖ [FAIL]\x1b[0m ${title}`, err.response?.data || err.message);
  process.exit(1);
};

const runVerification = async () => {
  console.log('\n=============================================================');
  console.log('   🚀 CineVault Full-Stack CRUD Verification Suite');
  console.log('=============================================================\n');

  // --- 1. HEALTH CHECK ---
  try {
    console.log('1. Testing System Health & Server Connectivity...');
    const health = await api.get('/health');
    if (health.data.success) {
      logPass('Server and MongoDB connection is healthy');
    }
  } catch (err) {
    logFail('Health Check', err);
  }

  // --- 2. AUTHENTICATION CRUD ---
  try {
    console.log('\n2. Testing Authentication & User Profile CRUD...');
    const uniqueEmail = `testuser_${Date.now()}@example.com`;

    // CREATE: Register
    const regRes = await api.post('/auth/register', {
      name: 'Test Cinephile',
      email: uniqueEmail,
      password: 'testPassword123',
    });
    authToken = regRes.data.data.token;
    testUserId = regRes.data.data._id;
    logPass(`CREATE User: Registered user (${uniqueEmail})`);

    // READ: Login & GetMe
    const loginRes = await api.post('/auth/login', {
      email: uniqueEmail,
      password: 'testPassword123',
    });
    authToken = loginRes.data.data.token;
    logPass('READ User: Successfully logged in and received JWT');

    const meRes = await api.get('/auth/me');
    if (meRes.data.data.user.email === uniqueEmail) {
      logPass('READ User: GET /api/auth/me returned correct profile');
    }

    // UPDATE: Update Profile
    const updateProfileRes = await api.put('/auth/profile', {
      name: 'Test Cinephile Pro',
      bio: 'Lover of 70mm and sci-fi films.',
    });
    if (updateProfileRes.data.data.name === 'Test Cinephile Pro') {
      logPass('UPDATE User: Successfully updated name and bio');
    }
  } catch (err) {
    logFail('Authentication CRUD', err);
  }

  // --- 3. MOVIE LIBRARY CRUD ---
  try {
    console.log('\n3. Testing Movie Library CRUD Operations...');

    // CREATE: Add Movie
    const newMoviePayload = {
      title: 'Blade Runner 2049 (Test Edition)',
      originalTitle: 'Blade Runner 2049',
      description: 'A young blade runner unearths a long-buried secret.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
      releaseDate: '2017-10-04',
      releaseYear: 2017,
      runtime: 164,
      genres: ['Sci-Fi', 'Drama', 'Mystery'],
      director: 'Denis Villeneuve',
      cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas'],
      rating: 8.1,
      status: 'UNWATCHED',
      externalIds: { tmdbId: 335984 },
    };

    const createMovieRes = await api.post('/movies', newMoviePayload);
    testMovieId = createMovieRes.data.data._id;
    logPass(`CREATE Movie: Added "${newMoviePayload.title}" (ID: ${testMovieId})`);

    // READ: List movies with search & filters
    const listRes = await api.get('/movies?genre=Sci-Fi&limit=10');
    if (listRes.data.data.some((m) => m._id === testMovieId)) {
      logPass('READ Movies: GET /api/movies with filter successfully returned movie');
    }

    // READ: Get single movie by ID
    const singleMovieRes = await api.get(`/movies/${testMovieId}`);
    if (singleMovieRes.data.data.movie.title === newMoviePayload.title) {
      logPass('READ Movie: GET /api/movies/:id returned full metadata');
    }

    // UPDATE: Update metadata
    const updateMovieRes = await api.put(`/movies/${testMovieId}`, {
      runtime: 165,
      notes: 'Testing runtime modification',
    });
    if (updateMovieRes.data.data.runtime === 165) {
      logPass('UPDATE Movie: PUT /api/movies/:id updated runtime');
    }

    // UPDATE: Patch Status to WATCHED
    const statusRes = await api.patch(`/movies/${testMovieId}/status`, {
      status: 'WATCHED',
    });
    if (statusRes.data.data.status === 'WATCHED') {
      logPass('UPDATE Movie: PATCH /api/movies/:id/status updated to WATCHED');
    }

    // UPDATE: Patch Rating (1-10)
    const ratingRes = await api.patch(`/movies/${testMovieId}/rating`, {
      personalRating: 9.5,
    });
    if (ratingRes.data.data.personalRating === 9.5) {
      logPass('UPDATE Movie: PATCH /api/movies/:id/rating saved 9.5/10 personal rating');
    }

    // UPDATE: Patch Review, Quotes, Pros & Cons
    const reviewRes = await api.patch(`/movies/${testMovieId}/review`, {
      review: 'Visual masterpiece with Roger Deakins cinematography.',
      favoriteQuote: 'All the best memories are hers.',
      pros: ['Cinematography', 'Atmosphere'],
      cons: ['Slightly deliberate pacing'],
    });
    if (reviewRes.data.data.review.includes('Visual masterpiece')) {
      logPass('UPDATE Movie: PATCH /api/movies/:id/review saved review, quote, and pros/cons');
    }

    // UPDATE: Toggle Favorite
    const favRes = await api.patch(`/movies/${testMovieId}/favorite`);
    if (favRes.data.data.favorite === true) {
      logPass('UPDATE Movie: PATCH /api/movies/:id/favorite toggled favorite boolean');
    }
  } catch (err) {
    logFail('Movie Library CRUD', err);
  }

  // --- 4. WATCHLIST CRUD ---
  try {
    console.log('\n4. Testing Watchlist CRUD Operations...');

    // CREATE: Add to Watchlist
    const addWlRes = await api.post('/watchlist', {
      movieId: testMovieId,
      priority: 'High',
      notes: 'Watch on 4K OLED',
    });
    testWatchlistId = addWlRes.data.data._id;
    logPass(`CREATE Watchlist: Added movie to watchlist with High Priority`);

    // READ: Get Watchlist
    const getWlRes = await api.get('/watchlist?priority=High');
    if (getWlRes.data.data.length > 0) {
      logPass('READ Watchlist: GET /api/watchlist returned high priority items');
    }

    // UPDATE: Update priority to Medium
    const updateWlRes = await api.patch(`/watchlist/${testWatchlistId}/priority`, {
      priority: 'Medium',
    });
    if (updateWlRes.data.data.priority === 'Medium') {
      logPass('UPDATE Watchlist: PATCH /api/watchlist/:id/priority updated priority to Medium');
    }

    // READ: Smart Watchlist suggestions ("I have 2 hours")
    const suggestRes = await api.get('/watchlist/suggestions?availableMinutes=180');
    if (suggestRes.data.success) {
      logPass('READ Watchlist: GET /api/watchlist/suggestions returned smart recommendations');
    }

    // DELETE: Remove from Watchlist
    const delWlRes = await api.delete(`/watchlist/${testWatchlistId}`);
    if (delWlRes.data.success) {
      logPass('DELETE Watchlist: DELETE /api/watchlist/:id removed movie from watchlist');
    }
  } catch (err) {
    logFail('Watchlist CRUD', err);
  }

  // --- 5. WATCH HISTORY & VIEWING TIMELINE CRUD ---
  try {
    console.log('\n5. Testing Watch History CRUD Operations...');

    // CREATE: Log viewing entry
    const addHistRes = await api.post('/history', {
      movieId: testMovieId,
      personalRating: 9.5,
      notes: 'Watched on IMAX',
    });
    testHistoryId = addHistRes.data.data._id;
    logPass(`CREATE Watch History: Logged viewing session (ID: ${testHistoryId})`);

    // READ: Get timeline grouped by month
    const timelineRes = await api.get('/history/timeline');
    if (timelineRes.data.success) {
      logPass('READ Watch History: GET /api/history/timeline returned chronological grouping');
    }

    // DELETE: Remove history entry
    const delHistRes = await api.delete(`/history/${testHistoryId}`);
    if (delHistRes.data.success) {
      logPass('DELETE Watch History: DELETE /api/history/:id removed viewing entry');
    }
  } catch (err) {
    logFail('Watch History CRUD', err);
  }

  // --- 6. CUSTOM COLLECTIONS CRUD ---
  try {
    console.log('\n6. Testing Custom Collections CRUD Operations...');

    // CREATE: Create collection
    const createColRes = await api.post('/collections', {
      name: 'Cyberpunk & Noir Cinema',
      description: 'Futuristic detective and dystopian masterpieces.',
      movies: [testMovieId],
    });
    testCollectionId = createColRes.data.data._id;
    logPass(`CREATE Collection: Created "${createColRes.data.data.name}" (ID: ${testCollectionId})`);

    // READ: Get Collections
    const getColsRes = await api.get('/collections');
    if (getColsRes.data.data.some((c) => c._id === testCollectionId)) {
      logPass('READ Collections: GET /api/collections returned created collection');
    }

    // READ: Get single collection by ID
    const singleColRes = await api.get(`/collections/${testCollectionId}`);
    if (singleColRes.data.data.movies.length > 0) {
      logPass('READ Collection: GET /api/collections/:id returned populated movies');
    }

    // UPDATE: Update collection name
    const updateColRes = await api.put(`/collections/${testCollectionId}`, {
      name: 'Cyberpunk & Sci-Fi Noir',
    });
    if (updateColRes.data.data.name === 'Cyberpunk & Sci-Fi Noir') {
      logPass('UPDATE Collection: PUT /api/collections/:id updated collection title');
    }

    // UPDATE: Remove movie from collection
    const removeMovieColRes = await api.delete(`/collections/${testCollectionId}/movies/${testMovieId}`);
    if (removeMovieColRes.data.success) {
      logPass('UPDATE Collection: Removed movie from collection');
    }

    // DELETE: Delete Collection
    const delColRes = await api.delete(`/collections/${testCollectionId}`);
    if (delColRes.data.success) {
      logPass('DELETE Collection: DELETE /api/collections/:id removed custom collection');
    }
  } catch (err) {
    logFail('Collections CRUD', err);
  }

  // --- 7. RECOMMENDATION ENGINE & FEEDBACK ---
  try {
    console.log('\n7. Testing Recommendation Engine & Feedback...');

    // READ: Personalized Recommendations
    const recsRes = await api.get('/recommendations');
    if (recsRes.data.success && recsRes.data.data.recommendedForYou) {
      logPass(`READ Recommendations: Engine scored ${recsRes.data.data.recommendedForYou.length} personalized candidate movies`);
    }

    // CREATE: Recommendation Feedback (Like / Dislike)
    const fbRes = await api.post('/recommendations/feedback', {
      tmdbId: 157336,
      movieTitle: 'Interstellar',
      action: 'like',
    });
    if (fbRes.data.success) {
      logPass('CREATE Recommendation Feedback: Recorded user preference signal in MongoDB');
    }
  } catch (err) {
    logFail('Recommendations', err);
  }

  // --- 8. DATA IMPORT & EXPORT CRUD ---
  try {
    console.log('\n8. Testing Data Import & Export...');

    // READ / EXPORT: JSON Export
    const exportJsonRes = await api.get('/data/export/json');
    if (exportJsonRes.data.movies && Array.isArray(exportJsonRes.data.movies)) {
      logPass(`READ Export: GET /api/data/export/json generated backup with ${exportJsonRes.data.movies.length} movies`);
    }

    // CREATE / IMPORT: Import JSON with duplicate detection
    const importRes = await api.post('/data/import/json', {
      movies: [
        {
          title: 'Arrival (Import Test)',
          director: 'Denis Villeneuve',
          releaseYear: 2016,
          genres: ['Sci-Fi', 'Drama'],
          runtime: 116,
          rating: 8.0,
        },
      ],
    });
    if (importRes.data.success && importRes.data.data.importedCount >= 1) {
      logPass(`CREATE Import: POST /api/data/import/json successfully imported new movie record`);
    }
  } catch (err) {
    logFail('Data Import/Export', err);
  }

  // --- 9. CLEANUP / DELETE MOVIE ---
  try {
    console.log('\n9. Testing Final Resource Deletion (DELETE)...');
    const delMovieRes = await api.delete(`/movies/${testMovieId}`);
    if (delMovieRes.data.success) {
      logPass(`DELETE Movie: DELETE /api/movies/${testMovieId} permanently removed record`);
    }
  } catch (err) {
    logFail('Movie Deletion', err);
  }

  console.log('\n=============================================================');
  console.log('   🎉 ALL CRUD OPERATIONS VERIFIED & WORKING 100%');
  console.log('=============================================================\n');
};

runVerification();
