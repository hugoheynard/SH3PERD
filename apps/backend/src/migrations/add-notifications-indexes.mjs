/**
 * Migration: add required MongoDB indexes on `notifications`.
 *
 * Rationale
 * ---------
 * Two hot queries on this collection once the feature ships:
 *
 * 1. Listing — `findByUserId` in `NotificationMongoRepository`. Filter
 *    `{ user_id, createdAt?: { $lt: before } }` with sort `{ createdAt: -1 }`
 *    and a small `limit`. Hit on every inbox open + every paginated scroll.
 * 2. Unread count — `countUnreadByUserId`. Filter `{ user_id, read: false }`.
 *    Hit on every inbox open and on every live socket event (the client
 *    refreshes its badge from the server-returned count, not from a stale
 *    local counter).
 *
 * Indexes
 * -------
 * - `{ user_id: 1, createdAt: -1 }` covers the listing sort+filter. Mongo
 *   also uses it as a prefix for any `user_id`-only query.
 * - `{ user_id: 1, read: 1 }` covers the unread count. A partial index on
 *   `read = false` would be slightly tighter, but the cardinality of
 *   `read` is only 2 values — the regular compound index is simpler and
 *   still avoids scanning read rows thanks to the equality prefix.
 *
 * No unique index: two notifications for the same user at the same ms are
 * legitimate (e.g. a batch import firing multiple domain events).
 *
 * Idempotent: `createIndex` is a no-op if the index already exists with
 * the same spec. Safe to re-run.
 *
 * Run with:
 *   node apps/backend/src/migrations/add-notifications-indexes.mjs
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(root, '.env.app') });
dotenv.config({ path: path.join(root, '.env.dev'), override: true });

const uri = process.env.ATLAS_URI;
const dbName = process.env.CORE_DB_NAME;

if (!uri || !dbName) {
  console.error('Missing ATLAS_URI or CORE_DB_NAME');
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('notifications');

  console.log('Creating index on (user_id, createdAt desc)…');
  const listingIdx = await col.createIndex(
    { user_id: 1, createdAt: -1 },
    { name: 'user_id_1_createdAt_-1' },
  );
  console.log(`Done: index "${listingIdx}" is in place.`);

  console.log('Creating index on (user_id, read)…');
  const unreadIdx = await col.createIndex({ user_id: 1, read: 1 }, { name: 'user_id_1_read_1' });
  console.log(`Done: index "${unreadIdx}" is in place.`);

  const existing = await col.indexes();
  console.log('\nCurrent indexes on notifications:');
  for (const idx of existing) {
    console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}${idx.unique ? '  (unique)' : ''}`);
  }
} catch (err) {
  console.error('Index creation failed:', err);
  process.exit(1);
} finally {
  await client.close();
}
