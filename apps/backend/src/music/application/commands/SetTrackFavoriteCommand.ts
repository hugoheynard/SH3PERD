import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_VERSION_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import type { TUserId, TMusicVersionId, TVersionTrackId } from '@sh3pherd/shared-types';

export class SetTrackFavoriteCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
  ) {}
}

@CommandHandler(SetTrackFavoriteCommand)
export class SetTrackFavoriteHandler implements ICommandHandler<SetTrackFavoriteCommand, boolean> {
  constructor(
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
  ) {}

  async execute(cmd: SetTrackFavoriteCommand): Promise<boolean> {
    const version = await this.versionRepo.findOneByVersionId(cmd.versionId);
    if (!version) throw new Error('MUSIC_VERSION_NOT_FOUND');
    if (version.owner_id !== cmd.actorId) throw new Error('MUSIC_VERSION_NOT_OWNED');

    const trackExists = version.tracks.some(t => t.id === cmd.trackId);
    if (!trackExists) throw new Error('TRACK_NOT_FOUND');

    return this.versionRepo.setTrackFavorite(cmd.versionId, cmd.trackId);
  }
}
