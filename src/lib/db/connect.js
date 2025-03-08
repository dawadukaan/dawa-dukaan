// src/lib/db/connect.js
import mongoose from 'mongoose';

// Import all models to ensure they're registered before use
import './models/Category';
import './models/Product';
// Import any other models you have here

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // Remove the deprecated option
      // useUnifiedTopology: true,
      // useNewUrlParser: true
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;