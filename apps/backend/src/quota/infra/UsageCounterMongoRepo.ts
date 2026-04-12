import { Injectable } from '@nestjs/common';
import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { TUserId } from '@sh3pherd/shared-types';
import type { TQuotaResource } from '../domain/QuotaLimits.js';

/**
 * Usage counter record stored in the `platform_usage` collection.
 *
 * One record per (user, resource, period_key) tuple.
 * Monthly quotas use `YYYY-MM` as period_key, lifetime use `'lifetime'`.
 *
 * Compound index: `{ user_id: 1, resource: 1, period_key: 1 }` (unique).
 */
export interface TUsageCounterRecord {
  id: string;
  user_id: TUserId;
  resource: TQuotaResource;
  period_key: string;
  count: number;
  updated_at: Date;
}

export interface IUsageCounterRepository extends IBaseCRUD<TUsageCounterRecord> {
  /** Get the current count. Returns 0 if no record exists. */
  getCount(userId: TUserId, resource: TQuotaResource, periodKey: string): Promise<number>;

  /** Atomically increment (or create) the counter. Uses MongoDB $inc + upsert. */
  increment(userId: TUserId, resource: TQuotaResource, periodKey: string, amount: number): Promise<void>;

  /** Get all counters for a user (for the usage summary endpoint). */
  getAllForUser(userId: TUserId): Promise<TUsageCounterRecord[]>;
}

@Injectable()
export class UsageCounterMongoRepository
  extends BaseMongoRepository<TUsageCounterRecord>
  implements IUsageCounterRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async getCount(userId: TUserId, resource: TQuotaResource, periodKey: string): Promise<number> {
    const record = await this.findOne({
      filter: { user_id: userId, resource, period_key: periodKey } as any,
    });
    return record?.count ?? 0;
  }

  async increment(userId: TUserId, resource: TQuotaResource, periodKey: string, amount: number): Promise<void> {
    const collection = this.getCollection();
    await collection.updateOne(
      { user_id: userId, resource, period_key: periodKey },
      {
        $inc: { count: amount },
        $set: { updated_at: new Date() },
        $setOnInsert: {
          id: `usage_${crypto.randomUUID()}`,
          user_id: userId,
          resource,
          period_key: periodKey,
        },
      },
      { upsert: true },
    );
  }

  async getAllForUser(userId: TUserId): Promise<TUsageCounterRecord[]> {
    return this.findMany({ filter: { user_id: userId } as any }) ?? [];
  }

  /**
   * Expose the underlying MongoDB collection for direct operations
   * (like the atomic $inc + upsert in `increment`).
   */
  private getCollection() {
    // BaseMongoRepository stores the collection reference — access it
    // via the protected `collection` property inherited from the base.
    return (this as any).collection;
  }
}
