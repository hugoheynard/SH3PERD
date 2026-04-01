/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    rootDir: './',
    displayName: 'backend',
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
    },
};