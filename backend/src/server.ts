// reflect-metadata MUST be the very first import — TypeORM reflection cannot
// discover column types without it (D-17).
import 'reflect-metadata';

import { AppDataSource } from './config/data-source';
import { app } from './app';
import { config } from './config/env';
import { connectMongoDB } from './config/mongodb';

async function bootstrap(): Promise<void> {
  // Initialize MySQL via TypeORM before accepting HTTP traffic (D-16)
  await AppDataSource.initialize();
  console.log('[DB] MySQL connected via TypeORM');

  // Phase 3: MongoDB connection
  await connectMongoDB();

  const port = config.port;
  app.listen(port, () => {
    console.log(`[Server] Listening on http://localhost:${port}`);
    console.log(`[Server] API base: http://localhost:${port}/api/v1`);
  });
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
