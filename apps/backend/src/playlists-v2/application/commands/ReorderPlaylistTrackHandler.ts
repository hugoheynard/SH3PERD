import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLAYLIST_REPO, PLAYLIST_TRACK_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IPlaylistRepository } from '../../repositories/PlaylistRepository.js';
import type { IPlaylistTrackRepository } from '../../repositories/PlaylistTrackRepository.js';
import type { TUserId, TPlaylistId, TPlaylistTrackId } from '@sh3pherd/shared-types';
import { PlaylistEntity } from '../../domain/PlaylistEntity.js';

export class ReorderPlaylistTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly playlistId: TPlaylistId,
    public readonly trackId: TPlaylistTrackId,
    public readonly newPosition: number,
  ) {}
}

@CommandHandler(ReorderPlaylistTrackCommand)
export class ReorderPlaylistTrackHandler implements ICommandHandler<
  ReorderPlaylistTrackCommand,
  boolean
> {
  constructor(
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly trackRepo: IPlaylistTrackRepository,
  ) {}

  async execute(cmd: ReorderPlaylistTrackCommand): Promise<boolean> {
    const existing = await this.playlistRepo.findOneById(cmd.playlistId);
    if (!existing) throw new Error('PLAYLIST_NOT_FOUND');

    const playlist = new PlaylistEntity(existing);
    playlist.ensureOwnedBy(cmd.actorId);

    const track = await this.trackRepo.findOneById(cmd.trackId);
    if (!track) throw new Error('PLAYLIST_TRACK_NOT_FOUND');
    if (track.playlistId !== cmd.playlistId) throw new Error('PLAYLIST_TRACK_NOT_IN_PLAYLIST');

    // Get all siblings sorted by position
    const siblings = await this.trackRepo.findByPlaylistId(cmd.playlistId);

    // Remove the track from its current position
    const reordered = siblings.filter((s) => s.id !== cmd.trackId);

    // Clamp the new position
    const clampedPosition = Math.max(0, Math.min(cmd.newPosition, reordered.length));

    // Insert at new position
    reordered.splice(clampedPosition, 0, track);

    // Renumber all positions
    const updates = reordered.map((s, i) => ({ id: s.id, position: i }));
    await this.trackRepo.updateManyPositions(updates);

    return true;
  }
}
