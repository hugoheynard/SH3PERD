/**
 * Migration: create platform contracts for existing users.
 *
 * Every user needs a platform contract (SaaS subscription) for the
 * @PlatformScoped() guard to resolve. New users get one at registration,
 * but existing users registered before this feature need a backfill.
 *
 * Idempotent: skips users who already have a platform contract.
 *
 * Run with: node apps/backend/src/migrations/add-platform-contracts.mjs
 */
import { MongoClient } from 'mongodb';
import { randomUUID } from 'node:crypto';
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

  const credentials = db.collection('user_credentials');
  const platformContracts = db.collection('platform_contracts');

  // Get all user IDs
  const allUsers = await credentials.find({}, { projection: { id: 1 } }).toArray();
  console.log(`Found ${allUsers.length} users`);

  // Get users who already have a platform contract
  const existingContracts = await platformContracts.find(
    {},
    { projection: { user_id: 1 } },
  ).toArray();
  const usersWithContract = new Set(existingContracts.map(c => c.user_id));
  console.log(`${usersWithContract.size} already have a platform contract`);

  // Create platform contracts for users missing one
  const now = new Date();
  let created = 0;

  for (const user of allUsers) {
    if (usersWithContract.has(user.id)) continue;

    await platformContracts.insertOne({
      id: `platformContract_${randomUUID()}`,
      user_id: user.id,
      account_type: 'artist',
      plan: 'artist_free',
      status: 'active',
      startDate: now,
      created_at: now,
      updated_at: now,
    });
    created++;
  }

  console.log(`\nDone: ${created} platform contracts created, ${usersWithContract.size} already existed.`);
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
} finally {
  await client.close();
}
