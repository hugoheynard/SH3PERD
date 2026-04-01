import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLAYLIST_REPO, PLAYLIST_TRACK_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IPlaylistRepository } from '../../repositories/PlaylistRepository.js';
import type { IPlaylistTrackRepository } from '../../repositories/PlaylistTrackRepository.js';
import type { TUserId, TPlaylistId } from '@sh3pherd/shared-types';
import { PlaylistEntity } from '../../domain/PlaylistEntity.js';

export class DeletePlaylistCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly playlistId: TPlaylistId,
  ) {}
}

@CommandHandler(DeletePlaylistCommand)
export class DeletePlaylistHandler implements ICommandHandler<DeletePlaylistCommand, boolean> {
  constructor(
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly trackRepo: IPlaylistTrackRepository,
  ) {}

  async execute(cmd: DeletePlaylistCommand): Promise<boolean> {
    const existing = await this.playlistRepo.findOneById(cmd.playlistId);
    if (!existing) throw new Error('PLAYLIST_NOT_FOUND');

    const playlist = new PlaylistEntity(existing);
    playlist.ensureOwnedBy(cmd.actorId);

    // Cascade delete all tracks
    await this.trackRepo.deleteByPlaylistId(cmd.playlistId);

    return this.playlistRepo.deleteOneById(cmd.playlistId);
  }
}
