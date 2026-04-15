import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { Filter, UpdateFilter } from 'mongodb';
import type {
  TPlaylistDomainModel,
  TPlaylistId,
  TUpdatePlaylistPayload,
  TUserId,
} from '@sh3pherd/shared-types';

export type IPlaylistRepository = {
  saveOne(document: TPlaylistDomainModel): Promise<boolean>;
  findOneById(playlistId: TPlaylistId): Promise<TPlaylistDomainModel | null>;
  findByOwnerId(ownerId: TUserId): Promise<TPlaylistDomainModel[]>;
  updatePlaylist(
    playlistId: TPlaylistId,
    patch: TUpdatePlaylistPayload,
  ): Promise<TPlaylistDomainModel | null>;
  deleteOneById(playlistId: TPlaylistId): Promise<boolean>;
};

export class PlaylistMongoRepository
  extends BaseMongoRepository<TPlaylistDomainModel>
  implements IPlaylistRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async saveOne(document: TPlaylistDomainModel): Promise<boolean> {
    return this.save(document);
  }

  async findOneById(playlistId: TPlaylistId): Promise<TPlaylistDomainModel | null> {
    const filter: Filter<TPlaylistDomainModel> = { id: playlistId };
    return this.findOne({ filter });
  }

  async findByOwnerId(ownerId: TUserId): Promise<TPlaylistDomainModel[]> {
    const filter: Filter<TPlaylistDomainModel> = { owner_id: ownerId };
    return this.findMany({ filter });
  }

  async updatePlaylist(
    playlistId: TPlaylistId,
    patch: TUpdatePlaylistPayload,
  ): Promise<TPlaylistDomainModel | null> {
    const filter: Filter<TPlaylistDomainModel> = { id: playlistId };
    const update: UpdateFilter<TPlaylistDomainModel> = { $set: patch };
    return this.updateOne({ filter, update });
  }

  async deleteOneById(playlistId: TPlaylistId): Promise<boolean> {
    const filter: Filter<TPlaylistDomainModel> = { id: playlistId };
    return this.deleteOne(filter);
  }
}
