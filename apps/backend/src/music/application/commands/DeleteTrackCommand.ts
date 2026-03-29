import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_VERSION_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import { buildTrackS3Key } from '../../infra/storage/ITrackStorageService.js';
import type { TUserId, TMusicVersionId, TVersionTrackId } from '@sh3pherd/shared-types';

export class DeleteTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
  ) {}
}

@CommandHandler(DeleteTrackCommand)
export class DeleteTrackHandler implements ICommandHandler<DeleteTrackCommand, boolean> {
  constructor(
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
  ) {}

  async execute(cmd: DeleteTrackCommand): Promise<boolean> {
    const version = await this.versionRepo.findOneByVersionId(cmd.versionId);
    if (!version) throw new Error('MUSIC_VERSION_NOT_FOUND');
    if (version.owner_id !== cmd.actorId) {
      throw new Error('MUSIC_VERSION_NOT_OWNED');
    }

    const track = version.tracks.find(t => t.id === cmd.trackId);
    if (!track) {
      throw new Error('TRACK_NOT_FOUND');
    }

    // Delete from S3
    const s3Key = buildTrackS3Key(cmd.actorId, cmd.versionId, cmd.trackId, track.fileName);
    await this.storage.delete(s3Key).catch(() => {});

    // Remove from MongoDB
    return this.versionRepo.pullTrack(cmd.versionId, cmd.trackId);
  }
}
