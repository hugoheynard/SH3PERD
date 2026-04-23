import { Injectable } from '@nestjs/common';
import type { TUserId } from '@sh3pherd/shared-types';
import { QuotaService } from '../../quota/QuotaService.js';
import { DEFAULT_MUSIC_POLICY_LIMITS, type MusicPolicyLimits } from './MusicPolicy.js';
import { limitsForPlan } from './musicPolicyLimits.plans.js';

/**
 * Resolves the `MusicPolicyLimits` to enforce for a given user.
 *
 * Kept as a service (rather than a static lookup) so the resolution
 * strategy can evolve — today it reads the user's platform plan from
 * `QuotaService`, tomorrow it could honour per-tenant overrides,
 * A/B experiments, or promotional bumps without touching the aggregate
 * repo.
 *
 * Failure mode: if the plan lookup throws (Mongo blip, missing platform
 * contract, etc.) we fall back to the domain default. A transient
 * database hiccup should not grant a user unlimited caps, and the
 * default is the most restrictive row.
 */
@Injectable()
export class MusicPolicyLimitsProvider {
  constructor(private readonly quotaService: QuotaService) {}

  async forUser(userId: TUserId): Promise<MusicPolicyLimits> {
    try {
      const plan = await this.quotaService.getPlan(userId);
      return limitsForPlan(plan);
    } catch {
      return DEFAULT_MUSIC_POLICY_LIMITS;
    }
  }
}
