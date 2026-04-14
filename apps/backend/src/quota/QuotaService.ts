import { Inject, Injectable } from '@nestjs/common';
import {
  PLATFORM_CONTRACT_REPO,
  USAGE_COUNTER_REPO,
  CREDIT_PURCHASE_REPO,
} from '../appBootstrap/nestTokens.js';
import type { IPlatformContractRepository } from '../platform-contract/infra/PlatformContractMongoRepo.js';
import type { IUsageCounterRepository } from './infra/UsageCounterMongoRepo.js';
import type { ICreditPurchaseRepository } from './infra/CreditPurchaseMongoRepo.js';
import type { TUserId, TPlatformRole, TQuotaResource, TQuotaPeriod } from '@sh3pherd/shared-types';
import { getQuotaLimit, computePeriodKey, PLAN_QUOTAS } from './domain/QuotaLimits.js';
import { QuotaExceededError } from './domain/QuotaExceededError.js';

/** A single resource's usage summary for the frontend. */
export type TUsageItem = {
  resource: TQuotaResource;
  current: number;
  /** -1 = unlimited, 0 = not available. */
  limit: number;
  /** Bonus credits purchased on top of the plan limit. */
  bonus: number;
  /** Effective limit = plan limit + bonus. -1 = unlimited. */
  effective_limit: number;
  period: TQuotaPeriod;
};

/**
 * Quota enforcement service.
 *
 * Sits between the controller and the domain — called by command
 * handlers BEFORE the domain operation to check if the user has
 * enough quota, and AFTER a successful save to record usage.
 *
 * ## Usage in a handler
 *
 * ```ts
 * await this.quotaService.ensureAllowed(actorId, 'track_upload');
 * // ... domain operation ...
 * await this.quotaService.recordUsage(actorId, 'track_upload');
 * ```
 *
 * ## Error surface
 *
 * - `QuotaExceededError` (402) when the quota is exceeded
 * - `UnauthorizedException` (401) if no platform contract found
 */
@Injectable()
export class QuotaService {
  constructor(
    @Inject(PLATFORM_CONTRACT_REPO)
    private readonly platformRepo: IPlatformContractRepository,
    @Inject(USAGE_COUNTER_REPO)
    private readonly usageRepo: IUsageCounterRepository,
    @Inject(CREDIT_PURCHASE_REPO)
    private readonly creditRepo: ICreditPurchaseRepository,
  ) {}

  /**
   * Check if the user is allowed to perform `amount` units of `resource`.
   * Throws `QuotaExceededError` (402) if the quota would be exceeded.
   *
   * Call this BEFORE the domain operation. If it passes, proceed.
   * If it throws, stop — no side effects should have happened yet.
   */
  async ensureAllowed(
    userId: TUserId,
    resource: TQuotaResource,
    amount: number = 1,
  ): Promise<void> {
    const plan = await this.getUserPlan(userId);
    const quotaLimit = getQuotaLimit(plan, resource);

    // Resource not listed for this plan → unlimited
    if (!quotaLimit) return;

    const { limit, period } = quotaLimit;

    // Explicitly unlimited
    if (limit === -1) return;

    // Feature not available on this plan (and no bonus can override a 0 limit)
    if (limit === 0) {
      throw new QuotaExceededError(resource, 0, 0, plan);
    }

    // Compute effective limit = plan limit + purchased bonus credits
    const periodKey = computePeriodKey(period);
    const bonus = await this.creditRepo.getRemainingCredits(userId, resource, periodKey);
    const effectiveLimit = limit + bonus;

    // Check current usage against effective limit
    const current = await this.usageRepo.getCount(userId, resource, periodKey);

    if (current + amount > effectiveLimit) {
      throw new QuotaExceededError(resource, current, effectiveLimit, plan);
    }
  }

  /**
   * Record `amount` units of usage for `resource`.
   * Call this AFTER the operation has succeeded (after the aggregate save).
   *
   * For storage_bytes, `amount` is the file size in bytes.
   * For deletions, pass a negative `amount` to decrement.
   */
  async recordUsage(userId: TUserId, resource: TQuotaResource, amount: number = 1): Promise<void> {
    const plan = await this.getUserPlan(userId);
    const quotaLimit = getQuotaLimit(plan, resource);

    // If the resource has no quota for this plan, nothing to record.
    if (!quotaLimit) return;

    const periodKey = computePeriodKey(quotaLimit.period);
    await this.usageRepo.increment(userId, resource, periodKey, amount);

    // If the user is now above the plan limit, decrement bonus credits.
    // This ensures purchased credits are consumed only when the base plan is exhausted.
    const { limit } = quotaLimit;
    if (limit >= 0) {
      const currentUsage = await this.usageRepo.getCount(userId, resource, periodKey);
      if (currentUsage > limit) {
        const overPlan = Math.min(amount, currentUsage - limit);
        await this.creditRepo.decrementCredits(userId, resource, periodKey, overPlan);
      }
    }
  }

  /**
   * Get the full usage summary for a user — all resources with their
   * current count and limit. Used by the `GET /quota/me` endpoint.
   */
  async getUsageSummary(userId: TUserId): Promise<TUsageItem[]> {
    const plan = await this.getUserPlan(userId);
    const limits = PLAN_QUOTAS[plan] ?? [];
    const allCounters = await this.usageRepo.getAllForUser(userId);

    const items: TUsageItem[] = [];

    for (const quotaLimit of limits) {
      const periodKey = computePeriodKey(quotaLimit.period);
      const counter = allCounters.find(
        (c) => c.resource === quotaLimit.resource && c.period_key === periodKey,
      );

      const bonus =
        quotaLimit.limit >= 0
          ? await this.creditRepo.getRemainingCredits(userId, quotaLimit.resource, periodKey)
          : 0;

      const effectiveLimit = quotaLimit.limit === -1 ? -1 : quotaLimit.limit + bonus;

      items.push({
        resource: quotaLimit.resource,
        current: Math.max(0, counter?.count ?? 0),
        limit: quotaLimit.limit,
        bonus,
        effective_limit: effectiveLimit,
        period: quotaLimit.period,
      });
    }

    return items;
  }

  // ── Internal ──────────────────────────────────────────────

  /** Resolve the user's current plan (public for the quota controller). */
  async getPlan(userId: TUserId): Promise<TPlatformRole> {
    return this.getUserPlan(userId);
  }

  private async getUserPlan(userId: TUserId): Promise<TPlatformRole> {
    const contract = await this.platformRepo.findByUserId(userId);
    if (!contract) {
      // No platform contract = no subscription. This shouldn't happen
      // (registration creates one), but if it does, fall back to
      // artist_free so the user isn't completely locked out.
      return 'artist_free';
    }
    return contract.plan;
  }
}
