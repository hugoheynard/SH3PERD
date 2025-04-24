/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',

    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
            tsconfig: './tsconfig.test.json',
        }],
    },

    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],

    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },

    testMatch: ['**/*.test.ts', '**/*.test.tsx'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transformIgnorePatterns: ['/node_modules/'],

    projects: ['<rootDir>/packages/*'],
};
