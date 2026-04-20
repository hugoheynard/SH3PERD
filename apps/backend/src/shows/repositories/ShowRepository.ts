import type { Filter, UpdateFilter } from 'mongodb';
import type {
  TShowDomainModel,
  TShowId,
  TUpdateShowPayload,
  TUserId,
} from '@sh3pherd/shared-types';
import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';

export type IShowRepository = {
  saveOne(document: TShowDomainModel): Promise<boolean>;
  /** Idempotent whole-doc write keyed by the business `id`. Inserts the
   *  doc when absent, replaces it wholesale when present — used by the
   *  aggregate repo so saves on a loaded aggregate don't accidentally
   *  silently insert a second row (no unique index exists on `id`). */
  upsertOne(document: TShowDomainModel): Promise<void>;
  findOneById(showId: TShowId): Promise<TShowDomainModel | null>;
  findByOwnerId(ownerId: TUserId): Promise<TShowDomainModel[]>;
  updateShow(
    showId: TShowId,
    patch: TUpdateShowPayload & { updatedAt?: number; lastPlayedAt?: number | null },
  ): Promise<TShowDomainModel | null>;
  deleteOneById(showId: TShowId): Promise<boolean>;
  countByOwnerId(ownerId: TUserId): Promise<number>;
};

export class ShowMongoRepository
  extends BaseMongoRepository<TShowDomainModel>
  implements IShowRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async saveOne(document: TShowDomainModel): Promise<boolean> {
    return this.save(document);
  }

  async upsertOne(document: TShowDomainModel): Promise<void> {
    const filter: Filter<TShowDomainModel> = { id: document.id };
    await this.collection.replaceOne(filter, document, { upsert: true });
  }

  async findOneById(showId: TShowId): Promise<TShowDomainModel | null> {
    const filter: Filter<TShowDomainModel> = { id: showId };
    return this.findOne({ filter });
  }

  async findByOwnerId(ownerId: TUserId): Promise<TShowDomainModel[]> {
    const filter: Filter<TShowDomainModel> = { owner_id: ownerId };
    return this.findMany({ filter, options: { sort: { updatedAt: -1 } } });
  }

  async updateShow(
    showId: TShowId,
    patch: TUpdateShowPayload & { updatedAt?: number; lastPlayedAt?: number | null },
  ): Promise<TShowDomainModel | null> {
    // Split the patch so `lastPlayedAt: null` becomes `$unset` instead of
    // storing an explicit null — keeps the optional field discipline in sync
    // with the domain model (absent means "never played").
    const { lastPlayedAt, ...rest } = patch;
    const $set = { ...rest } as Record<string, unknown>;
    const update: UpdateFilter<TShowDomainModel> = Object.keys($set).length
      ? { $set: $set as UpdateFilter<TShowDomainModel>['$set'] }
      : {};
    if (lastPlayedAt === null) {
      update.$unset = { lastPlayedAt: '' } as UpdateFilter<TShowDomainModel>['$unset'];
    } else if (typeof lastPlayedAt === 'number') {
      update.$set = {
        ...(update.$set ?? {}),
        lastPlayedAt,
      } as UpdateFilter<TShowDomainModel>['$set'];
    }
    const filter: Filter<TShowDomainModel> = { id: showId };
    return this.updateOne({ filter, update });
  }

  async deleteOneById(showId: TShowId): Promise<boolean> {
    const filter: Filter<TShowDomainModel> = { id: showId };
    return this.deleteOne(filter);
  }

  async countByOwnerId(ownerId: TUserId): Promise<number> {
    const filter: Filter<TShowDomainModel> = { owner_id: ownerId };
    return this.collection.countDocuments(filter);
  }
}
