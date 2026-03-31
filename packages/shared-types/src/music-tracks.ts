import { z } from 'zod';
import { SVersionTrackId, type TVersionTrackId, type TMusicVersionId, type TUserId } from './ids.js';
import { SRating, type TRating } from './music.domain.schemas.js';
export type { TRating } from './music.domain.schemas.js';

// ─── Audio analysis snapshot ───────────────────────────────

export interface TAudioAnalysisSnapshot {
  integratedLUFS:  number;
  loudnessRange:   number;
  truePeakdBTP:    number;
  SNRdB:           number;
  clippingRatio:   number;
  quality:         TRating;
  bpm:             number | null;
  key:             string | null;
  keyScale:        string | null;
  keyStrength:     number | null;
  durationSeconds: number;
  sampleRate:      number;
}

export const SAudioAnalysisSnapshot = z.object({
  integratedLUFS:  z.number(),
  loudnessRange:   z.number(),
  truePeakdBTP:    z.number(),
  SNRdB:           z.number(),
  clippingRatio:   z.number(),
  quality:         SRating,
  bpm:             z.number().nullable(),
  key:             z.string().nullable(),
  keyScale:        z.string().nullable(),
  keyStrength:     z.number().nullable(),
  durationSeconds: z.number(),
  sampleRate:      z.number(),
});


// ─── Version track domain model ────────────────────────────

/** Audio processing type — how a track was derived from another track. */
export const STrackProcessingType = z.enum(['master']);
export type TTrackProcessingType = z.infer<typeof STrackProcessingType>;

/** A single audio file attached to a version. One per version must be `favorite`. */
export interface TVersionTrackDomainModel {
  id:               TVersionTrackId;
  fileName:         string;
  durationSeconds?: number;
  uploadedAt:       number;
  analysisResult?:  TAudioAnalysisSnapshot;
  favorite:         boolean;
  parentTrackId?:   TVersionTrackId;
  processingType?:  TTrackProcessingType;
  s3Key?:           string;
}

export const SVersionTrackDomainModel = z.object({
  id:               SVersionTrackId,
  fileName:         z.string().min(1),
  durationSeconds:  z.number().positive().optional(),
  uploadedAt:       z.number(),
  analysisResult:   SAudioAnalysisSnapshot.optional(),
  favorite:         z.boolean(),
  parentTrackId:    SVersionTrackId.optional(),
  processingType:   STrackProcessingType.optional(),
  s3Key:            z.string().optional(),
});


// ─── DTOs ──────────────────────────────────────────────────

export interface TUploadTrackPayload {
  fileName:        string;
  durationSeconds?: number;
}

export const SUploadTrackPayload = z.object({
  fileName:        z.string().min(1),
  durationSeconds: z.number().positive().optional(),
});


// ─── Audio analysis microservice payload ────────────────

/** Sent from backend to audio-processor via TCP to request analysis. */
export interface TAnalyzeTrackPayload {
  s3Key:     string;
  trackId:   TVersionTrackId;
  versionId: TMusicVersionId;
  ownerId:   TUserId;
}

// ─── Mastering microservice payload ─────────────────────

/** Measured loudness values from the initial analysis (used as pass-1 data for loudnorm pass-2). */
export interface TMeasuredLoudness {
  integratedLUFS: number;
  truePeakdBTP:   number;
  loudnessRange:  number;
}

/** Target loudness specs for mastering. */
export interface TMasteringTargetSpecs {
  targetLUFS: number;
  targetTP:   number;
  targetLRA:  number;
}

/** Sent from backend to audio-processor via TCP to request mastering. */
export interface TMasterTrackPayload {
  s3Key:          string;
  outputS3Key:    string;
  trackId:        TVersionTrackId;
  versionId:      TMusicVersionId;
  ownerId:        TUserId;
  measured:       TMeasuredLoudness;
  target:         TMasteringTargetSpecs;
}

/** Returned by audio-processor after mastering. */
export interface TMasteringResult {
  /** S3 key of the mastered file. */
  masteredS3Key: string;
  /** File size in bytes. */
  sizeBytes:     number;
  /** ffmpeg loudnorm report (stderr). */
  report:        string;
}
