/**
 * Jest setup file — sets required environment variables before any module
 * is imported. This prevents requireEnv() in config/env.ts from throwing
 * during eager import of AppDataSource and TaskRepository in tests that
 * mock the service layer (WR-04).
 *
 * These values are never used to connect to a real database in unit tests
 * because task.repository.ts is mocked at the service boundary.
 */
process.env.DB_USER = 'test';
process.env.DB_PASS = 'test';
process.env.DB_NAME = 'test';
process.env.JWT_SECRET = 'test-secret-for-jest';
