import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type {
  TPlaylistTrackDomainModel,
  TPlaylistTrackId,
  TPlaylistId,
} from '@sh3pherd/shared-types';

export type IPlaylistTrackRepository = {
  saveOne(document: TPlaylistTrackDomainModel): Promise<boolean>;
  findByPlaylistId(playlistId: TPlaylistId): Promise<TPlaylistTrackDomainModel[]>;
  findOneById(trackId: TPlaylistTrackId): Promise<TPlaylistTrackDomainModel | null>;
  deleteOneById(trackId: TPlaylistTrackId): Promise<boolean>;
  deleteByPlaylistId(playlistId: TPlaylistId): Promise<boolean>;
  updatePosition(trackId: TPlaylistTrackId, position: number): Promise<boolean>;
  updateManyPositions(updates: { id: TPlaylistTrackId; position: number }[]): Promise<boolean>;
};

export class PlaylistTrackMongoRepository
  extends BaseMongoRepository<TPlaylistTrackDomainModel>
  implements IPlaylistTrackRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async saveOne(document: TPlaylistTrackDomainModel): Promise<boolean> {
    const result = await this.collection.insertOne(document as any);
    return result.acknowledged;
  }

  async findByPlaylistId(playlistId: TPlaylistId): Promise<TPlaylistTrackDomainModel[]> {
    return this.collection
      .find({ playlistId } as any)
      .sort({ position: 1 })
      .toArray() as Promise<TPlaylistTrackDomainModel[]>;
  }

  async findOneById(trackId: TPlaylistTrackId): Promise<TPlaylistTrackDomainModel | null> {
    return this.collection.findOne({
      id: trackId,
    } as any) as Promise<TPlaylistTrackDomainModel | null>;
  }

  async deleteOneById(trackId: TPlaylistTrackId): Promise<boolean> {
    const result = await this.collection.deleteOne({ id: trackId } as any);
    return result.deletedCount === 1;
  }

  async deleteByPlaylistId(playlistId: TPlaylistId): Promise<boolean> {
    const result = await this.collection.deleteMany({ playlistId } as any);
    return result.acknowledged;
  }

  async updatePosition(trackId: TPlaylistTrackId, position: number): Promise<boolean> {
    const result = await this.collection.updateOne({ id: trackId } as any, { $set: { position } });
    return result.modifiedCount === 1;
  }

  async updateManyPositions(
    updates: { id: TPlaylistTrackId; position: number }[],
  ): Promise<boolean> {
    const bulkOps = updates.map((u) => ({
      updateOne: {
        filter: { id: u.id } as any,
        update: { $set: { position: u.position } },
      },
    }));
    if (bulkOps.length === 0) return true;
    const result = await this.collection.bulkWrite(bulkOps);
    return result.ok === 1;
  }
}
