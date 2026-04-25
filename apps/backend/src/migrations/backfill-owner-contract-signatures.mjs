/**
 * Migration: backfill synthesized signatures on owner contracts.
 *
 * Context: with the contract flow refactor (sh3-contracts.md) the
 * `/contracts/me` query and the lock rule now key off
 * `signatures.company`. Historical owner contracts were created with
 * status='active' but no signatures, which:
 *
 *   - hides them from /contracts/me (the founder loses workspace access)
 *   - breaks the invariant `status === 'active' ⇔ isFullySigned()`
 *
 * The fix in CreateCompanyCommand presigns both sides at creation time.
 * This migration applies the same fix to existing owner contracts.
 *
 * Scope (deliberately narrow):
 *   - status === 'active'
 *   - roles array contains 'owner'
 *   - signatures.company is missing
 *
 * Other contracts (RH/admin/artist agreements) are left untouched —
 * they legitimately start as drafts and progress through the normal
 * dual-sign flow.
 *
 * Idempotent: the filter excludes already-fixed contracts.
 *
 * Run with: node apps/backend/src/migrations/backfill-owner-contract-signatures.mjs
 */
import crypto from 'node:crypto';
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
  const contracts = db.collection('contracts');

  const candidates = await contracts
    .find({
      status: 'active',
      roles: 'owner',
      'signatures.company': { $exists: false },
    })
    .toArray();

  console.log(`Found ${candidates.length} owner contract(s) missing signatures`);

  if (candidates.length === 0) {
    console.log('Nothing to backfill — exiting.');
    process.exit(0);
  }

  let updated = 0;
  for (const c of candidates) {
    // Reuse the contract's own startDate as the signing timestamp so
    // the audit trail stays internally consistent (the founder
    // "signed" the moment the company was created).
    const signedAt = c.startDate ?? c.createdAt ?? new Date();
    const ownerSignerRoles = Array.isArray(c.roles)
      ? c.roles.filter((r) => ['owner', 'admin', 'rh'].includes(r))
      : ['owner'];

    const buildSig = (side) => ({
      signature_id: `signature_${crypto.randomUUID()}`,
      signed_at: signedAt,
      signed_by: c.user_id,
      signer_role: side,
      signed_by_roles: ownerSignerRoles.length ? ownerSignerRoles : ['owner'],
    });

    await contracts.updateOne(
      { _id: c._id },
      {
        $set: {
          'signatures.user': buildSig('user'),
          'signatures.company': buildSig('company'),
          updated_at: new Date(),
        },
      },
    );
    updated += 1;
    console.log(`  ✓ ${c.id}  user=${c.user_id}  company=${c.company_id}`);
  }

  console.log(`\nDone: ${updated} owner contract(s) backfilled.`);
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
} finally {
  await client.close();
}
