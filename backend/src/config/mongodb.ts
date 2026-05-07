import mongoose from 'mongoose';
import { config } from './env';

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] MongoDB connected');
  } catch (err) {
    console.error('[DB] MongoDB connection failed:', err);
    // Do not re-throw — caller (server.ts bootstrap) controls fault tolerance policy.
  }
}
