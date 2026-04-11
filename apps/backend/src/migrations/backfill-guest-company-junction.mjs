/**
 * Migration: backfill the `guest_company` junction collection from existing data.
 *
 * Context: guests used to be global (no company link). With the new approach, a guest
 * belongs to one or more companies via the `guest_company` collection. This migration
 * walks all org nodes, finds guest users that are active members, and creates a
 * (user_id, company_id) link for each unique pair.
 *
 * Idempotent: running it twice produces the same state.
 *
 * Run with: node apps/backend/src/migrations/backfill-guest-company-junction.mjs
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

  const credentials = db.collection('user_credentials');
  const orgNodes = db.collection('org_nodes');
  const guestCompany = db.collection('guest_company');

  // 1. Collect all guest user IDs
  const guestCreds = await credentials.find({ is_guest: true }, { projection: { id: 1 } }).toArray();
  const guestIds = new Set(guestCreds.map(c => c.id));
  console.log(`Found ${guestIds.size} guest users`);

  if (guestIds.size === 0) {
    console.log('No guests to migrate — exiting.');
    process.exit(0);
  }

  // 2. Walk org nodes, collect unique (user_id, company_id) pairs where user is a guest
  const nodes = await orgNodes.find(
    { status: 'active' },
    { projection: { company_id: 1, members: 1 } },
  ).toArray();

  const pairs = new Map(); // key: `${userId}|${companyId}`, value: { user_id, company_id }
  for (const node of nodes) {
    const companyId = node.company_id;
    if (!companyId || !Array.isArray(node.members)) continue;
    for (const m of node.members) {
      if (m.leftAt) continue; // only active memberships
      if (!guestIds.has(m.user_id)) continue;
      const key = `${m.user_id}|${companyId}`;
      if (!pairs.has(key)) {
        pairs.set(key, { user_id: m.user_id, company_id: companyId });
      }
    }
  }

  console.log(`Found ${pairs.size} unique (guest, company) pairs from org node memberships`);

  // 3. Upsert each pair into guest_company (idempotent)
  let created = 0;
  let skipped = 0;
  const now = new Date();
  for (const pair of pairs.values()) {
    const existing = await guestCompany.findOne({
      user_id: pair.user_id,
      company_id: pair.company_id,
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    await guestCompany.insertOne({
      user_id: pair.user_id,
      company_id: pair.company_id,
      created_at: now,
    });
    created += 1;
  }

  console.log(`\nDone: ${created} links created, ${skipped} already existed.`);
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
} finally {
  await client.close();
}
