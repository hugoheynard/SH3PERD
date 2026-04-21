import { z } from "zod";
import {
  SVersionTrackId,
  type TVersionTrackId,
  type TMusicVersionId,
  type TUserId,
} from "./ids.js";
import { SRating, type TMusicRating } from "./music.domain.schemas.js";
export type { TMusicRating } from "./music.domain.schemas.js";

// ─── Audio analysis snapshot ───────────────────────────────

export interface TAudioAnalysisSnapshot {
  integratedLUFS: number;
  loudnessRange: number;
  truePeakdBTP: number;
  SNRdB: number;
  clippingRatio: number;
  quality: TMusicRating;
  bpm: number | null;
  key: string | null;
  keyScale: string | null;
  keyStrength: number | null;
  durationSeconds: number;
  sampleRate: number;
  /**
   * Base64-encoded Int16 waveform peaks — a compact representation of
   * the audio envelope used to draw waveforms without downloading the
   * file. Optional for backwards compatibility with pre-peak tracks.
   *
   * Encode with `encodePeaks`, decode with `decodePeaks`.
   */
  peaks?: string;
  /** Number of peaks encoded in the `peaks` string. */
  peakCount?: number;
}

export const SAudioAnalysisSnapshot = z.object({
  integratedLUFS: z.number(),
  loudnessRange: z.number(),
  truePeakdBTP: z.number(),
  SNRdB: z.number(),
  clippingRatio: z.number(),
  quality: SRating,
  bpm: z.number().nullable(),
  key: z.string().nullable(),
  keyScale: z.string().nullable(),
  keyStrength: z.number().nullable(),
  durationSeconds: z.number(),
  sampleRate: z.number(),
  peaks: z.string().optional(),
  peakCount: z.number().int().positive().optional(),
});

// ─── Waveform peak helpers ────────────────────────────────

/** Default number of peaks to extract per track — 2000 gives good
 *  resolution on any screen width while keeping ~4 KB of storage. */
export const PEAK_TARGET_COUNT = 2000;

/**
 * Encode a Float32Array of normalised peaks ([-1, 1]) into a compact
 * base64 string of Int16 values. The encoding halves the storage cost
 * vs raw JSON floats and round-trips losslessly to ±1/32767 precision.
 */
export function encodePeaks(floats: Float32Array): string {
  const int16 = new Int16Array(floats.length);
  for (let i = 0; i < floats.length; i++) {
    int16[i] = Math.round(Math.max(-1, Math.min(1, floats[i])) * 32767);
  }
  const bytes = new Uint8Array(
    int16.buffer,
    int16.byteOffset,
    int16.byteLength,
  );
  // Buffer.from works in Node; btoa(String.fromCharCode) works in the browser.
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/**
 * Decode a base64 peaks string back into a Float32Array of normalised
 * values ([-1, 1]). `count` must match the original `peakCount`.
 */
export function decodePeaks(encoded: string, count: number): Float32Array {
  let bytes: Uint8Array;
  if (typeof Buffer !== "undefined") {
    bytes = new Uint8Array(Buffer.from(encoded, "base64"));
  } else {
    const binary = atob(encoded);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, count);
  const floats = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    floats[i] = int16[i] / 32767;
  }
  return floats;
}

/**
 * Extract a downsampled peak envelope from raw PCM samples.
 * Returns `targetCount` float values in [0, 1] (absolute amplitude).
 * Operates on mono samples — caller should mix down beforehand.
 */
export function extractPeaks(
  monoSamples: Float32Array,
  targetCount: number = PEAK_TARGET_COUNT,
): Float32Array {
  const n = monoSamples.length;
  const count = Math.min(targetCount, n);
  const bucketSize = n / count;
  const peaks = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    let max = 0;
    for (let j = start; j < end; j++) {
      const abs = Math.abs(monoSamples[j]);
      if (abs > max) max = abs;
    }
    peaks[i] = max;
  }

  return peaks;
}

// ─── Version track domain model ────────────────────────────

/** Audio processing type — how a track was derived from another track. */
export const STrackProcessingType = z.enum(["master", "ai_master"]);
export type TTrackProcessingType = z.infer<typeof STrackProcessingType>;

/** A single audio file attached to a version. One per version must be `favorite`. */
export interface TVersionTrackDomainModel {
  id: TVersionTrackId;
  fileName: string;
  durationSeconds?: number;
  uploadedAt: number;
  analysisResult?: TAudioAnalysisSnapshot;
  favorite: boolean;
  parentTrackId?: TVersionTrackId;
  processingType?: TTrackProcessingType;
  s3Key?: string;
  /**
   * Size in bytes of the R2/S3 object. Recorded at upload / master /
   * pitch-shift time so the `storage_bytes` quota can be credited back
   * when the track is deleted. Optional for backwards compatibility
   * with tracks created before the field was introduced.
   */
  sizeBytes?: number;
}

