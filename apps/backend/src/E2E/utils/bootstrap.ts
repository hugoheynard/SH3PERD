/**
 * E2E test application bootstrap.
 *
 * Creates a fully initialized NestJS application instance that mirrors
 * the production app (same modules, guards, middleware) but connects
 * to the MongoMemoryServer instance started by `global-setup.ts`.
 *
 * ## MongoDB in-memory
 *
 * `global-setup.ts` starts a MongoMemoryServer and writes the URI to
 * a temp file (`.e2e-mongo-uri`). This bootstrap reads that URI and
 * injects it into `process.env.ATLAS_URI` before the app boots. No
 * external MongoDB installation is required.
 *
 * ## Throttler bypass
 *
 * The `ThrottlerGuard` is patched after `app.init()` so it always
 * passes. This prevents per-endpoint `@Throttle()` decorators
 * (e.g. auth register has limit: 3) from causing 429s in tests.
 *
 * Usage:
 *   const { app, db } = await bootstrapE2E();
 *   // ... run tests ...
 *   await teardownE2E(app);
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../../appBootstrap/app.module.js';
import { loadEnv } from '../../appBootstrap/config/loadEnv.js';
import { MONGO_CLIENT } from '../../appBootstrap/database/db.tokens.js';
import cookieParser from 'cookie-parser';
import type { INestApplication } from '@nestjs/common';
import type { Db, MongoClient } from 'mongodb';

export type E2EContext = {
  app: INestApplication;
  db: Db;
};

/**
 * Boot the test app and return it alongside the test DB handle.
 */
export async function bootstrapE2E(): Promise<E2EContext> {
  // Read the in-memory MongoDB URI from the temp file written by global-setup.
  // Fall back to env vars / localhost if the file doesn't exist (allows
  // running against a real MongoDB for integration/staging tests).
  try {
    const uriFile = join(process.cwd(), '.e2e-mongo-uri');
    const uri = readFileSync(uriFile, 'utf-8').trim();
    if (uri) {
      process.env['ATLAS_URI'] = uri;
      process.env['CORE_DB_NAME'] = 'sh3pherd_e2e';
    }
  } catch {
    // No temp file — use whatever ATLAS_URI is already set (e.g. real MongoDB)
  }

  process.env['NODE_ENV'] = 'test';
  loadEnv(process.env['NODE_ENV']);

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  await app.init();

  // ── Disable throttling ─────────────────────────────────
  // The @Throttle() decorator on individual endpoints overrides the
  // global ThrottlerModule config. The only reliable bypass after
  // init: patch canActivate on the resolved guard instance(s).
  try {
    const guards = app.get(APP_GUARD, { strict: false });
    const allGuards = Array.isArray(guards) ? guards : [guards];
    for (const guard of allGuards) {
      if (guard instanceof ThrottlerGuard || guard?.constructor?.name === 'ThrottlerGuard') {
        guard.canActivate = () => Promise.resolve(true);
      }
    }
  } catch {
    ThrottlerGuard.prototype.canActivate = () => Promise.resolve(true);
  }

  const mongoClient: MongoClient = app.get(MONGO_CLIENT);
  const dbName = process.env['CORE_DB_NAME'] ?? 'sh3pherd_e2e';
  const db = mongoClient.db(dbName);

  return { app, db };
}

/**
 * Clean shutdown: close the NestJS app (which closes the Mongo
 * connection pool, the TCP client proxies, etc.).
 */
export async function teardownE2E(app: INestApplication): Promise<void> {
  await app.close();
}
