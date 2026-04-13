// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tslint from 'typescript-eslint';
import jest from 'eslint-plugin-jest';

export default tslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'node_modules',
      'dist',
      // Legacy modules — not yet cleaned up for strict lint.
      // These will be enabled incrementally as each module is refactored.
      'src/playlists',
      'src/playlists-v2',
      'src/music',
      'src/contracts',
      'src/calendar',
      'src/company',
      'src/userGroups',
      'src/integrations',
      'src/busReactions',
      'src/print',
      'src/types',
      'src/auth',
      'src/user',
      'src/E2E',
      'src/utils',
    ],
  },
  eslint.configs.recommended,
  ...tslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/member-ordering': 'warn',
      'prettier/prettier': 'error',
    },
  },
  // 🔹 JEST - TEST CONFIGURATION
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { jest },
    ...jest.configs['flat/recommended'],
    rules: {
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    }
  },
);
