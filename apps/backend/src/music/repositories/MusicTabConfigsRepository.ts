import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TMusicTabConfigsDomainModel, TUserId } from '@sh3pherd/shared-types';
import type { Filter, UpdateFilter } from 'mongodb';

export type IMusicTabConfigsRepository = {
  findByUserId(userId: TUserId): Promise<TMusicTabConfigsDomainModel | null>;
  upsert(userId: TUserId, data: TMusicTabConfigsDomainModel): Promise<boolean>;
  deleteByUserId(userId: TUserId): Promise<boolean>;
};

export class MusicTabConfigsRepository
  extends BaseMongoRepository<TMusicTabConfigsDomainModel>
  implements IMusicTabConfigsRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findByUserId(userId: TUserId): Promise<TMusicTabConfigsDomainModel | null> {
    const filter: Filter<TMusicTabConfigsDomainModel> = {
      user_id: userId,
    };
    return this.collection.findOne(filter) as Promise<TMusicTabConfigsDomainModel | null>;
  }

  async upsert(userId: TUserId, data: TMusicTabConfigsDomainModel): Promise<boolean> {
    const filter: Filter<TMusicTabConfigsDomainModel> = { user_id: userId };
    const update: UpdateFilter<TMusicTabConfigsDomainModel> = { $set: data };
    const result = await this.collection.updateOne(filter, update, { upsert: true });
    return result.acknowledged;
  }

  async deleteByUserId(userId: TUserId): Promise<boolean> {
    const filter: Filter<TMusicTabConfigsDomainModel> = { user_id: userId };
    const result = await this.collection.deleteOne(filter);
    return result.deletedCount === 1;
  }
}
