export default {
    rootDir: '.',
    transform: {
        "^.+\\.[tj]sx?$": "babel-jest",
    },
    extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],
    testEnvironment: 'node',
    moduleNameMapper: {},
    testMatch: ['<rootDir>/**/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    globals: {
        "ts-jest": {
            useESM: true, // Allow ts-jest to process TypeScript files as ESM
        },
    },
};