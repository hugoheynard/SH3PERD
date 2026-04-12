import type {
  TMusicVersionId,
  TVersionTrackId,
  TVersionTrackDomainModel,
  TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';

/**
 * Mastering mode selection.
 *
 * - `standard`  — ffmpeg loudnorm only (existing backend)
 * - `ai`        — DeepAFx-ST + loudnorm, user picks a reference track
 * - `auto`      — DeepAFx-ST + loudnorm with a built-in preset, zero config
 */
export type TMasteringMode = 'standard' | 'ai' | 'auto';

/** Built-in reference presets for AI auto mode. */
export type TMasteringPreset = 'streaming' | 'vinyl' | 'broadcast' | 'acoustic' | 'electronic';

export const MASTERING_PRESETS: readonly { value: TMasteringPreset; label: string; description: string }[] = [
  { value: 'streaming', label: 'Streaming', description: 'Modern, punchy — Spotify, Apple Music, YouTube' },
  { value: 'vinyl',     label: 'Vinyl',     description: 'Warm, dynamic — vinyl pressing, audiophile' },
  { value: 'broadcast', label: 'Broadcast', description: 'Loud, compressed — radio, TV, podcast' },
  { value: 'acoustic',  label: 'Acoustic',  description: 'Natural, transparent — classical, jazz, folk' },
  { value: 'electronic',label: 'Electronic', description: 'Tight low-end, aggressive — EDM, techno, hip-hop' },
];

/** Quick-fill LUFS targets by platform. */
export const LUFS_TARGETS: readonly { label: string; lufs: number; tp: number }[] = [
  { label: 'Spotify',       lufs: -14, tp: -1 },
  { label: 'Apple Music',   lufs: -16, tp: -1 },
  { label: 'YouTube',       lufs: -14, tp: -1 },
  { label: 'Broadcast (EU)',lufs: -23, tp: -1 },
  { label: 'Broadcast (US)',lufs: -24, tp: -2 },
  { label: 'CD / Vinyl',    lufs: -9,  tp: -0.3 },
];

/** The payload sent to the standard mastering endpoint. */
export interface TMasteringRequest {
  versionId: TMusicVersionId;
  trackId: TVersionTrackId;
  mode: TMasteringMode;
  target: TMasteringTargetSpecs;
  /** AI mode: reference track (from user library). */
  referenceVersionId?: TMusicVersionId;
  referenceTrackId?: TVersionTrackId;
  /** Auto mode: built-in preset name. */
  preset?: TMasteringPreset;
}

/**
 * Predicted DSP parameters returned by the AI mastering backend.
 * Each value maps 1:1 to a physical knob on the DeepAFx-ST chain.
 */
export interface TAiMasterPredictedParams {
  eq: Array<{
    type: 'low-shelf' | 'peaking' | 'high-shelf';
    freq: number;
    gain: number;
    q: number;
  }>;
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    knee: number;
    makeupGain: number;
  };
}

/** Full mastering result combining the new track + optional AI params. */
export interface TMasteringResult {
  track: TVersionTrackDomainModel;
  /** Only present for ai / auto modes. */
  predictedParams?: TAiMasterPredictedParams;
}

/** Context passed to the mastering modal. */
export interface TMasteringModalContext {
  versionId: TMusicVersionId;
  trackId: TVersionTrackId;
  trackFileName: string;
  /** Reference title + artist for display. */
  title: string;
  subtitle: string;
  /** Pre-filled from the analysis snapshot if available. */
  currentLUFS?: number;
  currentTP?: number;
  currentLRA?: number;
}
