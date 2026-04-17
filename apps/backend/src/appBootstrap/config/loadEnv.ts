console.log('[ENV] loadEnv file loaded');

/**
 * Loads environment variables from `.env.app` + `.env.{env}`
 *
 * @param envName - 'dev' | 'prod' | 'test'
 */
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import process from 'process';

console.log('[ENV] loadEnv file loaded');

/**
 * Loads environment variables from `.env.app` + `.env.{env}`
 * @param envName - Environment name (e.g. 'dev', 'prod')
 */
export const loadEnv = (envName: string = process.env['NODE_ENV'] ?? 'dev'): void => {
  const baseEnvPath = path.resolve(process.cwd(), '.env.app');
  const envSpecificPath = path.resolve(process.cwd(), `.env.${envName}`);

  const isTest = envName === 'test';

  [baseEnvPath, envSpecificPath].forEach((envPath) => {
    if (fs.existsSync(envPath)) {
      // In dev/prod, `.env.app` is the source of truth, so override any
      // pre-existing values in the environment.
      //
      // In test mode however, the jest globalSetup (`src/E2E/global-setup.ts`)
      // has already seeded `ATLAS_URI`, `CORE_DB_NAME`, `NODE_ENV` and the
      // auth/cookie defaults with values pointing at the MongoMemoryReplSet.
      // A developer's local `.env.app` typically points `ATLAS_URI` at a
      // real Atlas cluster (staging or prod); overriding with `override:
      // true` here would silently redirect the whole E2E suite at that real
      // DB — tests pass in CI (no `.env.app` present) but fail or corrupt
      // data locally. We therefore load in "merge" mode under test (only
      // fill blanks) so the seed from globalSetup wins.
      dotenv.config({ path: envPath, override: !isTest });
    } else if (isTest) {
      // In test mode, `.env.app` / `.env.test` are optional — CI and the
      // jest globalSetup seed the required variables programmatically so
      // the suite never needs a developer's secrets on disk. Log and
      // continue; the validation below still catches missing required
      // vars regardless of whether they came from a file or the env.
      console.log(`[ENV] Skipping missing ${envPath} (test mode, env-seeded)`);
    } else {
      throw new Error(`[ENV] Missing environment file: ${envPath}`);
    }
  });

  // ✅ Validate required variables
  const requiredVars = ['PORT', 'ATLAS_URI', 'CORE_DB_NAME'];
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`[ENV] Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log(`✅ [ENV] Environment loaded for '${envName}'`);
};
