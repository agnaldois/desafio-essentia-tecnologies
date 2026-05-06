import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './env';
import { Task } from '../entities/Task.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  entities: [Task],
  migrations: [__dirname + '/../migrations/**/*{.js,.ts}'],
  synchronize: false,
  migrationsRun: false,
  logging: config.nodeEnv !== 'production',
});
