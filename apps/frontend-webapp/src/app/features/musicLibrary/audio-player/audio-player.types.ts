import { decodePeaks } from '@sh3pherd/shared-types';
import type {
  TMusicVersionId,
  TVersionTrackId,
  TVersionTrackDomainModel,
  TAudioAnalysisSnapshot,
} from '@sh3pherd/shared-types';

/**
 * A track ready to be played by the global audio player.
 *
 * We keep the payload small and derived — the service only needs what's
 * required to (a) fetch the presigned URL, (b) display the now-playing
 * row, and (c) draw the waveform overlays from the analysis snapshot.
 * Callers build this from their own view models (table row, card, etc.)
 * so the player never couples to `LibraryEntry` / `MusicVersion`.
 */
export interface TPlayableTrack {
  /** Unique key for tracking queue identity. */
  readonly id: TVersionTrackId;
  /** Parent version id — required to build the presigned download URL. */
  readonly versionId: TMusicVersionId;
  /** Track file name — used if `title` / `label` are unknown. */
  readonly fileName: string;
  /** Display title (usually the reference title). Optional. */
  readonly title?: string;
  /** Display subtitle (usually the original artist + version label). */
  readonly subtitle?: string;
  /** Duration in seconds — populated from analysis when available. */
  readonly durationSeconds?: number;
  /** Analysis snapshot used to overlay loudness / clipping markers. */
  readonly analysis?: TAudioAnalysisSnapshot;
  /**
   * Pre-computed waveform peaks decoded from the analysis snapshot.
   * When present, wavesurfer skips the full-file fetch and draws the
   * waveform instantly from these values. `null` for legacy tracks
   * that were analyzed before the peak extraction was added.
   */
  readonly peaks?: Float32Array;
}

/**
 * Lightweight adapter that converts a `TVersionTrackDomainModel` + display
 * metadata into a `TPlayableTrack` the player can consume. Centralised
 * here so every call site produces consistent payloads.
 */
export function toPlayableTrack(
  track: TVersionTrackDomainModel,
  versionId: TMusicVersionId,
  display: { title?: string; subtitle?: string } = {},
): TPlayableTrack {
  // Decode pre-computed peaks from the analysis snapshot when available.
  // Legacy tracks (analysed before the peaks feature) have no `peaks`
  // field — wavesurfer falls back to fetching the whole file.
  const analysis = track.analysisResult;
  let peaks: Float32Array | undefined;
  if (analysis?.peaks && analysis.peakCount) {
    try {
      peaks = decodePeaks(analysis.peaks, analysis.peakCount);
    } catch {
      // Corrupted peaks — fall back silently.
    }
  }

  return {
    id: track.id,
    versionId,
    fileName: track.fileName,
    title: display.title,
    subtitle: display.subtitle,
    durationSeconds:
      analysis?.durationSeconds ?? track.durationSeconds,
    analysis,
    peaks,
  };
}

/**
 * Loop behaviour across the current queue.
 * - `off`    — stop after the last track
 * - `one`    — repeat the current track indefinitely
 * - `queue`  — wrap back to the first track when the last ends
 */
export type TLoopMode = 'off' | 'one' | 'queue';

/** Playback engine status — used by the UI to render the controls. */
export type TPlaybackStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error';
