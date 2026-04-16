import pkg from 'jest-preset-angular/presets/index.js';

const { createEsmPreset } = pkg;

const esModules = ['@angular', 'rxjs', 'zone.js'].join('|');

/** @type {import('jest').Config} */
export default {
  ...createEsmPreset(),
  testEnvironment: 'jsdom',
  setupFilesAfterEach: ['<rootDir>/setup-jest.ts'],
  transformIgnorePatterns: [`/node_modules/(?!(${esModules}))/`],
  modulePathIgnorePatterns: ['<rootDir>/.claude/worktrees/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
