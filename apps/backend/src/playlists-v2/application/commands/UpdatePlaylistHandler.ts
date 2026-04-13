import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLAYLIST_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IPlaylistRepository } from '../../repositories/PlaylistRepository.js';
import type {
  TUserId,
  TPlaylistId,
  TUpdatePlaylistPayload,
  TPlaylistDomainModel,
} from '@sh3pherd/shared-types';
import { PlaylistEntity } from '../../domain/PlaylistEntity.js';

export class UpdatePlaylistCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly playlistId: TPlaylistId,
    public readonly patch: TUpdatePlaylistPayload,
  ) {}
}

@CommandHandler(UpdatePlaylistCommand)
export class UpdatePlaylistHandler implements ICommandHandler<
  UpdatePlaylistCommand,
  TPlaylistDomainModel
> {
  constructor(@Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository) {}

  async execute(cmd: UpdatePlaylistCommand): Promise<TPlaylistDomainModel> {
    const existing = await this.playlistRepo.findOneById(cmd.playlistId);
    if (!existing) throw new Error('PLAYLIST_NOT_FOUND');

    const playlist = new PlaylistEntity(existing);
    playlist.ensureOwnedBy(cmd.actorId);

    const updated = await this.playlistRepo.updatePlaylist(cmd.playlistId, { ...cmd.patch });
    if (!updated) throw new Error('PLAYLIST_UPDATE_FAILED');

    return updated;
  }
}
