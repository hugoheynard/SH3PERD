import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MUSIC_VERSION_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import { buildTrackS3Key } from '../../infra/storage/ITrackStorageService.js';
import { MusicVersionEntity } from '../../domain/entities/MusicVersionEntity.js';
import {
  MicroservicePatterns,
  type TUserId,
  type TMusicVersionId,
  type TVersionTrackId,
  type TVersionTrackDomainModel,
  type TMasterTrackPayload,
  type TMasteringResult,
  type TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';

export class MasterTrackCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
    public readonly target: TMasteringTargetSpecs,
  ) {}
}

@CommandHandler(MasterTrackCommand)
export class MasterTrackHandler implements ICommandHandler<MasterTrackCommand, TVersionTrackDomainModel> {

  private readonly logger = new Logger(MasterTrackHandler.name);

  constructor(
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject('AUDIO_PROCESSOR') private readonly audioClient: ClientProxy,
  ) {}

  async execute(cmd: MasterTrackCommand): Promise<TVersionTrackDomainModel> {
    // 1. Load and validate
    const existing = await this.versionRepo.findOneByVersionId(cmd.versionId);
    if (!existing) throw new Error('MUSIC_VERSION_NOT_FOUND');

    const version = new MusicVersionEntity(existing);
    version.ensureOwnedBy(cmd.actorId);

    const sourceTrack = version.tracks.find(t => t.id === cmd.trackId);
    if (!sourceTrack) throw new Error('TRACK_NOT_FOUND');
    if (!sourceTrack.analysisResult) throw new Error('TRACK_NOT_ANALYZED');
    if (!sourceTrack.s3Key) throw new Error('TRACK_NOT_IN_STORAGE');

    // 2. Generate output S3 key
    const newTrackId = `track_${crypto.randomUUID()}` as TVersionTrackId;
    const outputS3Key = buildTrackS3Key(
      cmd.actorId, cmd.versionId, newTrackId, `master_${sourceTrack.fileName}`,
    );

    // 3. Send to audio-processor
    const { integratedLUFS, truePeakdBTP, loudnessRange } = sourceTrack.analysisResult;
    const payload: TMasterTrackPayload = {
      s3Key: sourceTrack.s3Key,
      outputS3Key,
      trackId: cmd.trackId,
      versionId: cmd.versionId,
      ownerId: cmd.actorId,
      measured: { integratedLUFS, truePeakdBTP, loudnessRange },
      target: cmd.target,
    };

    this.logger.log(`Mastering track ${cmd.trackId} → ${outputS3Key}`);

    const result = await firstValueFrom(
      this.audioClient
        .send<TMasteringResult>(MicroservicePatterns.AudioProcessor.MASTER_TRACK, payload)
        .pipe(timeout(300_000)), // 5 min max
    );

    this.logger.log(`Mastering complete — ${result.sizeBytes} bytes, report: ${result.report}`);

    // 4. Create mastered track and persist
    const masteredTrack: TVersionTrackDomainModel = {
      id: newTrackId,
      fileName: `master_${sourceTrack.fileName}`,
      uploadedAt: Date.now(),
      favorite: false,
      parentTrackId: sourceTrack.id,
      processingType: 'master',
      s3Key: result.masteredS3Key,
    };

    const pushed = await this.versionRepo.pushTrack(cmd.versionId, masteredTrack);
    if (!pushed) throw new Error('MASTERED_TRACK_DB_FAILED');

    return masteredTrack;
  }
}
