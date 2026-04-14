import { z } from 'zod';
import { SAccountType, SPlatformRole } from './permissions.types.js';
import type { TAccountType, TPlatformRole } from './permissions.types.js';
import type { TUserId } from './ids.js';

// ─── Platform Contract Domain Model ─────────────────────

/**
 * A platform contract represents a user's SaaS subscription.
 *
 * Every user gets one at registration (defaulting to `artist_free`
 * or `company_free` based on the chosen account type).
 * It lives in a dedicated `platform_contracts` collection, separate
 * from company contracts. One user = one platform contract.
 *
 * The `plan` field determines which permissions the user has for
 * personal features via `PLATFORM_ROLE_TEMPLATES`.
 *
 * The `account_type` field locks the plan family — an artist account
 * can only upgrade within artist plans, a company account within
 * company plans. This is set at registration and never changes.
 */
export interface TPlatformContractDomainModel {
  id: string;
  user_id: TUserId;
  /** Determined at registration, never changes. Locks the plan family. */
  account_type: TAccountType;
  /** The SaaS subscription plan. Determines permissions via PLATFORM_ROLE_TEMPLATES. */
  plan: TPlatformRole;
  /** Active = usable, suspended = payment failed or admin action. */
  status: 'active' | 'suspended';
  /** When the subscription started (or was last reactivated). */
  startDate: Date;
}

export const SPlatformContractDomainModel = z.object({
  id: z.string(),
  user_id: z.string(),
  account_type: SAccountType,
  plan: SPlatformRole,
  status: z.enum(['active', 'suspended']),
  startDate: z.date(),
});
