import { Injectable } from '@nestjs/common';
import type { Filter, FindOptions } from 'mongodb';
import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { TCreditPurchaseDomainModel, TQuotaResource, TUserId } from '@sh3pherd/shared-types';

/**
 * Repository interface for credit purchases.
 *
 * Manages the `credit_purchases` collection — one record per purchase.
 * Credits are decremented atomically via `decrementCredits()`.
 */
export type ICreditPurchaseRepository = {
  /**
   * Get the total remaining credits for a user+resource in a given period.
   * Sums `remaining` across all matching purchases.
   *
   * For `one_time` packs, `periodKey` should be `'permanent'`.
   * For `monthly` packs, `periodKey` should be `'YYYY-MM'`.
   * This method sums BOTH to give the total bonus.
   */
  getRemainingCredits(
    userId: TUserId,
    resource: TQuotaResource,
    currentMonthKey: string,
  ): Promise<number>;

  /**
   * Decrement credits after usage exceeds the plan limit.
   *
   * Decrements from the oldest purchase first (FIFO).
   * If no credits remain, does nothing (the quota check already
   * prevented the operation if credits were needed).
   */
  decrementCredits(
    userId: TUserId,
    resource: TQuotaResource,
    currentMonthKey: string,
    amount: number,
  ): Promise<void>;

  /**
   * Get all purchases for a user (for display in settings).
   */
  getPurchasesForUser(userId: TUserId): Promise<TCreditPurchaseDomainModel[]>;
} & IBaseCRUD<TCreditPurchaseDomainModel>;

@Injectable()
export class CreditPurchaseMongoRepository
  extends BaseMongoRepository<TCreditPurchaseDomainModel>
  implements ICreditPurchaseRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async getRemainingCredits(
    userId: TUserId,
    resource: TQuotaResource,
    currentMonthKey: string,
  ): Promise<number> {
    const filter = this.buildActiveFilter(userId, resource, currentMonthKey);

    const results = await this.collection
      .find(filter, { projection: { remaining: 1, _id: 0 } })
      .toArray();

    return results.reduce((sum, r) => sum + (r.remaining ?? 0), 0);
  }

  async decrementCredits(
    userId: TUserId,
    resource: TQuotaResource,
    currentMonthKey: string,
    amount: number,
  ): Promise<void> {
    let remaining = amount;

    // Find purchases with remaining > 0, oldest first (FIFO)
    const purchases = await this.collection
      .find(
        {
          ...this.buildActiveFilter(userId, resource, currentMonthKey),
          remaining: { $gt: 0 },
        } as Filter<TCreditPurchaseDomainModel>,
        { sort: { purchased_at: 1 }, projection: { id: 1, remaining: 1, _id: 0 } },
      )
      .toArray();

    for (const purchase of purchases) {
      if (remaining <= 0) break;

      const toDecrement = Math.min(remaining, purchase.remaining);

      await this.collection.updateOne({ id: purchase.id } as Filter<TCreditPurchaseDomainModel>, {
        $inc: { remaining: -toDecrement },
      });

      remaining -= toDecrement;
    }
  }

  async getPurchasesForUser(userId: TUserId): Promise<TCreditPurchaseDomainModel[]> {
    const options: FindOptions = { sort: { purchased_at: -1 } };
    return this.findMany({
      filter: { user_id: userId } as Filter<TCreditPurchaseDomainModel>,
      options,
    });
  }

  // ── Internal ──────────────────────────────────────────

  /**
   * Build a filter for active credits: matches permanent packs
   * AND monthly packs for the current month, with remaining > 0.
   */
  private buildActiveFilter(
    userId: TUserId,
    resource: TQuotaResource,
    currentMonthKey: string,
  ): Filter<TCreditPurchaseDomainModel> {
    return {
      user_id: userId,
      resource,
      remaining: { $gt: 0 },
      $or: [{ period_key: 'permanent' }, { period_key: currentMonthKey }],
    } as Filter<TCreditPurchaseDomainModel>;
  }
}
