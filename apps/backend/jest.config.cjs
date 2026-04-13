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
    globalSetup: './src/E2E/global-setup.ts',
    globalTeardown: './src/E2E/global-teardown.ts',
};