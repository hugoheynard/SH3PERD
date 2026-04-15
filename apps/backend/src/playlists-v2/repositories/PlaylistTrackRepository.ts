import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { AnyBulkWriteOperation, Filter, UpdateFilter } from 'mongodb';
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
    return this.save(document);
  }

  async findByPlaylistId(playlistId: TPlaylistId): Promise<TPlaylistTrackDomainModel[]> {
    const filter: Filter<TPlaylistTrackDomainModel> = { playlistId };
    const tracks = await this.findMany({ filter, options: { sort: { position: 1 } } });
    return tracks;
  }

  async findOneById(trackId: TPlaylistTrackId): Promise<TPlaylistTrackDomainModel | null> {
    const filter: Filter<TPlaylistTrackDomainModel> = { id: trackId };
    return this.findOne({ filter });
  }

  async deleteOneById(trackId: TPlaylistTrackId): Promise<boolean> {
    const filter: Filter<TPlaylistTrackDomainModel> = { id: trackId };
    return this.deleteOne(filter);
  }

  async deleteByPlaylistId(playlistId: TPlaylistId): Promise<boolean> {
    const filter: Filter<TPlaylistTrackDomainModel> = { playlistId };
    return this.deleteMany(filter);
  }

  async updatePosition(trackId: TPlaylistTrackId, position: number): Promise<boolean> {
    const filter: Filter<TPlaylistTrackDomainModel> = { id: trackId };
    const update: UpdateFilter<TPlaylistTrackDomainModel> = { $set: { position } };
    const result = await this.updateOne({ filter, update });
    return result !== null;
  }

  async updateManyPositions(
    updates: { id: TPlaylistTrackId; position: number }[],
  ): Promise<boolean> {
    const bulkOps: AnyBulkWriteOperation<TPlaylistTrackDomainModel>[] = updates.map((u) => ({
      updateOne: {
        filter: { id: u.id },
        update: { $set: { position: u.position } },
      },
    }));
    if (bulkOps.length === 0) return true;
    const result = await this.collection.bulkWrite(bulkOps);
    return result.ok === 1;
  }
}
