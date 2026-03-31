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
  type TMusicVersionDomainModel,
  type TPitchShiftTrackPayload,
  type TPitchShiftResult,
  type TVersionTrackDomainModel,
} from '@sh3pherd/shared-types';

export class PitchShiftVersionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly versionId: TMusicVersionId,
    public readonly trackId: TVersionTrackId,
    public readonly semitones: number,
  ) {}
}

@CommandHandler(PitchShiftVersionCommand)
export class PitchShiftVersionHandler implements ICommandHandler<PitchShiftVersionCommand, TMusicVersionDomainModel> {

  private readonly logger = new Logger(PitchShiftVersionHandler.name);

  constructor(
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject('AUDIO_PROCESSOR') private readonly audioClient: ClientProxy,
  ) {}

  async execute(cmd: PitchShiftVersionCommand): Promise<TMusicVersionDomainModel> {
    // 1. Load source version and validate
    const existing = await this.versionRepo.findOneByVersionId(cmd.versionId);
    if (!existing) throw new Error('MUSIC_VERSION_NOT_FOUND');

    const source = new MusicVersionEntity(existing);
    source.ensureOwnedBy(cmd.actorId);

    const sourceTrack = source.tracks.find(t => t.id === cmd.trackId);
    if (!sourceTrack) throw new Error('TRACK_NOT_FOUND');
    if (!sourceTrack.analysisResult) throw new Error('TRACK_NOT_ANALYZED');
    if (!sourceTrack.s3Key) throw new Error('TRACK_NOT_IN_STORAGE');

    // 2. Prepare new version + track IDs and S3 key
    const newTrackId = `track_${crypto.randomUUID()}` as TVersionTrackId;
    const sign = cmd.semitones >= 0 ? '+' : '';
    const pitchLabel = `${sign}${cmd.semitones}st`;

    // Build a temporary version entity to get the ID
    const sourceDomain = source.toDomain;
    const newVersion = new MusicVersionEntity({
      owner_id: cmd.actorId,
      musicReference_id: sourceDomain.musicReference_id,
      label: `${sourceDomain.label} (${pitchLabel})`,
      genre: sourceDomain.genre,
      type: sourceDomain.type,
      bpm: sourceDomain.bpm,
      pitch: (sourceDomain.pitch ?? 0) + cmd.semitones,
      notes: sourceDomain.notes,
      mastery: sourceDomain.mastery,
      energy: sourceDomain.energy,
      effort: sourceDomain.effort,
      tracks: [],
      parentVersionId: sourceDomain.id,
      derivationType: 'pitch_shift',
    });

    const outputS3Key = buildTrackS3Key(
      cmd.actorId, newVersion.id, newTrackId, `pitched_${sourceTrack.fileName}`,
    );

    // 3. Send to audio-processor
    const payload: TPitchShiftTrackPayload = {
      s3Key: sourceTrack.s3Key,
      outputS3Key,
      trackId: cmd.trackId,
      versionId: cmd.versionId,
      ownerId: cmd.actorId,
      semitones: cmd.semitones,
    };

    this.logger.log(`Pitch-shifting track ${cmd.trackId} by ${pitchLabel} → ${outputS3Key}`);

    const result = await firstValueFrom(
      this.audioClient
        .send<TPitchShiftResult>(MicroservicePatterns.AudioProcessor.PITCH_SHIFT_TRACK, payload)
        .pipe(timeout(300_000)), // 5 min max
    );

    this.logger.log(`Pitch shift complete — ${result.sizeBytes} bytes`);

    // 4. Create track for the new version and persist
    const newTrack: TVersionTrackDomainModel = {
      id: newTrackId,
      fileName: `pitched_${sourceTrack.fileName}`,
      uploadedAt: Date.now(),
      favorite: true,
      parentTrackId: sourceTrack.id,
      s3Key: result.shiftedS3Key,
    };

    newVersion.addTrack(newTrack);

    const saved = await this.versionRepo.saveOne(newVersion.toDomain);
    if (!saved) throw new Error('PITCH_SHIFT_VERSION_CREATION_FAILED');

    return newVersion.toDomain;
  }
}
