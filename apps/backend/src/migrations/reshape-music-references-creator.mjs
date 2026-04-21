/**
 * Migration: reshape `music_references` documents to the new contribution schema.
 *
 * Before:
 *   { id, title, artist, owner_id }
 *
 * After:
 *   { id, title, artist, creator: { type: 'user', id: <owner_id> }, created_at }
 *
 * Rationale: references are community-contributed, immutable user-side. The old
 * `owner_id` was a misnomer (there is no ownership) and is promoted to a
 * `creator` contribution marker. `created_at` is added for the contribution
 * timeline. See `apps/backend/src/music/domain/entities/MusicReferenceEntity.ts`
 * and `packages/shared-types/src/music-references.types.ts` for the new shape.
 *
 * Mapping decisions:
 * - `owner_id` is a `TUserId` (actually `userCredential_…` at runtime) → maps to
 *   `creator: { type: 'user', id: owner_id }`. No heuristic to detect system
 *   imports retroactively because the current codebase only creates references
 *   from authenticated users.
 * - `created_at` has no predecessor. We fall back to a dedicated historical
 *   anchor (`2026-04-21T00:00:00Z`, the day this schema lands) so the
 *   contribution timeline is clearly separated from post-migration contributions.
 *   If you already have the original insertion date from `analytics_events`
 *   (`type: 'music_reference_created'`), uncomment the lookup branch below for
 *   a higher-fidelity timeline.
 *
 * Idempotent: skips documents that already have `creator` set. Safe to re-run.
 *
 * Run with:
 *   node apps/backend/src/migrations/reshape-music-references-creator.mjs
 *   node apps/backend/src/migrations/reshape-music-references-creator.mjs --dry-run
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(root, '.env.app') });
dotenv.config({ path: path.join(root, '.env.dev'), override: true });

const DRY_RUN = process.argv.includes('--dry-run');
const FALLBACK_CREATED_AT = new Date('2026-04-21T00:00:00.000Z');

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
  const refs = db.collection('music_references');
  const events = db.collection('analytics_events');

  // Targets: legacy documents (owner_id present, creator missing).
  const legacyFilter = { owner_id: { $exists: true }, creator: { $exists: false } };
  const total = await refs.countDocuments(legacyFilter);
  console.log(`Found ${total} legacy music_references to reshape${DRY_RUN ? ' (dry run)' : ''}`);

  if (total === 0) {
    console.log('Nothing to do.');
    process.exit(0);
  }

  let migrated = 0;
  let skipped = 0;
  const cursor = refs.find(legacyFilter);

  for await (const doc of cursor) {
    if (typeof doc.owner_id !== 'string' || !doc.owner_id) {
      console.warn(`Skipping ${doc.id ?? doc._id}: missing or invalid owner_id`);
      skipped++;
      continue;
    }

    // Prefer the original `music_reference_created` analytics timestamp when available.
    const originEvent = await events.findOne(
      { type: 'music_reference_created', 'metadata.reference_id': doc.id },
      { projection: { timestamp: 1 }, sort: { timestamp: 1 } },
    );
    const createdAt = originEvent?.timestamp ?? FALLBACK_CREATED_AT;

    const update = {
      $set: {
        creator: { type: 'user', id: doc.owner_id },
        created_at: createdAt,
      },
      $unset: { owner_id: '' },
    };

    if (DRY_RUN) {
      console.log(
        `[dry-run] ${doc.id}: owner_id=${doc.owner_id} → creator.user, created_at=${createdAt.toISOString()}`,
      );
    } else {
      await refs.updateOne({ _id: doc._id }, update);
    }
    migrated++;
  }

  console.log(
    `\nDone: ${migrated} references reshaped, ${skipped} skipped${DRY_RUN ? ' (dry run, no writes)' : ''}.`,
  );
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
} finally {
  await client.close();
}
