const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie_library';
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true,
      });

      isConnected = true;
      console.log(`[MongoDB Connected] Host: ${conn.connection.host}, Database: ${conn.connection.name}`);

      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB Error]', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB Disconnected] Attempting reconnection...');
        isConnected = false;
      });

      return conn;
    } catch (error) {
      retryCount++;
      console.error(`[MongoDB Connection Attempt ${retryCount}/${maxRetries} Failed]:`, error.message);
      if (retryCount >= maxRetries) {
        console.error('[MongoDB Critical] Maximum connection retries reached.');
        // Don't crash process in development so server can still serve mock/fallback when DB is starting
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
        break;
      }
      // Wait 2 seconds before retrying
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB Disconnected Gracefully]');
  }
};

module.exports = { connectDB, disconnectDB };
