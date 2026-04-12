/**
 * DB Factories — direct MongoDB inserts for fast test seeding.
 *
 * ## Why factories instead of HTTP calls?
 *
 * `WorkspaceSetup.build()` does 4 HTTP round-trips (register, login,
 * create company, set preferences) → ~3 seconds. That's fine for a
 * few tests but becomes the bottleneck in a 100-test suite.
 *
 * Factories insert directly into MongoDB collections, bypassing the
 * HTTP stack entirely. A full workspace seed takes ~10 ms instead of
 * ~3000 ms — 300× faster.
 *
 * ## When to use factories vs. WorkspaceSetup
 *
 * - **WorkspaceSetup** — tests that verify the HTTP flow itself (auth,
 *   company creation, contract scoping). The setup IS the test.
 * - **Factories** — tests that need a pre-existing workspace as context
 *   but are testing something else (music CRUD, orgchart mutations).
 *   The setup is overhead; the test is the feature.
 *
 * ## Usage
 *
 * ```ts
 * const seed = await seedWorkspace(db, { companyName: 'Studio X' });
 * // seed.userId, seed.companyId, seed.contractId
 * // seed.authToken — a valid JWT for this user
 * // seed.authHeader — 'Bearer ...'
 * ```
 */

import { randomUUID } from 'node:crypto';
import * as jwt from 'jsonwebtoken';
import type { Db } from 'mongodb';

// ── ID generators (matching the app's prefix patterns) ──────

// ID prefixes match what the real entities generate
const userId = () => `userCredential_${randomUUID()}`;
const companyId = () => `company_${randomUUID()}`;
const contractId = () => `contract_${randomUUID()}`;
const profileId = () => `profile_${randomUUID()}`;
const preferencesId = () => `userPref_${randomUUID()}`;

// ── JWT signing for factories ───────────────────────────────

/**
 * Sign a fake auth token that the AuthGuard will accept.
 * Uses the same private key as the app (loaded from env / keys/).
 *
 * If the key isn't available (MongoMemoryServer env), falls back to
 * a symmetric HMAC secret that must match what loadEnv() provides.
 */
function signTestToken(uid: string): string {
  const fs = require('node:fs');
  const path = require('node:path');

  // Try RSA key first (same as production auth)
  const keyPath = path.join(process.cwd(), 'keys', 'private.pem');
  try {
    const privateKey = fs.readFileSync(keyPath, 'utf-8');
    return jwt.sign({ user_id: uid }, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
    });
  } catch {
    // No key file — this shouldn't happen in a properly configured
    // test env, but we throw explicitly so the error is clear.
    throw new Error(
      `[Factories] Cannot sign test JWT: private key not found at ${keyPath}. ` +
      `Make sure the keys/ directory exists in apps/backend/.`,
    );
  }
}

// ── Factory types ───────────────────────────────────────────

export interface SeededUser {
  userId: string;
  email: string;
  authToken: string;
  authHeader: string;
}

export interface SeededWorkspace extends SeededUser {
  companyId: string;
  companyName: string;
  contractId: string;
  contractHeader: Record<string, string>;
}

// ── User Factory ────────────────────────────────────────────

export async function seedUser(
  db: Db,
  overrides: { email?: string; firstName?: string; lastName?: string } = {},
): Promise<SeededUser> {
  const uid = userId();
  const email = overrides.email ?? `factory-${randomUUID().slice(0, 8)}@e2e.local`;
  const firstName = overrides.firstName ?? 'Factory';
  const lastName = overrides.lastName ?? 'User';

  // Insert credentials (password hash not needed — we sign the JWT directly)
  await db.collection('user_credentials').insertOne({
    id: uid,
    email,
    password: '$argon2id$v=19$m=65536,t=3,p=4$fakehashfortesting',
    active: true,
    email_verified: false,
    is_guest: false,
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Insert profile
  await db.collection('user_profiles').insertOne({
    id: profileId(),
    user_id: uid,
    first_name: firstName,
    last_name: lastName,
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Insert preferences
  await db.collection('user_preferences').insertOne({
    id: preferencesId(),
    user_id: uid,
    theme: 'dark',
    created_at: new Date(),
    updated_at: new Date(),
  });

  const authToken = signTestToken(uid);

  return {
    userId: uid,
    email,
    authToken,
    authHeader: `Bearer ${authToken}`,
  };
}

// ── Company + Contract Factory ──────────────────────────────

export async function seedCompany(
  db: Db,
  ownerId: string,
  overrides: { name?: string } = {},
): Promise<{ companyId: string; contractId: string; companyName: string }> {
  const cid = companyId();
  const ctid = contractId();
  const name = overrides.name ?? 'Factory Company';

  // Insert company
  await db.collection('companies').insertOne({
    id: cid,
    name,
    owner_id: ownerId,
    description: '',
    address: { street: '', city: '', zip: '', country: '' },
    orgLayers: ['Department', 'Team', 'Sub-team'],
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Insert owner contract
  await db.collection('contracts').insertOne({
    id: ctid,
    user_id: ownerId,
    company_id: cid,
    roles: ['owner'],
    status: 'active',
    startDate: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Set the contract as the active workspace
  await db.collection('user_preferences').updateOne(
    { user_id: ownerId },
    { $set: { contract_workspace: ctid } },
  );

  return { companyId: cid, contractId: ctid, companyName: name };
}

// ── Full Workspace Factory (user + company + contract) ──────

export async function seedWorkspace(
  db: Db,
  overrides: {
    email?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
  } = {},
): Promise<SeededWorkspace> {
  const user = await seedUser(db, overrides);
  const company = await seedCompany(db, user.userId, {
    name: overrides.companyName,
  });

  return {
    ...user,
    ...company,
    contractHeader: { 'X-Contract-Id': company.contractId },
  };
}
