/**
 * Database cleanup utilities for E2E tests.
 *
 * Two strategies:
 *
 * 1. `resetAllCollections(db)` — nuclear: deletes all documents in
 *    all collections. Use in `beforeAll` / `afterAll` to start fresh.
 *
 * 2. `resetCollections(db, names)` — targeted: deletes documents in
 *    specific collections only. Use in `afterEach` when tests create
 *    data that shouldn't leak into the next test.
 *
 * Both are guarded by a NODE_ENV check so they can never accidentally
 * run against a production database.
 */

import type { Db } from 'mongodb';

const ALLOWED_ENVS = new Set(['test', 'e2e', 'ci']);

function assertTestEnv(): void {
  const env = process.env['NODE_ENV'] ?? '';
  if (!ALLOWED_ENVS.has(env)) {
    throw new Error(
      `[db-cleanup] Refusing to reset DB in NODE_ENV="${env}". ` +
        `Only allowed in: ${[...ALLOWED_ENVS].join(', ')}`,
    );
  }
}

/**
 * Delete all documents in ALL collections of the database.
 * Does not drop collections (preserves indexes).
 */
export async function resetAllCollections(db: Db): Promise<void> {
  assertTestEnv();
  const collections = await db.listCollections().toArray();
  await Promise.all(collections.map((col) => db.collection(col.name).deleteMany({})));
}

/**
 * Delete all documents in the specified collections only.
 * Useful for cleaning up between tests without nuking auth data.
 */
export async function resetCollections(db: Db, names: string[]): Promise<void> {
  assertTestEnv();
  await Promise.all(names.map((name) => db.collection(name).deleteMany({})));
}

/**
 * Music-specific cleanup: removes all music domain collections.
 * Call this in `afterAll` of music E2E tests.
 *
 * Collection names mirror the wiring in CoreRepositoriesModule —
 * keep them in sync with any future rename.
 */
export async function resetMusicCollections(db: Db): Promise<void> {
  await resetCollections(db, [
    'music_references',
    'music_repertoireEntries',
    'music_version',
    'music_tab_configs',
    'playlists',
    'playlist_tracks',
  ]);
}

/**
 * Company-specific cleanup: removes company + orgchart data.
 */
export async function resetCompanyCollections(db: Db): Promise<void> {
  await resetCollections(db, ['companies', 'contracts', 'org_nodes', 'guest_company']);
}

/**
 * Auth-specific cleanup: removes users + sessions.
 */
export async function resetAuthCollections(db: Db): Promise<void> {
  await resetCollections(db, [
    'user_credentials',
    'user_profiles',
    'user_preferences',
    'refresh_tokens',
    'platform_contracts',
  ]);
}
