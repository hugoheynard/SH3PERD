module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
    moduleNameMapper: {},
    testMatch: ['**/*.test.ts', '**/*.test.tsx'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transformIgnorePatterns: ['/node_modules/'],
    projects: ['<rootDir>/packages/*'],
};



