/**
 * Jest global setup — starts a MongoMemoryServer before any test runs.
 *
 * The MongoDB URI is written to `process.env.ATLAS_URI` and persisted
 * in a global variable so `global-teardown.ts` can stop the server.
 *
 * This eliminates the requirement to have MongoDB running locally.
 * Tests are fully self-contained: `npm test` starts its own DB,
 * runs tests, stops the DB.
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
