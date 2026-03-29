import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_VERSION_REPO } from '../../../appBootstrap/nestTokens.js';
import { TRACK_STORAGE_SERVICE } from '../../infra/storage/storage.tokens.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import type { ITrackStorageService } from '../../infra/storage/ITrackStorageService.js';
import { buildTrackS3Key } from '../../infra/storage/ITrackStorageService.js';
import type {
  TUserId,
  TMusicVersionId,
  TUploadTrackPayload,
  TVersionTrackDomainModel,
} from '@sh3pherd/shared-types';

export class UploadTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly file: Buffer,
    public readonly contentType: string,
    public readonly payload: TUploadTrackPayload,
  ) {}
}

@CommandHandler(UploadTrackCommand)
export class UploadTrackHandler implements ICommandHandler<UploadTrackCommand, TVersionTrackDomainModel> {
  constructor(
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(TRACK_STORAGE_SERVICE) private readonly storage: ITrackStorageService,
  ) {}

  async execute(cmd: UploadTrackCommand): Promise<TVersionTrackDomainModel> {
    const version = await this.versionRepo.findOneByVersionId(cmd.versionId);
    if (!version) throw new Error('MUSIC_VERSION_NOT_FOUND');
    if (version.owner_id !== cmd.actorId) throw new Error('MUSIC_VERSION_NOT_OWNED');

    const trackId = `track_${crypto.randomUUID()}` as const;
    const isFirstTrack = version.tracks.length === 0;

    const track: TVersionTrackDomainModel = {
      id: trackId,
      fileName: cmd.payload.fileName,
      durationSeconds: cmd.payload.durationSeconds,
      uploadedAt: Date.now(),
      favorite: isFirstTrack,
    };

    // Upload to S3 first
    const s3Key = buildTrackS3Key(cmd.actorId, cmd.versionId, trackId, cmd.payload.fileName);
    await this.storage.upload(s3Key, cmd.file, cmd.contentType);

    // Then persist in MongoDB
    const pushed = await this.versionRepo.pushTrack(cmd.versionId, track);
    if (!pushed) {
      // Compensate: delete orphaned S3 object
      await this.storage.delete(s3Key).catch(() => {});
      throw new Error('TRACK_UPLOAD_DB_FAILED');
    }

    return track;
  }
}
