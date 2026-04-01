import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLAYLIST_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IPlaylistRepository } from '../../repositories/PlaylistRepository.js';
import type { TUserId, TCreatePlaylistPayload, TPlaylistDomainModel } from '@sh3pherd/shared-types';
import { PlaylistEntity } from '../../domain/PlaylistEntity.js';

export class CreatePlaylistCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly payload: TCreatePlaylistPayload,
  ) {}
}

@CommandHandler(CreatePlaylistCommand)
export class CreatePlaylistHandler implements ICommandHandler<CreatePlaylistCommand, TPlaylistDomainModel> {
  constructor(
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
  ) {}

  async execute(cmd: CreatePlaylistCommand): Promise<TPlaylistDomainModel> {
    const playlist = new PlaylistEntity({
      owner_id: cmd.actorId,
      name: cmd.payload.name,
      color: cmd.payload.color,
      description: cmd.payload.description,
      createdAt: Date.now(),
    });

    const saved = await this.playlistRepo.saveOne(playlist.toDomain);
    if (!saved) throw new Error('PLAYLIST_CREATION_FAILED');

    return playlist.toDomain;
  }
}
