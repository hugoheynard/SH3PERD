import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
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
import { MusicVersionEntity } from '../../domain/entities/MusicVersionEntity.js';
import { TrackUploadedEvent } from '../events/TrackUploadedEvent.js';

const MAX_TRACKS_PER_VERSION = 2;

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
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: UploadTrackCommand): Promise<TVersionTrackDomainModel> {
    const existing = await this.versionRepo.findOneByVersionId(cmd.versionId);
    if (!existing) throw new Error('MUSIC_VERSION_NOT_FOUND');

    const version = new MusicVersionEntity(existing);
    version.ensureOwnedBy(cmd.actorId);

    if (version.tracks.length >= MAX_TRACKS_PER_VERSION) {
      throw new Error('MAX_TRACKS_REACHED');
    }

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

    // Async: trigger audio analysis via microservice
    this.eventBus.publish(new TrackUploadedEvent(cmd.actorId, cmd.versionId, trackId, s3Key));

    return track;
  }
}
