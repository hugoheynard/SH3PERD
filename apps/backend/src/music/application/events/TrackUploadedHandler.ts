import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { TrackUploadedEvent } from './TrackUploadedEvent.js';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import { MicroservicePatterns, type TAudioAnalysisSnapshot, type TAnalyzeTrackPayload } from '@sh3pherd/shared-types';

/**
 * Handles TrackUploadedEvent by dispatching an analysis request
 * to the audio-processor microservice via TCP, then persisting
 * the result via the aggregate.
 */
@EventsHandler(TrackUploadedEvent)
export class TrackUploadedHandler implements IEventHandler<TrackUploadedEvent> {

  private readonly logger = new Logger(TrackUploadedHandler.name);

  constructor(
    @Inject('AUDIO_PROCESSOR') private readonly audioClient: ClientProxy,
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO) private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
  ) {}

  async handle(event: TrackUploadedEvent): Promise<void> {
    const { ownerId, versionId, trackId, s3Key } = event;

    this.logger.log(`Track uploaded → requesting analysis [version=${versionId}, track=${trackId}]`);

    const payload: TAnalyzeTrackPayload = { s3Key, trackId, versionId, ownerId };

    try {
      const snapshot = await firstValueFrom(
        this.audioClient
          .send<TAudioAnalysisSnapshot | null>(MicroservicePatterns.AudioProcessor.ANALYZE_TRACK, payload)
          .pipe(
            timeout(120_000),
            catchError(err => {
              this.logger.error(`Analysis failed for track ${trackId}: ${err.message}`);
              return of(null as TAudioAnalysisSnapshot | null);
            }),
          ),
      );

      if (!snapshot) {
        this.logger.warn(`No analysis result for track ${trackId}`);
        return;
      }

      const aggregate = await this.aggregateRepo.loadByVersionId(versionId);
      aggregate.setTrackAnalysis(versionId, trackId, snapshot);
      await this.aggregateRepo.save(aggregate);

      this.logger.log(`Analysis saved for track ${trackId} — quality=${snapshot.quality}/4`);
    } catch (err: any) {
      this.logger.error(`Unexpected error during analysis of track ${trackId}: ${err.message}`);
    }
  }
}
