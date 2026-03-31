import { z } from 'zod';
import { SVersionTrackId, type TVersionTrackId, type TMusicVersionId, type TUserId } from './ids.js';
import { SRating, type TRating } from './music.domain.schemas.js';
export type { TRating } from './music.domain.schemas.js';

// ─── Audio analysis snapshot ───────────────────────────────

export interface TAudioAnalysisSnapshot {
  integratedLUFS: number;
  loudnessRange:  number;
  truePeakdBTP:   number;
  SNRdB:          number;
  clippingRatio:  number;
  quality:        TRating;
}

export const SAudioAnalysisSnapshot = z.object({
  integratedLUFS: z.number(),
  loudnessRange:  z.number(),
  truePeakdBTP:   z.number(),
  SNRdB:          z.number(),
  clippingRatio:  z.number(),
  quality:        SRating,
});


// ─── Version track domain model ────────────────────────────

/** A single audio file attached to a version. One per version must be `favorite`. */
export interface TVersionTrackDomainModel {
  id:              TVersionTrackId;
  fileName:        string;
  durationSeconds?: number;
  uploadedAt:      number;
  analysisResult?: TAudioAnalysisSnapshot;
  favorite:        boolean;
}

export const SVersionTrackDomainModel = z.object({
  id:               SVersionTrackId,
  fileName:         z.string().min(1),
  durationSeconds:  z.number().positive().optional(),
  uploadedAt:       z.number(),
  analysisResult:   SAudioAnalysisSnapshot.optional(),
  favorite:         z.boolean(),
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
