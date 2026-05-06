import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  // WR-04: pre-set required env vars before any module is imported so that
  // requireEnv() in config/env.ts does not throw when tests import the
  // service/repository chain without a real .env file present.
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
};

export default config;
