import type { Config } from 'jest';

/** E2E config that points jest at an ALREADY-running proxy on :14000.
 * Skips globalSetup/Teardown (no docker lifecycle, no provider-key assertion).
 * Used by the maintainer for fast iteration; CI uses jest.e2e.config.ts. */
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/e2e'],
  testMatch: ['**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  testTimeout: 60_000,
  maxWorkers: 1,
};

export default config;
