require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const UserPreference = require('../models/UserPreference');
const Movie = require('../models/Movie');
const WatchHistory = require('../models/WatchHistory');
const Watchlist = require('../models/Watchlist');
const Collection = require('../models/Collection');
const GlobalMovieCatalog = require('../models/GlobalMovieCatalog');
const sampleMovies = require('./sampleMovies');

const seedData = async () => {
  try {
    console.log('--- Starting Database Seeder ---');
    console.log(`Connecting to MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie_library'}`);
    await connectDB();

    // 1. Clear existing global catalog and seed it with TMDB dataset
    console.log('Seeding Global Movie Catalog with TMDB references...');
    await GlobalMovieCatalog.deleteMany({});
    await GlobalMovieCatalog.insertMany(sampleMovies);
    console.log(`✓ Populated ${sampleMovies.length} TMDB movies into GlobalMovieCatalog.`);

    // 2. Setup Demo User
    const demoEmail = 'demo@movielibrary.com';
    let demoUser = await User.findOne({ email: demoEmail });

    if (demoUser) {
      console.log('Cleaning existing demo user data...');
      await Promise.all([
        Movie.deleteMany({ userId: demoUser._id }),
        WatchHistory.deleteMany({ userId: demoUser._id }),
        Watchlist.deleteMany({ userId: demoUser._id }),
        Collection.deleteMany({ userId: demoUser._id }),
        UserPreference.deleteMany({ userId: demoUser._id }),
        User.deleteOne({ _id: demoUser._id }),
      ]);
    }

    demoUser = await User.create({
      name: 'Alex Mercer',
      email: demoEmail,
      password: 'password123',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: 'Film director aspirant and cinema enthusiast. Always hunting for cinematic brilliance and hero journeys.',
    });
    console.log(`✓ Created demo user: ${demoUser.email} / password123`);

    // 3. User Preferences
    await UserPreference.create({
      userId: demoUser._id,
      favoriteGenres: ['Sci-Fi', 'Action', 'Drama', 'Thriller', 'Mystery', 'Crime'],
      favoriteActors: ['Leonardo DiCaprio', 'Christian Bale', 'Cillian Murphy', 'Keanu Reeves', 'Robert Downey Jr.', 'Timothée Chalamet', 'Brad Pitt'],
      favoriteDirectors: ['Christopher Nolan', 'Denis Villeneuve', 'Quentin Tarantino', 'Martin Scorsese', 'David Fincher'],
      preferredLanguages: ['English', 'Korean', 'Japanese'],
      preferredDecades: ['2020s', '2010s', '2000s', '1990s'],
      preferredRuntimeMin: 90,
      preferredRuntimeMax: 180,
      minimumRating: 7.5,
      theme: 'dark',
    });

    // 4. Create Personal Movie Records for Demo User
    const interstellar = await Movie.create({
      userId: demoUser._id,
      title: 'Interstellar',
      originalTitle: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqAlzk0OvP5qV2V8iV89wh.jpg',
      releaseDate: '2014-11-05',
      releaseYear: 2014,
      runtime: 169,
      genres: ['Adventure', 'Drama', 'Sci-Fi'],
      languages: ['English'],
      country: 'USA',
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine', 'Matt Damon'],
      rating: 8.7,
      personalRating: 9.5,
      status: 'WATCHED',
      favorite: true,
      watchedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      timesWatched: 3,
      favoriteQuote: 'Do not go gentle into that good night. Rage, rage against the dying of the light.',
      review: 'An emotional powerhouse and visually breathtaking masterpiece that redefines modern science fiction.',
      pros: ['Hans Zimmer\'s organ score', 'Astrophysics accuracy & visual effects', 'Emotional father-daughter core'],
      cons: ['Slightly rushed resolution with the tesseract equation'],
      rewatchRecommendation: true,
      tags: ['mind-bending', 'must-watch', 'emotional', 'soundtrack-god'],
      externalIds: { tmdbId: 157336, imdbId: 'tt0816692' },
    });

    const inception = await Movie.create({
      userId: demoUser._id,
      title: 'Inception',
      originalTitle: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
      releaseDate: '2010-07-15',
      releaseYear: 2010,
      runtime: 148,
      genres: ['Action', 'Sci-Fi', 'Adventure', 'Mystery'],
      languages: ['English', 'Japanese'],
      country: 'USA',
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Tom Hardy', 'Elliot Page', 'Cillian Murphy'],
      rating: 8.4,
      personalRating: 9.0,
      status: 'WATCHED',
      favorite: true,
      watchedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      timesWatched: 4,
      favoriteQuote: 'An idea is like a virus. Resilient. Highly contagious.',
      review: 'Brilliant conceptual architecture and world-building that rewards multiple viewings.',
      pros: ['Zero-gravity hallway fight sequence', 'Non-linear multi-layered climax', 'Original screenplay'],
      cons: ['Heavy exposition in first act'],
      rewatchRecommendation: true,
      tags: ['mind-bending', 'classic', 'heist'],
      externalIds: { tmdbId: 27205, imdbId: 'tt1375666' },
    });

    const darkKnight = await Movie.create({
      userId: demoUser._id,
      title: 'The Dark Knight',
      originalTitle: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
      releaseDate: '2008-07-16',
      releaseYear: 2008,
      runtime: 152,
      genres: ['Action', 'Crime', 'Drama', 'Thriller'],
      languages: ['English'],
      country: 'USA',
      director: 'Christopher Nolan',
      cast: ['Christian Bale', 'Heath Ledger', 'Michael Caine', 'Gary Oldman', 'Aaron Eckhart', 'Maggie Gyllenhaal'],
      rating: 9.0,
      personalRating: 9.8,
      status: 'WATCHED',
      favorite: true,
      watchedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      timesWatched: 5,
      review: 'The gold standard for comic book adaptations and crime thrillers alike. Heath Ledger is unforgettable.',
      tags: ['classic', 'dark', 'masterpiece', 'hero'],
      externalIds: { tmdbId: 155, imdbId: 'tt0468569' },
    });

    const oppenheimer = await Movie.create({
      userId: demoUser._id,
      title: 'Oppenheimer',
      originalTitle: 'Oppenheimer',
      description: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
      releaseDate: '2023-07-19',
      releaseYear: 2023,
      runtime: 180,
      genres: ['Drama', 'History', 'Biography'],
      languages: ['English'],
      country: 'USA',
      director: 'Christopher Nolan',
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
      rating: 8.5,
      personalRating: 8.5,
      status: 'WATCHED',
      favorite: false,
      watchedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      timesWatched: 1,
      favoriteQuote: 'Now I am become Death, the destroyer of worlds.',
      review: 'A pulse-pounding biographical thriller with career-best acting from Cillian Murphy and Robert Downey Jr.',
      pros: ['Sound design and pacing', 'Cillian Murphy close-up expressions'],
      cons: ['Dense dialogue-heavy third act trial'],
      tags: ['historical', 'intense', 'oscar-winner'],
      externalIds: { tmdbId: 872585, imdbId: 'tt15398776' },
    });

    const theMatrix = await Movie.create({
      userId: demoUser._id,
      title: 'The Matrix',
      originalTitle: 'The Matrix',
      description: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/l4QHerTSbflrqeuMu4PxH7N2wBv.jpg',
      releaseDate: '1999-03-30',
      releaseYear: 1999,
      runtime: 136,
      genres: ['Action', 'Sci-Fi'],
      languages: ['English'],
      country: 'USA',
      director: 'Lana Wachowski',
      cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
      rating: 8.2,
      personalRating: 9.0,
      status: 'WATCHED',
      favorite: true,
      watchedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      timesWatched: 6,
      review: 'Revolutionized action cinema and visual effects. Keanu Reeves as Neo is the ultimate hero.',
      tags: ['classic', 'cyberpunk', 'hero', 'mind-bending'],
      externalIds: { tmdbId: 603, imdbId: 'tt0133093' },
    });

    const wolfOfWallStreet = await Movie.create({
      userId: demoUser._id,
      title: 'The Wolf of Wall Street',
      originalTitle: 'The Wolf of Wall Street',
      description: "A New York stockbroker refuses to cooperate in a large securities fraud case that involves corruption on Wall Street, the corporate banking world and mob infiltration.",
      posterUrl: 'https://image.tmdb.org/t/p/w500/kW9LmvYfwc5r7sg1w6SpZ9U0j0k.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/cWUOv3H7YCVdGUMavZe9quTe3m9.jpg',
      releaseDate: '2013-12-25',
      releaseYear: 2013,
      runtime: 180,
      genres: ['Crime', 'Drama', 'Comedy'],
      languages: ['English'],
      country: 'USA',
      director: 'Martin Scorsese',
      cast: ['Leonardo DiCaprio', 'Jonah Hill', 'Margot Robbie', 'Matthew McConaughey'],
      rating: 8.0,
      personalRating: 8.5,
      status: 'WATCHED',
      favorite: false,
      watchedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      timesWatched: 2,
      review: 'Electrifying, chaotic energy with Leonardo DiCaprio delivering one of his most manic and entertaining performances.',
      tags: ['comedy', 'fast-paced', 'crime'],
      externalIds: { tmdbId: 106646, imdbId: 'tt0993846' },
    });

    const parasite = await Movie.create({
      userId: demoUser._id,
      title: 'Parasite',
      originalTitle: '기생충',
      description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdFiyeQIHQWkv.jpg',
      releaseDate: '2019-05-30',
      releaseYear: 2019,
      runtime: 132,
      genres: ['Comedy', 'Thriller', 'Drama'],
      languages: ['Korean'],
      country: 'South Korea',
      director: 'Bong Joon-ho',
      cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
      rating: 8.5,
      personalRating: 9.0,
      status: 'WATCHED',
      favorite: true,
      watchedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000),
      timesWatched: 2,
      review: 'Sharp, razor-focused social satire with unparalleled tonal control and shocking turns.',
      tags: ['social-commentary', 'dark-comedy', 'palme-dor'],
      externalIds: { tmdbId: 496243, imdbId: 'tt6751668' },
    });

    const dune2 = await Movie.create({
      userId: demoUser._id,
      title: 'Dune: Part Two',
      originalTitle: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b4q.jpg',
      releaseDate: '2024-02-27',
      releaseYear: 2024,
      runtime: 166,
      genres: ['Sci-Fi', 'Adventure', 'Action'],
      languages: ['English'],
      country: 'USA',
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler'],
      rating: 8.6,
      status: 'WATCHLIST',
      watchlist: true,
      watchlistPriority: 'High',
      addedToWatchlistAt: new Date(),
      notes: 'Must watch on the biggest 4K screen with surround sound.',
      tags: ['epic', 'sci-fi', 'priority-tonight'],
      externalIds: { tmdbId: 693134, imdbId: 'tt15239678' },
    });

    const bladeRunner = await Movie.create({
      userId: demoUser._id,
      title: 'Blade Runner 2049',
      originalTitle: 'Blade Runner 2049',
      description: 'A young blade runner unearths a long-buried secret that leads him to track down former blade runner Rick Deckard.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/sAtoMqDVhNDQBc3QJL3RF6hlxGq.jpg',
      releaseDate: '2017-10-04',
      releaseYear: 2017,
      runtime: 164,
      genres: ['Sci-Fi', 'Drama', 'Mystery'],
      languages: ['English'],
      country: 'USA',
      director: 'Denis Villeneuve',
      cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas'],
      rating: 8.1,
      status: 'WATCHLIST',
      watchlist: true,
      watchlistPriority: 'High',
      addedToWatchlistAt: new Date(),
      tags: ['cyberpunk', 'atmospheric', 'visual-feast'],
      externalIds: { tmdbId: 335984, imdbId: 'tt1856101' },
    });

    const avengersEndgame = await Movie.create({
      userId: demoUser._id,
      title: 'Avengers: Endgame',
      originalTitle: 'Avengers: Endgame',
      description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos\' actions.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
      releaseDate: '2019-04-24',
      releaseYear: 2019,
      runtime: 181,
      genres: ['Adventure', 'Sci-Fi', 'Action'],
      languages: ['English'],
      country: 'USA',
      director: 'Anthony Russo',
      cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
      rating: 8.3,
      status: 'WATCHLIST',
      watchlist: true,
      watchlistPriority: 'High',
      addedToWatchlistAt: new Date(),
      notes: 'Culmination of the MCU infinity saga.',
      tags: ['superhero', 'epic', 'marvel'],
      externalIds: { tmdbId: 299534, imdbId: 'tt4154796' },
    });

    const topGun = await Movie.create({
      userId: demoUser._id,
      title: 'Top Gun: Maverick',
      originalTitle: 'Top Gun: Maverick',
      description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, leading graduates on a high-stakes mission.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg',
      releaseDate: '2022-05-24',
      releaseYear: 2022,
      runtime: 131,
      genres: ['Action', 'Drama'],
      languages: ['English'],
      country: 'USA',
      director: 'Joseph Kosinski',
      cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly', 'Jon Hamm'],
      rating: 8.3,
      status: 'WATCHLIST',
      watchlist: true,
      watchlistPriority: 'Medium',
      addedToWatchlistAt: new Date(),
      tags: ['action', 'aviation', 'hero'],
      externalIds: { tmdbId: 361743, imdbId: 'tt1745960' },
    });

    const exMachina = await Movie.create({
      userId: demoUser._id,
      title: 'Ex Machina',
      originalTitle: 'Ex Machina',
      description: 'A programmer is invited to administer the Turing test to an intelligent humanoid robot.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/btbSMBHQ4hQAa2uW07wB1U3Qz1C.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/9Xw0I5RV2Zq6Q7Xk0b5yW1Qf6k.jpg',
      releaseDate: '2014-12-16',
      releaseYear: 2014,
      runtime: 108,
      genres: ['Drama', 'Sci-Fi', 'Thriller'],
      languages: ['English'],
      country: 'UK',
      director: 'Alex Garland',
      cast: ['Domhnall Gleeson', 'Alicia Vikander', 'Oscar Isaac'],
      rating: 7.9,
      status: 'WATCHING',
      startedWatchingAt: new Date(),
      tags: ['ai', 'claustrophobic', 'psychological'],
      externalIds: { tmdbId: 264660, imdbId: 'tt2872718' },
    });

    // 5. Populate Watchlist model
    await Watchlist.create([
      {
        userId: demoUser._id,
        movieId: dune2._id,
        priority: 'High',
        priorityOrder: 1,
        notes: 'Watch with friends this weekend',
        tags: ['epic', 'sci-fi'],
      },
      {
        userId: demoUser._id,
        movieId: avengersEndgame._id,
        priority: 'High',
        priorityOrder: 2,
        notes: 'MCU hero marathon',
        tags: ['marvel', 'hero'],
      },
      {
        userId: demoUser._id,
        movieId: bladeRunner._id,
        priority: 'High',
        priorityOrder: 3,
        notes: 'Late night cyberpunk session',
        tags: ['cyberpunk'],
      },
      {
        userId: demoUser._id,
        movieId: topGun._id,
        priority: 'Medium',
        priorityOrder: 4,
        notes: 'High-octane action film night',
        tags: ['action', 'hero'],
      },
    ]);

    // 6. Populate Watch History with chronological timeline
    await WatchHistory.create([
      {
        userId: demoUser._id,
        movieId: interstellar._id,
        movieTitle: interstellar.title,
        posterUrl: interstellar.posterUrl,
        genres: interstellar.genres,
        runtime: interstellar.runtime,
        watchedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        timesWatched: 3,
        personalRating: 9.5,
        notes: 'Watched on IMAX re-release, completely stunned.',
      },
      {
        userId: demoUser._id,
        movieId: inception._id,
        movieTitle: inception.title,
        posterUrl: inception.posterUrl,
        genres: inception.genres,
        runtime: inception.runtime,
        watchedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        timesWatched: 4,
        personalRating: 9.0,
        notes: 'Studying Nolan editing techniques.',
      },
      {
        userId: demoUser._id,
        movieId: oppenheimer._id,
        movieTitle: oppenheimer.title,
        posterUrl: oppenheimer.posterUrl,
        genres: oppenheimer.genres,
        runtime: oppenheimer.runtime,
        watchedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        timesWatched: 1,
        personalRating: 8.5,
      },
      {
        userId: demoUser._id,
        movieId: darkKnight._id,
        movieTitle: darkKnight.title,
        posterUrl: darkKnight.posterUrl,
        genres: darkKnight.genres,
        runtime: darkKnight.runtime,
        watchedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        timesWatched: 5,
        personalRating: 9.8,
      },
      {
        userId: demoUser._id,
        movieId: theMatrix._id,
        movieTitle: theMatrix.title,
        posterUrl: theMatrix.posterUrl,
        genres: theMatrix.genres,
        runtime: theMatrix.runtime,
        watchedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        timesWatched: 6,
        personalRating: 9.0,
      },
      {
        userId: demoUser._id,
        movieId: wolfOfWallStreet._id,
        movieTitle: wolfOfWallStreet.title,
        posterUrl: wolfOfWallStreet.posterUrl,
        genres: wolfOfWallStreet.genres,
        runtime: wolfOfWallStreet.runtime,
        watchedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        timesWatched: 2,
        personalRating: 8.5,
      },
      {
        userId: demoUser._id,
        movieId: parasite._id,
        movieTitle: parasite.title,
        posterUrl: parasite.posterUrl,
        genres: parasite.genres,
        runtime: parasite.runtime,
        watchedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000),
        timesWatched: 2,
        personalRating: 9.0,
      },
    ]);

    // 7. Custom Themed Collections
    await Collection.create([
      {
        userId: demoUser._id,
        name: 'Christopher Nolan Masterpieces',
        description: 'Chronicle of non-linear storytelling, practical effects, and high-concept cinema.',
        coverImage: 'https://image.tmdb.org/t/p/original/rAiYTsqAlzk0OvP5qV2V8iV89wh.jpg',
        movies: [interstellar._id, inception._id, oppenheimer._id, darkKnight._id],
      },
      {
        userId: demoUser._id,
        name: 'Mind-Bending Sci-Fi & Cyberpunk',
        description: 'Films that question the nature of time, consciousness, and simulated reality.',
        coverImage: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
        movies: [interstellar._id, inception._id, theMatrix._id, exMachina._id, bladeRunner._id],
      },
      {
        userId: demoUser._id,
        name: 'Hero Legends & Blockbusters',
        description: 'Iconic heroic journeys and cinematic climaxes.',
        coverImage: 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
        movies: [darkKnight._id, theMatrix._id, avengersEndgame._id, topGun._id],
      },
      {
        userId: demoUser._id,
        name: 'Oscar Winners & Social Satire',
        description: 'Critically acclaimed works with unforgettable themes.',
        coverImage: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdFiyeQIHQWkv.jpg',
        movies: [parasite._id, oppenheimer._id, wolfOfWallStreet._id],
      },
    ]);

    console.log('--- ✓ MongoDB Seeding Completed Successfully! ---');
    console.log('Demo Credentials:');
    console.log('  Email: demo@movielibrary.com');
    console.log('  Password: password123');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedData();
