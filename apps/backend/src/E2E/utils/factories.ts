/**
 * DB Factories — direct MongoDB inserts using domain entities.
 *
 * ## Principle: always use entities
 *
 * Factories construct domain entities via their real constructors,
 * then insert `entity.toDomain` into MongoDB. This guarantees:
 *
 * - **Schema fidelity**: if the entity evolves (new required field,
 *   renamed field), the factory breaks at compile time — not silently.
 * - **Invariant enforcement**: entity constructors validate (non-empty
 *   name, valid status, etc.) — test data passes the same checks as
 *   production data.
 * - **ID format correctness**: the base `Entity` class generates IDs
 *   with the right prefix (`userCredential_`, `company_`, etc.).
 *
 * ## Never insert raw objects
 *
 * ```ts
 * // ❌ BAD — hardcoded fields, can drift from the real schema
 * await db.collection('user_credentials').insertOne({ id: 'user_xxx', ... });
 *
 * // ✅ GOOD — constructed via the domain entity
 * const entity = new UserCredentialEntity({ email, password, ... });
 * await db.collection('user_credentials').insertOne(entity.toDomain);
 * ```
 *
 * ## Performance
 *
 * Factories are ~300× faster than HTTP builders (WorkspaceSetup) because
 * they bypass the HTTP stack entirely. A full workspace seed takes ~10 ms.
 *
 * ## Usage
 *
 * ```ts
 * const seed = await seedWorkspace(db, { companyName: 'Studio X' });
 * // seed.userId, seed.companyId, seed.contractId, seed.authHeader
 * ```
 */

import * as jwt from 'jsonwebtoken';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Db } from 'mongodb';
import type { TCompanyId, TContractId, TUserId } from '@sh3pherd/shared-types';
import { TCompanyStatus } from '@sh3pherd/shared-types';
import { UserCredentialEntity } from '../../user/domain/UserCredential.entity.js';
import { UserProfileEntity } from '../../user/domain/UserProfileEntity.js';
import { UserPreferences } from '../../user/domain/UserPreferences.entity.js';
import { PlatformContractEntity } from '../../platform-contract/domain/PlatformContractEntity.js';
import { CompanyEntity } from '../../company/domain/CompanyEntity.js';
import { ContractEntity } from '../../contracts/domain/ContractEntity.js';

// ── JWT signing ─────────────────────────────────────────────

/**
 * Sign a test JWT using the app's RSA private key — the AuthGuard
 * accepts it as a valid token.
 */
function signTestToken(uid: string): string {
  const keyPath = join(process.cwd(), 'keys', 'private.pem');
  try {
    const privateKey = readFileSync(keyPath, 'utf-8');
    return jwt.sign({ user_id: uid }, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
    });
  } catch {
    throw new Error(
      `[Factories] Cannot sign test JWT: private key not found at ${keyPath}. ` +
      `Make sure the keys/ directory exists in apps/backend/.`,
    );
  }
}

// ── Result types ────────────────────────────────────────────

export interface SeededUser {
  userId: TUserId;
  email: string;
  authToken: string;
  authHeader: string;
}

export interface SeededWorkspace extends SeededUser {
  companyId: TCompanyId;
  companyName: string;
  contractId: TContractId;
  contractHeader: Record<string, string>;
}

// ── User Factory ────────────────────────────────────────────

export async function seedUser(
  db: Db,
  overrides: { email?: string; firstName?: string; lastName?: string } = {},
): Promise<SeededUser> {
  const email = overrides.email ?? `factory-${crypto.randomUUID().slice(0, 8)}@e2e.local`;
  const firstName = overrides.firstName ?? 'Factory';
  const lastName = overrides.lastName ?? 'User';

  // Construct entities via their real constructors
  const credential = new UserCredentialEntity({
    email,
    password: '$argon2id$v=19$m=65536,t=3,p=4$fakehashfortesting',
    active: true,
    email_verified: false,
    is_guest: false,
  });

  const profile = new UserProfileEntity({
    user_id: credential.id as TUserId,
    first_name: firstName,
    last_name: lastName,
    active: true,
  });

  const preferences = new UserPreferences({
    user_id: credential.id as TUserId,
    theme: 'dark',
    contract_workspace: '' as TContractId,
  });

  // Every user gets a platform contract at registration (SaaS subscription)
  const platformContract = new PlatformContractEntity({
    user_id: credential.id as TUserId,
    plan: 'plan_free',
    status: 'active',
    startDate: new Date(),
  });

  // Insert the entity snapshots into MongoDB
  await db.collection('user_credentials').insertOne(credential.toDomain);
  await db.collection('user_profiles').insertOne(profile.toDomain);
  await db.collection('user_preferences').insertOne(preferences.toDomain);
  await db.collection('platform_contracts').insertOne(platformContract.toDomain);

  const authToken = signTestToken(credential.id);

  return {
    userId: credential.id as TUserId,
    email,
    authToken,
    authHeader: `Bearer ${authToken}`,
  };
}

// ── Company + Contract Factory ──────────────────────────────

export async function seedCompany(
  db: Db,
  ownerId: TUserId,
  overrides: { name?: string } = {},
): Promise<{ companyId: TCompanyId; contractId: TContractId; companyName: string }> {
  const name = overrides.name ?? 'Factory Company';

  const company = new CompanyEntity({
    owner_id: ownerId,
    name,
    description: '',
    address: { street: '', city: '', zip: '', country: '' },
    orgLayers: CompanyEntity.DEFAULT_ORG_LAYERS,
    status: TCompanyStatus.ACTIVE,
  });

  const contract = new ContractEntity({
    user_id: ownerId,
    company_id: company.id as TCompanyId,
    roles: ['owner'],
    status: 'active',
    startDate: new Date(),
  });

  await db.collection('companies').insertOne(company.toDomain);
  await db.collection('contracts').insertOne(contract.toDomain);

  // Set the contract as the active workspace in user preferences
  await db.collection('user_preferences').updateOne(
    { user_id: ownerId },
    { $set: { contract_workspace: contract.id } },
  );

  return {
    companyId: company.id as TCompanyId,
    contractId: contract.id as TContractId,
    companyName: name,
  };
}

// ── Full Workspace Factory ──────────────────────────────────

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
