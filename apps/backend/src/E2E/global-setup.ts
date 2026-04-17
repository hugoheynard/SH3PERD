/**
 * Jest global setup — boots an in-memory MongoDB and seeds the app env
 * so the whole test suite is self-contained, runnable on a fresh CI
 * runner that has neither `.env.app` nor `keys/*.pem` on disk.
 *
 * This runs ONCE before any spec file.
 *
 * What it seeds:
 * - A `MongoMemoryServer` on a random port. The URI is written to
 *   `.e2e-mongo-uri` (temp file, gitignored) AND to `process.env.ATLAS_URI`.
 * - RSA key-pair written to `keys/private.pem` + `keys/public.pem` if
 *   those files don't already exist — `getAuthConfig()` reads them in
 *   non-prod mode, and they're gitignored so CI has no PEMs.
 * - Safe dummy values for every env var the app checks at module-load
 *   time (cookie config, TTLs, TOKEN_KEY, PORT). Never overrides a
 *   value the environment has already set.
 *
 * Teardown (`global-teardown.ts`) stops the server and cleans up.
 *
 * Configured in `jest.config.cjs` via:
 *   globalSetup: './src/E2E/global-setup.ts'
 *   globalTeardown: './src/E2E/global-teardown.ts'
 */

import { MongoMemoryServer } from 'mongodb-memory-server';

type E2EGlobal = typeof globalThis & {
  __MONGO_MEMORY_SERVER__?: MongoMemoryServer;
};

let mongod: MongoMemoryServer;

function setDefault(key: string, value: string): void {
  if (process.env[key] === undefined || process.env[key] === '') {
    process.env[key] = value;
  }
}

async function ensureTestKeys(): Promise<void> {
  const path = await import('node:path');
  const fs = await import('node:fs/promises');
  const { existsSync } = await import('node:fs');
  const { generateKeyPairSync } = await import('node:crypto');

  const keysDir = path.join(process.cwd(), 'keys');
  const privatePath = path.join(keysDir, 'private.pem');
  const publicPath = path.join(keysDir, 'public.pem');

  if (existsSync(privatePath) && existsSync(publicPath)) {
    return;
  }

  // Generate a throwaway RSA pair just for this test run. Never shipped,
  // never reused across runs — `getAuthConfig()` reads these files
  // synchronously when NODE_ENV !== 'production', which covers the
  // whole test suite.
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  await fs.mkdir(keysDir, { recursive: true });
  if (!existsSync(privatePath)) await fs.writeFile(privatePath, privateKey, 'utf-8');
  if (!existsSync(publicPath)) await fs.writeFile(publicPath, publicKey, 'utf-8');
  console.log('[E2E] Generated throwaway RSA keys in ./keys for this run');
}

export default async function globalSetup(): Promise<void> {
  mongod = await MongoMemoryServer.create({
    instance: {
      // Use a fixed DB name so all suites share the same server
      // (cheaper than one server per suite). Isolation is handled
      // by `resetAllCollections` between tests.
      dbName: 'sh3pherd_e2e',
    },
  });

  const uri = mongod.getUri();

  // Expose to all test workers via env vars. The bootstrap reads these.
  process.env['ATLAS_URI'] = uri;
  process.env['CORE_DB_NAME'] = 'sh3pherd_e2e';
  process.env['NODE_ENV'] = 'test';

  // Seed every other env var `loadEnv()` / module-load-time checks in
  // the app expect. `.env.app` and `.env.test` are gitignored (the repo
  // committed version points at prod Atlas), so on CI they simply
  // don't exist and we must feed the app from the process env.
  //
  // setDefault() never overrides values the surrounding env already
  // provides — useful locally when a dev does have a `.env.app` or
  // exports a different TOKEN_KEY.
  setDefault('PORT', '3000');
  setDefault('TOKEN_KEY', 'e2e-test-token-key-not-used-for-signing');
  setDefault('AUTH_TOKEN_TTL_MS', '86400000');
  setDefault('REFRESH_TOKEN_TTL_MS', '604800000');
  setDefault('COOKIE_HTTP_ONLY', 'true');
  setDefault('COOKIE_SAME_SITE', 'lax');
  setDefault('COOKIE_SECURE', 'false');
  setDefault('COOKIE_MAX_AGE', '604800000');
  setDefault('FRONTEND_URL', 'http://localhost:4200');

  // `getAuthConfig()` reads `keys/private.pem` + `keys/public.pem` in
  // non-prod mode. Those files are gitignored, so generate a throwaway
  // RSA pair if we don't already have one on disk.
  await ensureTestKeys();

  // Store the server instance on globalThis so teardown can access it.
  // Jest runs setup/teardown in separate worker contexts, so we use a
  // temp file as a side-channel for the URI.
  (globalThis as E2EGlobal).__MONGO_MEMORY_SERVER__ = mongod;

  // Also persist URI to a temp file for workers that don't share globalThis
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const tmpFile = path.join(process.cwd(), '.e2e-mongo-uri');
  await fs.writeFile(tmpFile, uri, 'utf-8');

  console.log(`\n[E2E] MongoMemoryServer started at ${uri}\n`);
}
