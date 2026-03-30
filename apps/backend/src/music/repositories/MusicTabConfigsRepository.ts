import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TMusicTabConfigsDomainModel, TUserId } from '@sh3pherd/shared-types';

export interface IMusicTabConfigsRepository {
  findByUserId(userId: TUserId): Promise<TMusicTabConfigsDomainModel | null>;
  upsert(userId: TUserId, data: TMusicTabConfigsDomainModel): Promise<boolean>;
  deleteByUserId(userId: TUserId): Promise<boolean>;
}

export class MusicTabConfigsRepository
  extends BaseMongoRepository<TMusicTabConfigsDomainModel>
  implements IMusicTabConfigsRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findByUserId(userId: TUserId): Promise<TMusicTabConfigsDomainModel | null> {
    return this.collection.findOne({ user_id: userId } as any) as Promise<TMusicTabConfigsDomainModel | null>;
  }

  async upsert(userId: TUserId, data: TMusicTabConfigsDomainModel): Promise<boolean> {
    const result = await this.collection.updateOne(
      { user_id: userId } as any,
      { $set: data as any },
      { upsert: true },
    );
    return result.acknowledged;
  }

  async deleteByUserId(userId: TUserId): Promise<boolean> {
    const result = await this.collection.deleteOne({ user_id: userId } as any);
    return result.deletedCount === 1;
  }
}
