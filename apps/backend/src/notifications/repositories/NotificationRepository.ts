import type { Filter, UpdateFilter } from 'mongodb';
import type { TNotificationDomainModel, TNotificationId, TUserId } from '@sh3pherd/shared-types';
import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';

export type TFindNotificationsOptions = {
  limit: number;
  before?: number;
  unreadOnly?: boolean;
};

export type INotificationRepository = {
  saveOne(document: TNotificationDomainModel): Promise<boolean>;
  findOneById(id: TNotificationId): Promise<TNotificationDomainModel | null>;
  /** Keyset pagination on `createdAt` desc. Returns at most `limit` items;
   *  the caller decides whether a follow-up page is needed from the
   *  result length (a full page means another page is available). */
  findByUserId(
    userId: TUserId,
    options: TFindNotificationsOptions,
  ): Promise<TNotificationDomainModel[]>;
  countUnreadByUserId(userId: TUserId): Promise<number>;
  /** Bulk mark-as-read — returns the list of IDs that actually
   *  transitioned (already-read notifs are excluded so the socket
   *  `notification:read` event only fires when state really changed). */
  markManyRead(userId: TUserId, ids: TNotificationId[], readAt: number): Promise<TNotificationId[]>;
  markAllRead(userId: TUserId, readAt: number): Promise<number>;
};

export class NotificationMongoRepository
  extends BaseMongoRepository<TNotificationDomainModel>
  implements INotificationRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async saveOne(document: TNotificationDomainModel): Promise<boolean> {
    return this.save(document);
  }

  async findOneById(id: TNotificationId): Promise<TNotificationDomainModel | null> {
    const filter: Filter<TNotificationDomainModel> = { id };
    return this.findOne({ filter });
  }

  async findByUserId(
    userId: TUserId,
    options: TFindNotificationsOptions,
  ): Promise<TNotificationDomainModel[]> {
    const filter: Filter<TNotificationDomainModel> = { user_id: userId };
    if (options.before !== undefined) {
      filter.createdAt = { $lt: options.before };
    }
    if (options.unreadOnly) {
      filter.read = false;
    }
    return this.findMany({
      filter,
      options: { sort: { createdAt: -1 }, limit: options.limit },
    });
  }

  async countUnreadByUserId(userId: TUserId): Promise<number> {
    const filter: Filter<TNotificationDomainModel> = {
      user_id: userId,
      read: false,
    };
    return this.collection.countDocuments(filter);
  }

  async markManyRead(
    userId: TUserId,
    ids: TNotificationId[],
    readAt: number,
  ): Promise<TNotificationId[]> {
    if (ids.length === 0) return [];
    // Select the still-unread subset first so the caller can emit a
    // precise `notification:read` event over the socket. Then flip them
    // in one update.
    const unreadFilter: Filter<TNotificationDomainModel> = {
      user_id: userId,
      id: { $in: ids },
      read: false,
    };
    const unread = await this.collection
      .find(unreadFilter, { projection: { _id: 0, id: 1 } })
      .toArray();
    const unreadIds = unread.map((d) => d.id);
    if (unreadIds.length === 0) return [];
    const update: UpdateFilter<TNotificationDomainModel> = {
      $set: { read: true, readAt } as UpdateFilter<TNotificationDomainModel>['$set'],
    };
    await this.collection.updateMany(
      {
        user_id: userId,
        id: { $in: unreadIds },
      } as Filter<TNotificationDomainModel>,
      update,
    );
    return unreadIds;
  }

  async markAllRead(userId: TUserId, readAt: number): Promise<number> {
    const filter: Filter<TNotificationDomainModel> = {
      user_id: userId,
      read: false,
    };
    const update: UpdateFilter<TNotificationDomainModel> = {
      $set: { read: true, readAt } as UpdateFilter<TNotificationDomainModel>['$set'],
    };
    const result = await this.collection.updateMany(filter, update);
    return result.modifiedCount ?? 0;
  }
}
