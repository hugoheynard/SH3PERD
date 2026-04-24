import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  MicroservicePatterns,
  type TAnalyzeTrackPayload,
  type TAudioAnalysisSnapshot,
  type TMasterTrackPayload,
  type TMasteringResult,
  type TPitchShiftTrackPayload,
  type TPitchShiftResult,
  type TAiMasterTrackPayload,
  type TAiMasteringResult,
} from '@sh3pherd/shared-types';
import { S3Service } from './s3/s3.service';
import { analyzeAudioFile, probeDurationSeconds } from './core/analyze';
import { masterAudio } from './core/master';
import { pitchShift } from './core/pitch-shift';
import {
  aiMasterAudio,
  DEFAULT_WORKER_PATH,
  type DeepAfxConfig,
} from './core/ai-master';
import { BusinessError } from './shared/errors';
import {
  createContextLogger,
  type ContextLogger,
} from './shared/logging/ContextLogger';
import { measure } from './shared/metrics/metrics.registry';

/**
 * Handles audio processing requests from the backend via TCP.
 *
 * Four operations:
 * - **ANALYZE_TRACK**    — download, loudness + BPM/key analysis, return snapshot.
 * - **MASTER_TRACK**     — download, loudnorm pass-2, upload mastered WAV.
 * - **PITCH_SHIFT_TRACK**— download, pitch shift via ffmpeg, upload.
 * - **AI_MASTER_TRACK**  — download input + reference, DeepAFx-ST + optional loudnorm, upload.
 */
@Controller()
export class AudioProcessorController {
  constructor(
    private readonly s3: S3Service,
    private readonly config: ConfigService,
  ) {}

  /** Build the per-operation logger from the incoming payload's correlation id. */
  private loggerFor(
    op: string,
    p: {
      correlationId: string;
      trackId: string;
      versionId: string;
    },
  ): ContextLogger {
    return createContextLogger('AudioProcessor', {
      correlation_id: p.correlationId,
      op,
      track_id: p.trackId,
      version_id: p.versionId,
    });
  }

  /* ── Ingest guards ─────────────────────────────────────────────── */

  private async assertInputWithinLimits(
    buffer: Buffer,
    label: string,
  ): Promise<void> {
    const maxBytes = this.config.get<number>('MAX_AUDIO_FILE_BYTES')!;
    const maxDuration = this.config.get<number>('MAX_AUDIO_DURATION_SECONDS')!;

    if (buffer.byteLength > maxBytes) {
      throw new BusinessError(
        `${label} exceeds max size (${buffer.byteLength} > ${maxBytes} bytes)`,
        { code: 'AUDIO_FILE_TOO_LARGE', status: 413 },
      );
    }

    const duration = await probeDurationSeconds(buffer);
    if (duration > maxDuration) {
      throw new BusinessError(
        `${label} exceeds max duration (${duration.toFixed(1)}s > ${maxDuration}s)`,
        { code: 'AUDIO_FILE_TOO_LONG', status: 400 },
      );
    }
  }

  /* ── Handlers ──────────────────────────────────────────────────── */

  @MessagePattern(MicroservicePatterns.AudioProcessor.ANALYZE_TRACK)
  async analyzeTrack(
    @Payload() payload: TAnalyzeTrackPayload,
  ): Promise<TAudioAnalysisSnapshot> {
    const { s3Key } = payload;
    const log = this.loggerFor('analyze', payload);

    log.info('Received analyze request');

    const fileBuffer = await measure('analyze', 's3_download', () =>
      this.s3.downloadToBuffer(s3Key),
    );
    log.info('Downloaded input', { bytes: fileBuffer.byteLength });

    await this.assertInputWithinLimits(fileBuffer, 'input');

    const snapshot = await measure('analyze', 'wasm_analysis', () =>
      analyzeAudioFile(fileBuffer),
    );

    log.info('Analysis complete', {
      quality: snapshot.quality,
      integrated_lufs: snapshot.integratedLUFS,
      bpm: snapshot.bpm ?? null,
      key: snapshot.key ?? null,
      key_scale: snapshot.keyScale ?? null,
    });

    return snapshot;
  }

