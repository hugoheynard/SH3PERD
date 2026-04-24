import { Inject } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { TrackUploadedEvent } from './TrackUploadedEvent.js';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';
import {
  MicroservicePatterns,
  type TAudioAnalysisSnapshot,
  type TAnalyzeTrackPayload,
} from '@sh3pherd/shared-types';
import { createContextLogger } from '../../../utils/logging/ContextLogger.js';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Handles TrackUploadedEvent by dispatching an analysis request
 * to the audio-processor microservice via TCP, then persisting
 * the result via the aggregate.
 */
@EventsHandler(TrackUploadedEvent)
export class TrackUploadedHandler implements IEventHandler<TrackUploadedEvent> {
  constructor(
    @Inject('AUDIO_PROCESSOR') private readonly audioClient: ClientProxy,
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async handle(event: TrackUploadedEvent): Promise<void> {
    const { ownerId, versionId, trackId, s3Key, correlationId } = event;

    const log = createContextLogger('TrackUploadedHandler', {
      correlation_id: correlationId,
      user_id: ownerId,
      version_id: versionId,
      track_id: trackId,
    });

    log.info('Requesting analysis from audio-processor');

    const payload: TAnalyzeTrackPayload = {
      correlationId,
      s3Key,
      trackId,
      versionId,
      ownerId,
    };

    try {
      const snapshot = await firstValueFrom(
        this.audioClient
          .send<TAudioAnalysisSnapshot | null>(
            MicroservicePatterns.AudioProcessor.ANALYZE_TRACK,
            payload,
          )
          .pipe(
            timeout(120_000),
            catchError((err) => {
              log.error('Analysis failed', { reason: getErrorMessage(err) });
              return of(null as TAudioAnalysisSnapshot | null);
            }),
          ),
      );

      if (!snapshot) {
        log.warn('No analysis result returned');
        return;
      }

      const aggregate = await this.aggregateRepo.loadByVersionId(versionId);
      aggregate.setTrackAnalysis(versionId, trackId, snapshot);
      await this.aggregateRepo.save(aggregate);

      log.info('Analysis saved', { quality: snapshot.quality });

      await this.analytics.track('track_analysed', ownerId, {
        version_id: versionId,
        track_id: trackId,
        bpm: snapshot.bpm,
        key: snapshot.key,
        key_scale: snapshot.keyScale,
        duration_seconds: snapshot.durationSeconds,
        sample_rate: snapshot.sampleRate,
        integrated_lufs: snapshot.integratedLUFS,
        loudness_range: snapshot.loudnessRange,
        true_peak_dbtp: snapshot.truePeakdBTP,
        snr_db: snapshot.SNRdB,
        clipping_ratio: snapshot.clippingRatio,
      });
    } catch (err: unknown) {
      log.error('Unexpected error during analysis', { reason: getErrorMessage(err) });
    }
  }
}
