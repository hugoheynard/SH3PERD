/**
 * Migration: add required MongoDB indexes on `contracts`.
 *
 * Rationale
 * ---------
 * Two hot queries / invariants once the recipient flow ships:
 *
 * 1. `GET /contracts/me` — filter `{ user_id, signatures.company: { $exists: true } }`
 *    (cf. GetCurrentUserContractsQuery). Hit on every artist
 *    workspace-switcher and every contract list view.
 *
 * 2. One open contract per (user, company) — invariant enforced
 *    in code by CreateContractCommand. Without a unique index, two
 *    concurrent creates can both pass the in-code check and end up
 *    writing duplicate non-terminated contracts.
 *
 * Indexes
 * -------
 * - `{ user_id: 1, 'signatures.company': 1 }` — covers the visibility
 *   filter. The user_id prefix also serves any pure user_id lookup.
 * - Partial unique index `{ user_id: 1, company_id: 1 }` filtered to
 *   `status: { $in: ['draft', 'active'] }` — enforces the invariant
 *   at the storage layer and protects against the race condition.
 *   Terminated contracts are excluded from the constraint, so a new
 *   agreement after termination is still allowed.
 *
 * Idempotent: `createIndex` is a no-op if the index already exists
 * with the same spec.
 *
 * Run with:
 *   node apps/backend/src/migrations/add-contracts-indexes.mjs
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
  const col = db.collection('contracts');

  console.log('Creating index on (user_id, signatures.company)…');
  const visibilityIdx = await col.createIndex(
    { user_id: 1, 'signatures.company': 1 },
    { name: 'user_id_1_signatures.company_1' },
  );
  console.log(`Done: index "${visibilityIdx}" is in place.`);

  console.log(
    'Creating partial unique index on (user_id, company_id) where status in [draft, active]…',
  );
  const uniqIdx = await col.createIndex(
    { user_id: 1, company_id: 1 },
    {
      name: 'user_company_open_unique',
      unique: true,
      partialFilterExpression: {
        status: { $in: ['draft', 'active'] },
      },
    },
  );
  console.log(`Done: index "${uniqIdx}" is in place.`);

  const existing = await col.indexes();
  console.log('\nCurrent indexes on contracts:');
  for (const idx of existing) {
    const flags = [
      idx.unique ? 'unique' : null,
      idx.partialFilterExpression
        ? `partial(${JSON.stringify(idx.partialFilterExpression)})`
        : null,
    ]
      .filter(Boolean)
      .join(', ');
    console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}${flags ? `  [${flags}]` : ''}`);
  }
} catch (err) {
  console.error('Index creation failed:', err);
  process.exit(1);
} finally {
  await client.close();
}