  @MessagePattern(MicroservicePatterns.AudioProcessor.MASTER_TRACK)
  async masterTrack(
    @Payload() payload: TMasterTrackPayload,
  ): Promise<TMasteringResult> {
    const { s3Key, outputS3Key, measured, target } = payload;
    const log = this.loggerFor('master', payload);

    log.info('Received master request', {
      target_lufs: target.targetLUFS,
      target_tp: target.targetTP,
      target_lra: target.targetLRA,
    });

    const fileBuffer = await measure('master', 's3_download', () =>
      this.s3.downloadToBuffer(s3Key),
    );
    log.info('Downloaded input', { bytes: fileBuffer.byteLength });

    await this.assertInputWithinLimits(fileBuffer, 'input');

    const { processedBuffer, report } = await measure(
      'master',
      'ffmpeg_loudnorm',
      () => masterAudio(fileBuffer, measured, target),
    );

    const sizeBytes = await measure('master', 's3_upload', () =>
      this.s3.uploadBuffer(outputS3Key, processedBuffer),
    );

    log.info('Mastering complete', {
      output_s3_key: outputS3Key,
      size_bytes: sizeBytes,
    });

    return { masteredS3Key: outputS3Key, sizeBytes, report };
  }

  @MessagePattern(MicroservicePatterns.AudioProcessor.PITCH_SHIFT_TRACK)
  async pitchShiftTrack(
    @Payload() payload: TPitchShiftTrackPayload,
  ): Promise<TPitchShiftResult> {
    const { s3Key, outputS3Key, semitones } = payload;
    const log = this.loggerFor('pitch_shift', payload);

    log.info('Received pitch-shift request', { semitones });

    const fileBuffer = await measure('pitch_shift', 's3_download', () =>
      this.s3.downloadToBuffer(s3Key),
    );
    log.info('Downloaded input', { bytes: fileBuffer.byteLength });

    await this.assertInputWithinLimits(fileBuffer, 'input');

    const shiftedBuffer = await measure('pitch_shift', 'ffmpeg_pitch', () =>
      pitchShift(fileBuffer, semitones),
    );

    const sizeBytes = await measure('pitch_shift', 's3_upload', () =>
      this.s3.uploadBuffer(outputS3Key, shiftedBuffer, 'audio/wav'),
    );

    log.info('Pitch shift complete', {
      output_s3_key: outputS3Key,
      size_bytes: sizeBytes,
    });

    return { shiftedS3Key: outputS3Key, sizeBytes };
  }

  @MessagePattern(MicroservicePatterns.AudioProcessor.AI_MASTER_TRACK)
  async aiMasterTrack(
    @Payload() payload: TAiMasterTrackPayload,
  ): Promise<TAiMasteringResult> {
    const { s3Key, referenceS3Key, outputS3Key, loudnormTarget } = payload;
    const log = this.loggerFor('ai_master', payload);

    log.info('Received AI master request');

    const deepafxConfig = this.resolveDeepAfxConfig();

    const [fileBuffer, referenceBuffer] = await measure(
      'ai_master',
      's3_download',
      () =>
        Promise.all([
          this.s3.downloadToBuffer(s3Key),
          this.s3.downloadToBuffer(referenceS3Key),
        ]),
    );
    log.info('Downloaded input + reference', {
      input_bytes: fileBuffer.byteLength,
      reference_bytes: referenceBuffer.byteLength,
    });

    await Promise.all([
      this.assertInputWithinLimits(fileBuffer, 'input'),
      this.assertInputWithinLimits(referenceBuffer, 'reference'),
    ]);

    const { processedBuffer, predictedParams, loudnormReport } = await measure(
      'ai_master',
      'deepafx_inference',
      () =>
        aiMasterAudio(
          fileBuffer,
          referenceBuffer,
          deepafxConfig,
          loudnormTarget,
        ),
    );

    const sizeBytes = await measure('ai_master', 's3_upload', () =>
      this.s3.uploadBuffer(outputS3Key, processedBuffer),
    );

    log.info('AI mastering complete', {
      output_s3_key: outputS3Key,
      size_bytes: sizeBytes,
      eq_bands: predictedParams.eq.length,
      compressor_ratio: predictedParams.compressor.ratio,
    });

    return {
      masteredS3Key: outputS3Key,
      sizeBytes,
      predictedParams,
      loudnormReport,
    };
  }

  /**
   * Resolve DeepAFx runtime config from ConfigService.
   * Throws a BusinessError if the checkpoint path is missing — AI mastering
   * is opt-in, so an unset checkpoint means the operator hasn't enabled it.
   */
  private resolveDeepAfxConfig(): DeepAfxConfig {
    const checkpointPath = this.config.get<string>('DEEPAFX_CHECKPOINT_PATH');
    if (!checkpointPath) {
      throw new BusinessError(
        'AI mastering is not configured (DEEPAFX_CHECKPOINT_PATH unset)',
        { code: 'AI_MASTER_NOT_CONFIGURED', status: 503 },
      );
    }
    return {
      pythonBin: this.config.get<string>('DEEPAFX_PYTHON') ?? 'python3',
      workerPath:
        this.config.get<string>('DEEPAFX_WORKER_PATH') ?? DEFAULT_WORKER_PATH,
      checkpointPath,
    };
  }
}
