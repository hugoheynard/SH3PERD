import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
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
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO) private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    @Inject('AUDIO_PROCESSOR') private readonly audioClient: ClientProxy,
  ) {}

  async execute(cmd: PitchShiftVersionCommand): Promise<TMusicVersionDomainModel> {
    // 1. Load and validate via aggregate
    const aggregate = await this.aggregateRepo.loadByVersionId(cmd.versionId);
    const source = aggregate.ensureCanDeriveVersion(cmd.actorId, cmd.versionId, cmd.trackId);
    const sourceTrack = source.findTrack(cmd.trackId)!;
    const sourceDomain = source.toDomain;

    // 2. Build new version entity
    const sign = cmd.semitones >= 0 ? '+' : '';
    const pitchLabel = `${sign}${cmd.semitones}st`;

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

    const newTrackId = `track_${crypto.randomUUID()}` as TVersionTrackId;
    const outputS3Key = buildTrackS3Key(
      cmd.actorId, newVersion.id, newTrackId, `pitched_${sourceTrack.fileName}`,
    );

    // 3. Send to audio-processor
    const payload: TPitchShiftTrackPayload = {
      s3Key: sourceTrack.s3Key!,
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
        .pipe(timeout(300_000)),
    );

    this.logger.log(`Pitch shift complete — ${result.sizeBytes} bytes`);

    // 4. Add track to new version and register in aggregate
    const newTrack: TVersionTrackDomainModel = {
      id: newTrackId,
      fileName: `pitched_${sourceTrack.fileName}`,
      uploadedAt: Date.now(),
      favorite: true,
      parentTrackId: sourceTrack.id,
      s3Key: result.shiftedS3Key,
    };

    newVersion.addTrack(newTrack);
    aggregate.createDerivedVersion(newVersion);
    await this.aggregateRepo.save(aggregate);

    return newVersion.toDomain;
  }
}
