import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { TPlaylistDomainModel, TPlaylistId, TUserId } from '@sh3pherd/shared-types';

export type IPlaylistRepository = {
  saveOne(document: TPlaylistDomainModel): Promise<boolean>;
  findOneById(playlistId: TPlaylistId): Promise<TPlaylistDomainModel | null>;
  findByOwnerId(ownerId: TUserId): Promise<TPlaylistDomainModel[]>;
  updatePlaylist(
    playlistId: TPlaylistId,
    patch: Record<string, unknown>,
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
    const result = await this.collection.insertOne(document as any);
    return result.acknowledged;
  }

  async findOneById(playlistId: TPlaylistId): Promise<TPlaylistDomainModel | null> {
    return this.collection.findOne({
      id: playlistId,
    } as any) as Promise<TPlaylistDomainModel | null>;
  }

  async findByOwnerId(ownerId: TUserId): Promise<TPlaylistDomainModel[]> {
    return this.collection.find({ owner_id: ownerId } as any).toArray() as Promise<
      TPlaylistDomainModel[]
    >;
  }

  async updatePlaylist(
    playlistId: TPlaylistId,
    patch: Record<string, unknown>,
  ): Promise<TPlaylistDomainModel | null> {
    const result = await this.collection.findOneAndUpdate(
      { id: playlistId } as any,
      { $set: patch },
      { returnDocument: 'after' },
    );
    return result as TPlaylistDomainModel | null;
  }

  async deleteOneById(playlistId: TPlaylistId): Promise<boolean> {
    const result = await this.collection.deleteOne({ id: playlistId } as any);
    return result.deletedCount === 1;
  }
}
