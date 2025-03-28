const base = require('../../jest.config.base.cjs');

module.exports = {
    ...base,
    projects: undefined,
    rootDir: './',
    displayName: 'password-hash-manager',
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.test.json',
            useESM: true
        }
    }
};