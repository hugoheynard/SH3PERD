/**
 * Migration: add required MongoDB indexes on `music_repertoire`.
 *
 * Rationale
 * ---------
 * The entity `MusicRepertoireEntry` is a many-to-one ownership link between a
 * user and a music reference. Two operations hit the collection on every write:
 *
 * 1. Idempotency check in `CreateRepertoireEntryHandler` — `findByOwnerAndReference`.
 * 2. Aggregate load in `RepertoireEntryAggregateRepository.loadByOwnerAndReference`
 *    (called by every track / version / master / delete flow).
 *
 * Both query on the compound key `{ owner_id, musicReference_id }`. Without an
 * index this is a collection scan past a few thousand entries. The unique
 * constraint is also the safety net that prevents a race between two concurrent
 * POSTs from creating duplicate entries for the same (user, reference) pair —
 * the idempotency pre-check is best-effort, the unique index is authoritative.
 *
 * A secondary index on `owner_id` alone would also cover `findByUserId`
 * (`GET /library/me`), but MongoDB can use the compound index as a prefix
 * when filtering on `owner_id`, so we don't need a second one.
 *
 * Idempotent: `createIndex` is a no-op if the index already exists with the
 * same spec. Safe to re-run.
 *
 * Run with:
 *   node apps/backend/src/migrations/add-music-repertoire-indexes.mjs
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
  const col = db.collection('music_repertoire');

  console.log('Creating unique compound index on (owner_id, musicReference_id)…');
  const indexName = await col.createIndex(
    { owner_id: 1, musicReference_id: 1 },
    { unique: true, name: 'owner_id_1_musicReference_id_1' },
  );
  console.log(`Done: index "${indexName}" is in place.`);

  const existing = await col.indexes();
  console.log('\nCurrent indexes on music_repertoire:');
  for (const idx of existing) {
    console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}${idx.unique ? '  (unique)' : ''}`);
  }
} catch (err) {
  // Typical cause: pre-existing duplicate docs preventing a unique-index build.
  // The error message will list the conflicting docs — clean them up (dedup
  // manually or via a separate script) and re-run.
  console.error('Index creation failed:', err);
  process.exit(1);
} finally {
  await client.close();
}
