import { createEsmPreset } from 'jest-preset-angular/presets';

const preset = createEsmPreset();

const esModules = ['@angular', 'rxjs', 'zone.js'].join('|');

/** @type {import('jest').Config} */
export default {
  ...preset,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  transformIgnorePatterns: [`/node_modules/(?!(${esModules}))/`],
  transform: {
    ...preset.transform,
    '^.+\\.(ts|html)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$'
      }
    ]
  },
  moduleNameMapper: {
    ...(preset.moduleNameMapper || {}),
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