export const SVersionTrackDomainModel = z.object({
  id: SVersionTrackId,
  fileName: z.string().min(1),
  durationSeconds: z.number().positive().optional(),
  uploadedAt: z.number(),
  analysisResult: SAudioAnalysisSnapshot.optional(),
  favorite: z.boolean(),
  parentTrackId: SVersionTrackId.optional(),
  processingType: STrackProcessingType.optional(),
  s3Key: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
});

// ─── DTOs ──────────────────────────────────────────────────

export interface TUploadTrackPayload {
  fileName: string;
  durationSeconds?: number;
}

export const SUploadTrackPayload = z.object({
  fileName: z.string().min(1),
  durationSeconds: z.number().positive().optional(),
});

// ─── Audio analysis microservice payload ────────────────

/** Sent from backend to audio-processor via TCP to request analysis. */
export interface TAnalyzeTrackPayload {
  s3Key: string;
  trackId: TVersionTrackId;
  versionId: TMusicVersionId;
  ownerId: TUserId;
}

// ─── Mastering microservice payload ─────────────────────

/** Measured loudness values from the initial analysis (used as pass-1 data for loudnorm pass-2). */
export interface TMeasuredLoudness {
  integratedLUFS: number;
  truePeakdBTP: number;
  loudnessRange: number;
}

/** Target loudness specs for mastering. */
export interface TMasteringTargetSpecs {
  targetLUFS: number;
  targetTP: number;
  targetLRA: number;
}

/** Sent from backend to audio-processor via TCP to request mastering. */
export interface TMasterTrackPayload {
  s3Key: string;
  outputS3Key: string;
  trackId: TVersionTrackId;
  versionId: TMusicVersionId;
  ownerId: TUserId;
  measured: TMeasuredLoudness;
  target: TMasteringTargetSpecs;
}

/** Returned by audio-processor after mastering. */
export interface TMasteringResult {
  /** S3 key of the mastered file. */
  masteredS3Key: string;
  /** File size in bytes. */
  sizeBytes: number;
  /** ffmpeg loudnorm report (stderr). */
  report: string;
}

// ─── Pitch shift microservice payload ────────────────────

/** Sent from backend to audio-processor via TCP to request pitch shifting. */
export interface TPitchShiftTrackPayload {
  s3Key: string;
  outputS3Key: string;
  trackId: TVersionTrackId;
  versionId: TMusicVersionId;
  ownerId: TUserId;
  /** Number of semitones to shift (positive = up, negative = down). */
  semitones: number;
}

/** Returned by audio-processor after pitch shifting. */
export interface TPitchShiftResult {
  shiftedS3Key: string;
  sizeBytes: number;
}

// ─── AI Mastering (DeepAFx-ST) ────────────────────────────

/**
 * Predicted DSP parameters from DeepAFx-ST autodiff inference.
 * Each value maps 1:1 to a physical control on the processing chain.
 * Interpretable and displayable to the user.
 */
export interface TAiMasterEqBand {
  type: "low-shelf" | "peaking" | "high-shelf";
  /** Center/cutoff frequency in Hz. */
  freq: number;
  /** Gain in dB (negative = cut, positive = boost). */
  gain: number;
  /** Q factor (bandwidth). */
  q: number;
}

export interface TAiMasterCompressorParams {
  /** Threshold in dB. */
  threshold: number;
  /** Compression ratio (e.g. 3.2 means 3.2:1). */
  ratio: number;
  /** Attack time in seconds. */
  attack: number;
  /** Release time in seconds. */
  release: number;
  /** Knee width in dB. */
  knee: number;
  /** Makeup gain in dB. */
  makeupGain: number;
}

export interface TAiMasterPredictedParams {
  eq: TAiMasterEqBand[];
  compressor: TAiMasterCompressorParams;
}

/** Sent from backend to audio-processor via TCP to request AI mastering. */
export interface TAiMasterTrackPayload {
  s3Key: string;
  /** S3 key of the reference track to match the style of. */
  referenceS3Key: string;
  outputS3Key: string;
  trackId: TVersionTrackId;
  versionId: TMusicVersionId;
  ownerId: TUserId;
  /** Optional loudnorm target applied as stage 2 after DeepAFx-ST. */
  loudnormTarget?: TMasteringTargetSpecs;
}

/** Returned by audio-processor after AI mastering. */
export interface TAiMasteringResult {
  masteredS3Key: string;
  sizeBytes: number;
  /** The predicted DSP parameters — interpretable by the frontend. */
  predictedParams: TAiMasterPredictedParams;
  /** ffmpeg loudnorm report from stage 2, if loudnormTarget was provided. */
  loudnormReport?: string;
}
