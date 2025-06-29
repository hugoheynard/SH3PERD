import type { Config } from 'jest';

const config: Config = {
    preset: 'jest-preset-angular',
    testEnvironment: 'jest-environment-jsdom',
    moduleFileExtensions: ['ts', 'html', 'js', 'json'],
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.(ts|mjs|js|html)$': ['ts-jest', {
            useESM: true,
            tsconfig: '<rootDir>/tsconfig.spec.json',
            stringifyContentPathRegex: '\\.html$',
        }],
    },
    transformIgnorePatterns: [
        'node_modules/(?!.*\\.mjs$|rxjs)',
    ],

    moduleNameMapper: {
        '^.+\\.(scss|sass|css)$': 'identity-obj-proxy',
        '^.+\\.html$': 'jest-transform-stub',
        '^rxjs$': 'rxjs',
        '^rxjs/(.*)$': 'rxjs/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },

    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

    roots: ['<rootDir>/src'],
};

export default config;
