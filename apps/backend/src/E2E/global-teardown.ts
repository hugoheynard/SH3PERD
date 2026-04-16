/**
 * Jest global teardown — stops the MongoMemoryServer.
 *
 * Called once after ALL test suites have finished.
 */

import type { MongoMemoryServer } from 'mongodb-memory-server';

type E2EGlobal = typeof globalThis & {
  __MONGO_MEMORY_SERVER__?: MongoMemoryServer;
};

export default async function globalTeardown(): Promise<void> {
  const mongod = (globalThis as E2EGlobal).__MONGO_MEMORY_SERVER__;

  if (mongod) {
    await mongod.stop();
    console.log('\n[E2E] MongoMemoryServer stopped.\n');
  }

  // Clean up the temp URI file
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    await fs.unlink(path.join(process.cwd(), '.e2e-mongo-uri'));
  } catch {
    // File might not exist if setup failed
  }
}
