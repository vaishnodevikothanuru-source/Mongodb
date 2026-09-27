import mongoose from 'mongoose';

/**
 * Global MongoDB connection cache for serverless environments (Next.js)
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<{ isConnected: boolean; error?: string }> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('<username>')) {
    return {
      isConnected: false,
      error: 'MONGODB_URI is not set or contains placeholder credentials. Running in robust In-Memory / Demo mode.',
    };
  }

  if (cached.conn) {
    return { isConnected: true };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        console.log('Successfully connected to MongoDB Atlas.');
        return m;
      })
      .catch((err) => {
        console.warn('MongoDB connection failed, falling back to In-Memory store:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return { isConnected: true };
  } catch (e: any) {
    return {
      isConnected: false,
      error: e?.message || 'Failed to connect to MongoDB',
    };
  }
}

export function isMongoConnected(): boolean {
  return mongoose.connection?.readyState === 1;
}
