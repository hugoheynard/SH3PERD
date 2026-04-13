import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLAYLIST_REPO, PLAYLIST_TRACK_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IPlaylistRepository } from '../../repositories/PlaylistRepository.js';
import type { IPlaylistTrackRepository } from '../../repositories/PlaylistTrackRepository.js';
import type {
  TUserId,
  TPlaylistId,
  TAddPlaylistTrackPayload,
  TPlaylistTrackDomainModel,
} from '@sh3pherd/shared-types';
import { PlaylistEntity } from '../../domain/PlaylistEntity.js';
import { PlaylistTrackEntity } from '../../domain/PlaylistTrackEntity.js';

export class AddPlaylistTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly playlistId: TPlaylistId,
    public readonly payload: TAddPlaylistTrackPayload,
  ) {}
}

@CommandHandler(AddPlaylistTrackCommand)
export class AddPlaylistTrackHandler implements ICommandHandler<
  AddPlaylistTrackCommand,
  TPlaylistTrackDomainModel
> {
  constructor(
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
    @Inject(PLAYLIST_TRACK_REPO) private readonly trackRepo: IPlaylistTrackRepository,
  ) {}

  async execute(cmd: AddPlaylistTrackCommand): Promise<TPlaylistTrackDomainModel> {
    const existing = await this.playlistRepo.findOneById(cmd.playlistId);
    if (!existing) throw new Error('PLAYLIST_NOT_FOUND');

    const playlist = new PlaylistEntity(existing);
    playlist.ensureOwnedBy(cmd.actorId);

    // Determine next position
    const siblings = await this.trackRepo.findByPlaylistId(cmd.playlistId);
    const nextPosition = siblings.length > 0 ? Math.max(...siblings.map((t) => t.position)) + 1 : 0;

    const track = new PlaylistTrackEntity({
      playlistId: cmd.playlistId,
      referenceId: cmd.payload.referenceId,
      versionId: cmd.payload.versionId,
      position: nextPosition,
      notes: cmd.payload.notes,
    });

    const saved = await this.trackRepo.saveOne(track.toDomain);
    if (!saved) throw new Error('PLAYLIST_TRACK_CREATION_FAILED');

    return track.toDomain;
  }
}
