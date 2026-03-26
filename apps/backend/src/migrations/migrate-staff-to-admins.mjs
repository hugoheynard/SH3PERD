/**
 * Migration: rename `staff` field to `admins` in companies collection
 * Run with: node src/migrations/migrate-staff-to-admins.mjs
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
  const companies = db.collection('companies');

  // Rename staff → admins (only where staff exists and admins doesn't)
  const r1 = await companies.updateMany(
    { staff: { $exists: true }, admins: { $exists: false } },
    [{ $set: { admins: '$staff' } }, { $unset: 'staff' }]
  );
  console.log(`✅ Migrated ${r1.modifiedCount} documents (staff → admins)`);

  // Ensure admins field exists (default to [] for docs that have neither)
  const r2 = await companies.updateMany(
    { admins: { $exists: false } },
    { $set: { admins: [] } }
  );
  console.log(`✅ Fixed ${r2.modifiedCount} documents (missing admins → [])`);

  // Ensure services field exists
  const r3 = await companies.updateMany(
    { services: { $exists: false } },
    { $set: { services: [] } }
  );
  console.log(`✅ Fixed ${r3.modifiedCount} documents (missing services → [])`);

  // Remove leftover staff field if any
  const r4 = await companies.updateMany(
    { staff: { $exists: true } },
    { $unset: { staff: '' } }
  );
  console.log(`✅ Cleaned ${r4.modifiedCount} documents (removed residual staff field)`);

  // Verify state
  const sample = await companies.find({}, { projection: { name: 1, admins: 1, staff: 1, services: 1 } }).toArray();
  console.log('\nCurrent state:');
  sample.forEach(d => {
    console.log(`  ${d.name}: admins=${d.admins?.length ?? 'MISSING'}, staff=${d.staff ?? 'gone'}, services=${d.services?.length ?? 'MISSING'}`);
  });

} finally {
  await client.close();
}
