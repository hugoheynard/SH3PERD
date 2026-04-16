import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const builderPackagePath = require.resolve('@angular-builders/jest/package.json');
const builderDir = path.dirname(builderPackagePath);
const resolveBuilderPreset = (subpath) => require.resolve(`jest-preset-angular/${subpath}`, {
  paths: [builderDir],
});

const { createEsmPreset } = require(resolveBuilderPreset('presets'));
const preset = createEsmPreset();
const presetPackagePath = require.resolve('jest-preset-angular', { paths: [builderDir] });
const presetSerializers = [
  'build/serializers/html-comment',
  'build/serializers/ng-snapshot',
  'build/serializers/no-ng-attributes',
].map(resolveBuilderPreset);

const esModules = ['@angular', 'rxjs', 'zone.js'].join('|');

/** @type {import('jest').Config} */
export default {
  ...preset,
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  snapshotSerializers: presetSerializers,
  transformIgnorePatterns: [`/node_modules/(?!(${esModules}))/`],
  modulePathIgnorePatterns: ['<rootDir>/.claude/worktrees/'],
  transform: {
    '^.+\\.(ts|js|html|svg)$': [
      presetPackagePath,
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    ...(preset.moduleNameMapper || {}),
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
