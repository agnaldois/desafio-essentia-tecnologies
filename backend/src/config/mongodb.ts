import mongoose from 'mongoose';
import { config } from './env';

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri, {
      // WR-07: cap the connection attempt so a bad URI fails in 5 s
      // rather than hanging for Mongoose's 30 s default.
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] MongoDB connected');
  } catch (err) {
    console.error('[DB] MongoDB connection failed:', err);
    // Re-throw so bootstrap() in server.ts can fail fast with a clear message.
    throw err;
  }
}
