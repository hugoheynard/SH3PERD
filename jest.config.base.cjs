/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',

    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
            tsconfig: './tsconfig.test.json', // 👈 chaque package peut avoir le sien
        }],
    },

    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],

    moduleNameMapper: {},

    testMatch: ['**/*.test.ts', '**/*.test.tsx'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transformIgnorePatterns: ['/node_modules/'],

    projects: ['<rootDir>/packages/*'],
};
