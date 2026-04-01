import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLAYLIST_REPO, PLAYLIST_TRACK_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IPlaylistRepository } from '../../repositories/PlaylistRepository.js';
import type { IPlaylistTrackRepository } from '../../repositories/PlaylistTrackRepository.js';
import type { TUserId, TPlaylistId, TPlaylistTrackId } from '@sh3pherd/shared-types';
import { PlaylistEntity } from '../../domain/PlaylistEntity.js';

export class RemovePlaylistTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly playlistId: TPlaylistId,
    public readonly trackId: TPlaylistTrackId,
  ) {}
}

@CommandHandler(RemovePlaylistTrackCommand)
export class RemovePlaylistTrackHandler implements ICommandHandler<RemovePlaylistTrackCommand, boolean> {
  constructor(
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly trackRepo: IPlaylistTrackRepository,
  ) {}

  async execute(cmd: RemovePlaylistTrackCommand): Promise<boolean> {
    const existing = await this.playlistRepo.findOneById(cmd.playlistId);
    if (!existing) throw new Error('PLAYLIST_NOT_FOUND');

    const playlist = new PlaylistEntity(existing);
    playlist.ensureOwnedBy(cmd.actorId);

    const track = await this.trackRepo.findOneById(cmd.trackId);
    if (!track) throw new Error('PLAYLIST_TRACK_NOT_FOUND');
    if (track.playlistId !== cmd.playlistId) throw new Error('PLAYLIST_TRACK_NOT_IN_PLAYLIST');

    const deleted = await this.trackRepo.deleteOneById(cmd.trackId);
    if (!deleted) throw new Error('PLAYLIST_TRACK_DELETE_FAILED');

    // Renumber remaining siblings
    const siblings = await this.trackRepo.findByPlaylistId(cmd.playlistId);
    const updates = siblings.map((s, i) => ({ id: s.id, position: i }));
    await this.trackRepo.updateManyPositions(updates);

    return true;
  }
}
