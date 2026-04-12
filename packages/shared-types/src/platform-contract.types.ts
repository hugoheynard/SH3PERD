import { z } from 'zod';
import { SPlatformRole } from './permissions.types.js';
import type { TPlatformRole } from './permissions.types.js';
import type { TUserId } from './ids.js';

// ─── Platform Contract Domain Model ─────────────────────

/**
 * A platform contract represents a user's SaaS subscription.
 *
 * Every user gets one at registration (defaulting to `plan_free`).
 * It lives in a dedicated `platform_contracts` collection, separate
 * from company contracts. One user = one platform contract.
 *
 * The `plan` field determines which permissions the user has for
 * personal features (music library, playlists, etc.) via
 * `PLATFORM_ROLE_TEMPLATES`.
 */
export interface TPlatformContractDomainModel {
  id: string;
  user_id: TUserId;
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
  plan: SPlatformRole,
  status: z.enum(['active', 'suspended']),
  startDate: z.date(),
});
