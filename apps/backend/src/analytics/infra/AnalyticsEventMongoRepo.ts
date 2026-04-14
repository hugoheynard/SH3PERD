import { Injectable } from '@nestjs/common';
import type { Filter, FindOptions } from 'mongodb';
import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type {
  TAnalyticsEventDomainModel,
  TAnalyticsEventType,
  TUserId,
} from '@sh3pherd/shared-types';

/**
 * Query parameters for listing analytics events.
 */
export type TAnalyticsEventFilter = {
  type?: TAnalyticsEventType;
  user_id?: TUserId;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
};

/**
 * Repository interface — append-only by design.
 *
 * No `updateOne` / `deleteOne` exposed at the interface level.
 * The underlying BaseMongoRepository has them, but they should
 * never be called on analytics events.
 */
export type IAnalyticsEventRepository = {
  /** Insert a single event (append-only). */
  insertEvent(event: TAnalyticsEventDomainModel): Promise<void>;

  /** Insert multiple events in a single batch. */
  insertMany(events: TAnalyticsEventDomainModel[]): Promise<void>;

  /** Query events with optional filters, pagination, and date range. */
  query(filter: TAnalyticsEventFilter): Promise<TAnalyticsEventDomainModel[]>;

  /** Count events matching a filter (for pagination metadata). */
  countEvents(filter: TAnalyticsEventFilter): Promise<number>;
} & Pick<IBaseCRUD<TAnalyticsEventDomainModel>, 'findOne' | 'findMany'>;

@Injectable()
export class AnalyticsEventMongoRepository
  extends BaseMongoRepository<TAnalyticsEventDomainModel>
  implements IAnalyticsEventRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async insertEvent(event: TAnalyticsEventDomainModel): Promise<void> {
    await this.collection.insertOne(event as Parameters<typeof this.collection.insertOne>[0]);
  }

  async insertMany(events: TAnalyticsEventDomainModel[]): Promise<void> {
    if (events.length === 0) return;
    await this.collection.insertMany(events as Parameters<typeof this.collection.insertMany>[0]);
  }

  async query(filter: TAnalyticsEventFilter): Promise<TAnalyticsEventDomainModel[]> {
    const mongoFilter = this.buildFilter(filter);
    const limit = filter.limit ?? 50;
    const skip = filter.offset ?? 0;

    const options: FindOptions = {
      sort: { timestamp: -1 },
      limit,
      skip,
      projection: { _id: 0 },
    };

    return this.findMany({ filter: mongoFilter, options });
  }

  async countEvents(filter: TAnalyticsEventFilter): Promise<number> {
    const mongoFilter = this.buildFilter(filter);
    return this.collection.countDocuments(mongoFilter);
  }

  // ── Internal ──────────────────────────────────────────

  private buildFilter(filter: TAnalyticsEventFilter): Filter<TAnalyticsEventDomainModel> {
    const f: Record<string, unknown> = {};

    if (filter.type) f['type'] = filter.type;
    if (filter.user_id) f['user_id'] = filter.user_id;

    if (filter.from || filter.to) {
      const dateRange: Record<string, Date> = {};
      if (filter.from) dateRange['$gte'] = filter.from;
      if (filter.to) dateRange['$lte'] = filter.to;
      f['timestamp'] = dateRange;
    }

    return f as Filter<TAnalyticsEventDomainModel>;
  }
}
