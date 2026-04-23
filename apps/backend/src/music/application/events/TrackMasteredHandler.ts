import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';
import { TrackMasteredEvent } from './TrackMasteredEvent.js';
import { REPERTOIRE_ENTRY_AGGREGATE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IRepertoireEntryAggregateRepository } from '../../repositories/RepertoireEntryAggregateRepository.js';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';
import {
  MicroservicePatterns,
  type TAnalyzeTrackPayload,
  type TAudioAnalysisSnapshot,
} from '@sh3pherd/shared-types';

const getErrorMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/**
 * Runs the audio-analysis pipeline on a freshly mastered track and
 * persists the resulting snapshot onto the aggregate. Mirrors
 * TrackUploadedHandler's behaviour but lives on its own event so
 * mastering-specific reactions (notifications, billing refresh,
 * post-processing) can hook in later without coupling to uploads.
 */
@EventsHandler(TrackMasteredEvent)
export class TrackMasteredHandler implements IEventHandler<TrackMasteredEvent> {
  private readonly logger = new Logger(TrackMasteredHandler.name);

  constructor(
    @Inject('AUDIO_PROCESSOR') private readonly audioClient: ClientProxy,
    @Inject(REPERTOIRE_ENTRY_AGGREGATE_REPO)
    private readonly aggregateRepo: IRepertoireEntryAggregateRepository,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async handle(event: TrackMasteredEvent): Promise<void> {
    const { ownerId, versionId, trackId, s3Key } = event;

    this.logger.log(
      `Mastered track persisted → requesting analysis [version=${versionId}, track=${trackId}]`,
    );

    const payload: TAnalyzeTrackPayload = { s3Key, trackId, versionId, ownerId };

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
              this.logger.error(
                `Post-mastering analysis failed for track ${trackId}: ${getErrorMessage(err)}`,
              );
              return of(null as TAudioAnalysisSnapshot | null);
            }),
          ),
      );

      if (!snapshot) {
        this.logger.warn(`No analysis result for mastered track ${trackId}`);
        return;
      }

      const aggregate = await this.aggregateRepo.loadByVersionId(versionId);
      aggregate.setTrackAnalysis(versionId, trackId, snapshot);
      await this.aggregateRepo.save(aggregate);

      this.logger.log(
        `Post-mastering analysis saved for track ${trackId} — quality=${snapshot.quality}/4`,
      );

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
      this.logger.error(
        `Unexpected error analysing mastered track ${trackId}: ${getErrorMessage(err)}`,
      );
    }
  }
}
