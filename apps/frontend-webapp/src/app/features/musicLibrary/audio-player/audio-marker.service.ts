import { computed, inject, Injectable, type Signal } from '@angular/core';
import type { TAudioAnalysisSnapshot } from '@sh3pherd/shared-types';
import { AudioPlayerService } from './audio-player.service';

/** Overlay marker rendered on top of the player's waveform. */
export type AudioMarker = {
  kind: 'clipping' | 'loudest';
  /** Left edge as a percentage of the waveform width. */
  leftPct: number;
  /** Width as a percentage of the waveform width. */
  widthPct: number;
  /** Tooltip text. */
  label: string;
};

/**
 * Pure logic — computes the clipping + loudest-window markers displayed
 * on the player's waveform.
 *
 * Two input sources, in priority order:
 *
 * 1. **Per-bucket peaks** (`Float32Array`) from the analysis pipeline.
 *    When present, we walk every bucket to flag individual clipped
 *    regions and compute the loudest N-second window via a sliding RMS.
 * 2. **Snapshot summary stats** (`clippingRatio`, `loudnessRange`).
 *    Fallback for legacy tracks where only aggregate numbers exist;
 *    produces a full-width clipping stripe + a rough mid-track
 *    loudest-window approximation.
 *
 * The service is stateless — it reads `currentTrack()` from
 * `AudioPlayerService` and re-derives via a `computed`. No DOM, no
 * wavesurfer, fully unit-testable in isolation.
 */
@Injectable({ providedIn: 'root' })
export class AudioMarkerService {
  /** Sample amplitude above which a bucket is considered clipped. */
  private static readonly CLIP_THRESHOLD = 0.98;

  /** Ignore clipping regions below this total ratio — likely encoding noise. */
  private static readonly CLIP_MIN_RATIO = 0.0005;

  /** Dynamic-range threshold for surfacing a "loudest section" marker. */
  private static readonly LOUDNESS_RANGE_THRESHOLD_PEAKS = 4;
  private static readonly LOUDNESS_RANGE_THRESHOLD_SNAPSHOT = 6;

  private readonly player = inject(AudioPlayerService);

  /**
   * Markers for the current track's waveform.
   * Empty when no track, no analysis snapshot, or zero duration.
   */
  readonly markers: Signal<AudioMarker[]> = computed(() => {
    const track = this.player.currentTrack();
    const snapshot = track?.analysis;
    if (!snapshot || !track?.durationSeconds) return [];

    if (track.peaks && track.peaks.length > 0) {
      return this.buildMarkersFromPeaks(track.peaks, snapshot);
    }
    return this.buildMarkersFromSnapshot(snapshot);
  });

  /**
   * Builds markers from real peak data. Adjacent clipped buckets are
   * merged into a single region. The loudest window is detected via a
   * sliding RMS over ~5 % of the track duration.
   */
  private buildMarkersFromPeaks(
    peaks: Float32Array,
    snapshot: TAudioAnalysisSnapshot,
  ): AudioMarker[] {
    const markers: AudioMarker[] = [];
    const n = peaks.length;
    if (n === 0) return markers;

    const toPct = (idx: number) => (idx / n) * 100;

    // ── Clipping regions ─────────────────────────────────
    let clipStart: number | null = null;
    let totalClipped = 0;
    for (let i = 0; i <= n; i++) {
      const isClipped = i < n && Math.abs(peaks[i]) >= AudioMarkerService.CLIP_THRESHOLD;
      if (isClipped) {
        if (clipStart === null) clipStart = i;
        totalClipped++;
      } else if (clipStart !== null) {
        markers.push({
          kind: 'clipping',
          leftPct: toPct(clipStart),
          widthPct: Math.max(0.5, toPct(i) - toPct(clipStart)),
          label: 'Clipping detected',
        });
        clipStart = null;
      }
    }

    // If the total clipped ratio is insignificant, drop all clipping markers.
    if (totalClipped / n < AudioMarkerService.CLIP_MIN_RATIO) {
      return markers.filter(m => m.kind !== 'clipping')
        .concat(this.buildLoudestWindow(peaks, snapshot) ?? []);
    }

    const loudest = this.buildLoudestWindow(peaks, snapshot);
    if (loudest) markers.push(loudest);
    return markers;
  }

  /** Sliding-RMS loudest window across ~5 % of the track's peak buckets. */
  private buildLoudestWindow(
    peaks: Float32Array,
    snapshot: TAudioAnalysisSnapshot,
  ): AudioMarker | null {
    if (snapshot.loudnessRange <= AudioMarkerService.LOUDNESS_RANGE_THRESHOLD_PEAKS) {
      return null;
    }

    const n = peaks.length;
    if (n === 0) return null;

    const windowSize = Math.max(10, Math.round(n * 0.05));
    let sumSq = 0;
    for (let i = 0; i < windowSize && i < n; i++) sumSq += peaks[i] * peaks[i];
    let bestRms = sumSq / windowSize;
    let bestStart = 0;

    for (let i = 1; i + windowSize <= n; i++) {
      sumSq -= peaks[i - 1] * peaks[i - 1];
      sumSq += peaks[i + windowSize - 1] * peaks[i + windowSize - 1];
      const rms = sumSq / windowSize;
      if (rms > bestRms) {
        bestRms = rms;
        bestStart = i;
      }
    }

    const toPct = (idx: number) => (idx / n) * 100;
    return {
      kind: 'loudest',
      leftPct: toPct(bestStart),
      widthPct: Math.max(2, toPct(bestStart + windowSize) - toPct(bestStart)),
      label: `Loudest section — dynamic range: ${snapshot.loudnessRange.toFixed(1)} LU`,
    };
  }

  /**
   * Fallback for legacy tracks without per-bucket peaks. Uses the
   * aggregate clipping ratio + loudness range to produce rough stripes.
   */
  private buildMarkersFromSnapshot(snapshot: TAudioAnalysisSnapshot): AudioMarker[] {
    const markers: AudioMarker[] = [];

    if (snapshot.clippingRatio > 0.001) {
      markers.push({
        kind: 'clipping',
        leftPct: 0,
        widthPct: 100,
        label: `${(snapshot.clippingRatio * 100).toFixed(2)}% clipped samples`,
      });
    }

    if (snapshot.loudnessRange > AudioMarkerService.LOUDNESS_RANGE_THRESHOLD_SNAPSHOT) {
      markers.push({
        kind: 'loudest',
        leftPct: 55,
        widthPct: 20,
        label: `Dynamic range: ${snapshot.loudnessRange.toFixed(1)} LU`,
      });
    }

    return markers;
  }
}
