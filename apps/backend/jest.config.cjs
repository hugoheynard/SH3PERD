/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  rootDir: './',
  displayName: 'backend',
  // Suppress console.log/warn/error noise during tests.
  // Test failures still show — only console output is silenced.
  silent: true,
  testMatch: ['**/?(*.)+(spec|test|e2e-spec).ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.test.json',
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@sh3pherd/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
    '^@sh3pherd/shared-types/(.*)$': '<rootDir>/../../packages/shared-types/src/$1',
    '^@sh3pherd/storage$': '<rootDir>/../../packages/storage/src/index.ts',
    '^@sh3pherd/storage/(.*)$': '<rootDir>/../../packages/storage/src/$1',
  },
  // MongoMemoryServer: starts an in-memory MongoDB before any test,
  // stops it after all suites finish. No external MongoDB required.
  //
  // IMPORTANT — the `test` script always runs with `--runInBand` so
  // the whole suite (unit + E2E) shares the single MongoMemoryServer
  // without worker-level races on `resetAllCollections()`. Setting
  // `maxWorkers: 1` here is not sufficient — jest still spawns one
  // worker child with that value, and the env-var hand-off to the
  // worker is just enough out of sync with globalSetup on cold runs
  // to produce sporadic `workspace.e2e-spec.ts` failures. `--runInBand`
  // runs everything in the main process, deterministic end-to-end.
  globalSetup: './src/E2E/global-setup.ts',
  globalTeardown: './src/E2E/global-teardown.ts',
};
