import { Controller, Logger } from '@nestjs/common';
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
import { analyzeAudioFile } from './core/analyze';
import { masterAudio } from './core/master';
import { pitchShift } from './core/pitch-shift';
import { aiMasterAudio } from './core/ai-master';

/**
 * Handles audio processing requests from the backend via TCP.
 *
 * Four operations:
 * - **ANALYZE_TRACK**    — download from R2, run loudness + BPM/key analysis, return snapshot.
 * - **MASTER_TRACK**     — download from R2, apply loudnorm pass-2 with measured values, upload master to R2.
 * - **PITCH_SHIFT_TRACK**— download from R2, apply pitch shift via ffmpeg, upload to R2.
 * - **AI_MASTER_TRACK**  — download input + reference from R2, run DeepAFx-ST + optional loudnorm, upload to R2.
 */
@Controller()
export class AudioProcessorController {

  private readonly logger = new Logger(AudioProcessorController.name);

  constructor(private readonly s3: S3Service) {}

  /**
   * Analyze a track: download from R2, run loudness (ITU-R BS.1770-4) + BPM/key (Essentia).
   * @returns Full analysis snapshot.
   */
  @MessagePattern(MicroservicePatterns.AudioProcessor.ANALYZE_TRACK)
  async analyzeTrack(@Payload() payload: TAnalyzeTrackPayload): Promise<TAudioAnalysisSnapshot> {
    const { s3Key, trackId, versionId } = payload;

    this.logger.log(`Analyzing track ${trackId} [version=${versionId}]`);

    const fileBuffer = await this.s3.downloadToBuffer(s3Key);
    this.logger.log(`Downloaded ${fileBuffer.byteLength} bytes`);

    const snapshot = await analyzeAudioFile(fileBuffer);

    this.logger.log(
      `Analysis complete — quality=${snapshot.quality}/4, LUFS=${snapshot.integratedLUFS}, ` +
      `BPM=${snapshot.bpm ?? 'N/A'}, key=${snapshot.key ?? 'N/A'} ${snapshot.keyScale ?? ''}`,
    );

    return snapshot;
  };

  /**
   * Master a track: download from R2, apply loudnorm pass-2 using pre-measured values,
   * upload the mastered WAV to R2, return the new S3 key.
   */
  @MessagePattern(MicroservicePatterns.AudioProcessor.MASTER_TRACK)
  async masterTrack(@Payload() payload: TMasterTrackPayload): Promise<TMasteringResult> {
    const { s3Key, outputS3Key, trackId, versionId, measured, target } = payload;

    this.logger.log(
      `Mastering track ${trackId} [version=${versionId}] — ` +
      `target: ${target.targetLUFS} LUFS, ${target.targetTP} dBTP, ${target.targetLRA} LRA`,
    );

    // Download source
    const fileBuffer = await this.s3.downloadToBuffer(s3Key);
    this.logger.log(`Downloaded ${fileBuffer.byteLength} bytes`);

    // Run loudnorm pass-2
    const { processedBuffer, report } = await masterAudio(fileBuffer, measured, target);

    // Upload mastered file to backend-defined path
    const sizeBytes = await this.s3.uploadBuffer(outputS3Key, processedBuffer);

    this.logger.log(`Mastering complete — uploaded ${outputS3Key} (${sizeBytes} bytes)`);

    return { masteredS3Key: outputS3Key, sizeBytes, report };
  };

  /**
   * Pitch-shift a track: download from R2, apply pitch shift via ffmpeg,
   * upload the shifted audio to R2, return the new S3 key.
   */
  @MessagePattern(MicroservicePatterns.AudioProcessor.PITCH_SHIFT_TRACK)
  async pitchShiftTrack(@Payload() payload: TPitchShiftTrackPayload): Promise<TPitchShiftResult> {
    const { s3Key, outputS3Key, trackId, versionId, semitones } = payload;

    this.logger.log(
      `Pitch-shifting track ${trackId} [version=${versionId}] by ${semitones} semitones`,
    );

    // Download source
    const fileBuffer = await this.s3.downloadToBuffer(s3Key);
    this.logger.log(`Downloaded ${fileBuffer.byteLength} bytes`);

    // Apply pitch shift
    const shiftedBuffer = await pitchShift(fileBuffer, semitones);

    // Upload shifted file
    const sizeBytes = await this.s3.uploadBuffer(outputS3Key, shiftedBuffer, 'audio/wav');

    this.logger.log(`Pitch shift complete — uploaded ${outputS3Key} (${sizeBytes} bytes)`);

    return { shiftedS3Key: outputS3Key, sizeBytes };
  };

  /**
   * AI-master a track: download input + reference from R2, run DeepAFx-ST
   * autodiff inference (+ optional loudnorm pass-2), upload the mastered
   * audio to R2, return the new S3 key + predicted DSP parameters.
   */
  @MessagePattern(MicroservicePatterns.AudioProcessor.AI_MASTER_TRACK)
  async aiMasterTrack(@Payload() payload: TAiMasterTrackPayload): Promise<TAiMasteringResult> {
    const { s3Key, referenceS3Key, outputS3Key, trackId, versionId, loudnormTarget } = payload;

    this.logger.log(`AI-mastering track ${trackId} [version=${versionId}]`);

    // Download both files in parallel
    const [fileBuffer, referenceBuffer] = await Promise.all([
      this.s3.downloadToBuffer(s3Key),
      this.s3.downloadToBuffer(referenceS3Key),
    ]);
    this.logger.log(
      `Downloaded input (${fileBuffer.byteLength} bytes) + reference (${referenceBuffer.byteLength} bytes)`,
    );

    const checkpointPath = process.env['DEEPAFX_CHECKPOINT_PATH'] ?? '';

    const { processedBuffer, predictedParams, loudnormReport } =
      await aiMasterAudio(fileBuffer, referenceBuffer, checkpointPath, loudnormTarget);

    // Upload mastered file
    const sizeBytes = await this.s3.uploadBuffer(outputS3Key, processedBuffer);

    this.logger.log(
      `AI mastering complete — uploaded ${outputS3Key} (${sizeBytes} bytes), ` +
      `EQ bands: ${predictedParams.eq.length}, ratio: ${predictedParams.compressor.ratio}:1`,
    );

    return { masteredS3Key: outputS3Key, sizeBytes, predictedParams, loudnormReport };
  };
}
