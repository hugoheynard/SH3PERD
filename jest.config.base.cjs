/** @type {import('jest').Config} */

module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    testMatch: ['**/?(*.)+(spec|test|e2e-spec).[tj]s'], // Adjust the pattern of file extensions as needed
    transform: {
        '^.+\\.ts$': [
          'ts-jest',
            {
                useESM: true,
                tsconfig: './tsconfig.test.json',
            }
        ],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
