import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { TAudioAnalysisSnapshot } from '@sh3pherd/shared-types';
import { AudioMarkerService } from './audio-marker.service';
import { AudioPlayerService } from './audio-player.service';
import type { TPlayableTrack } from './audio-player.types';

/**
 * Helper — build a minimal TAudioAnalysisSnapshot with sensible defaults
 * so each test can override only the fields that matter.
 */
function snapshot(
  overrides: Partial<TAudioAnalysisSnapshot> = {},
): TAudioAnalysisSnapshot {
  return {
    integratedLUFS: -14,
    loudnessRange: 5,
    truePeakdBTP: -1,
    SNRdB: 60,
    clippingRatio: 0,
    quality: 3 as TAudioAnalysisSnapshot['quality'],
    bpm: 120,
    key: 'C',
    keyScale: 'major',
    keyStrength: 0.8,
    durationSeconds: 180,
    sampleRate: 48_000,
    ...overrides,
  };
}

/**
 * Helper — build a minimal TPlayableTrack just rich enough to feed the
 * service. Only `analysis`, `peaks` and `durationSeconds` are consumed.
 */
function track(
  analysis: TAudioAnalysisSnapshot | undefined,
  peaks?: Float32Array,
): TPlayableTrack {
  return {
    id: 't1',
    fileName: 'song.wav',
    url: '',
    durationSeconds: analysis?.durationSeconds,
    analysis,
    peaks,
  } as TPlayableTrack;
}

/**
 * Stub of `AudioPlayerService` exposing only `currentTrack` — a writable
 * signal so each test can swap the track in one line.
 */
class AudioPlayerServiceStub {
  readonly currentTrack = signal<TPlayableTrack | null>(null);
}

describe('AudioMarkerService', () => {
  let service: AudioMarkerService;
  let player: AudioPlayerServiceStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AudioPlayerService, useClass: AudioPlayerServiceStub },
        AudioMarkerService,
      ],
    });
    service = TestBed.inject(AudioMarkerService);
    player = TestBed.inject(
      AudioPlayerService,
    ) as unknown as AudioPlayerServiceStub;
  });

  describe('no input', () => {
    it('returns no markers when no track is playing', () => {
      expect(service.markers()).toEqual([]);
    });

    it('returns no markers when the track has no analysis', () => {
      player.currentTrack.set(track(undefined));
      expect(service.markers()).toEqual([]);
    });

    it('returns no markers when duration is zero', () => {
      player.currentTrack.set(track(snapshot({ durationSeconds: 0 })));
      expect(service.markers()).toEqual([]);
    });
  });

  describe('snapshot fallback (no peaks)', () => {
    it('emits a full-width clipping stripe above ratio threshold', () => {
      player.currentTrack.set(track(snapshot({ clippingRatio: 0.02 })));
      const markers = service.markers();
      const clip = markers.find((m) => m.kind === 'clipping')!;
      expect(clip).toBeDefined();
      expect(clip.leftPct).toBe(0);
      expect(clip.widthPct).toBe(100);
      expect(clip.label).toContain('2.00%');
    });

    it('does not emit a clipping marker when the ratio is negligible', () => {
      player.currentTrack.set(track(snapshot({ clippingRatio: 0.0005 })));
      expect(service.markers().filter((m) => m.kind === 'clipping')).toEqual(
        [],
      );
    });

    it('emits a loudest-window marker when dynamic range is high', () => {
      player.currentTrack.set(track(snapshot({ loudnessRange: 10 })));
      expect(service.markers().some((m) => m.kind === 'loudest')).toBe(true);
    });

    it('does not emit a loudest marker for a narrow dynamic range', () => {
      player.currentTrack.set(track(snapshot({ loudnessRange: 3 })));
      expect(service.markers().some((m) => m.kind === 'loudest')).toBe(false);
    });
  });

  describe('per-bucket peaks', () => {
    /**
     * Build a peaks array where a contiguous region [start, end) exceeds
     * the clip threshold (0.98). All other buckets sit at 0.2 (safe).
     */
    function peaksWithClipRegion(
      length: number,
      start: number,
      end: number,
      amp = 0.99,
    ): Float32Array {
      const arr = new Float32Array(length).fill(0.2);
      for (let i = start; i < end; i++) arr[i] = amp;
      return arr;
    }

    it('merges a contiguous clipped region into a single marker', () => {
      // 200 buckets, 20 clipped in the middle → 10% clipped, well above
      // the 0.05% noise floor.
      const peaks = peaksWithClipRegion(200, 80, 100);
      player.currentTrack.set(track(snapshot(), peaks));

      const clipMarkers = service
        .markers()
        .filter((m) => m.kind === 'clipping');
      expect(clipMarkers.length).toBe(1);
      expect(clipMarkers[0].leftPct).toBeCloseTo(40, 1); // 80/200 * 100
      expect(clipMarkers[0].widthPct).toBeCloseTo(10, 1); // (100-80)/200 * 100
    });

    it('detects multiple non-contiguous clipped regions', () => {
      const peaks = new Float32Array(200).fill(0.2);
      // Region A: 10-15 (5 buckets)
      for (let i = 10; i < 15; i++) peaks[i] = 0.99;
      // Region B: 180-200 (20 buckets — makes total ratio ~12.5%)
      for (let i = 180; i < 200; i++) peaks[i] = 0.99;
      player.currentTrack.set(track(snapshot(), peaks));

      const clipMarkers = service
        .markers()
        .filter((m) => m.kind === 'clipping');
      expect(clipMarkers.length).toBe(2);
    });

    it('drops all clipping markers when the total ratio is below the noise floor', () => {
      // 1 clipped bucket out of 10 000 = 0.01% < 0.05% threshold
      const peaks = new Float32Array(10_000).fill(0.2);
      peaks[42] = 0.99;
      player.currentTrack.set(track(snapshot(), peaks));

      expect(service.markers().filter((m) => m.kind === 'clipping')).toEqual(
        [],
      );
    });

    it('locates the loudest window via sliding RMS', () => {
      // Quiet everywhere except a burst at buckets 100-110.
      const peaks = new Float32Array(200).fill(0.05);
      for (let i = 100; i < 110; i++) peaks[i] = 0.95;
      player.currentTrack.set(track(snapshot({ loudnessRange: 8 }), peaks));

      const loudest = service.markers().find((m) => m.kind === 'loudest')!;
      expect(loudest).toBeDefined();
      // Window size = max(10, 5% of 200) = 10. Best start should land
      // around bucket 100 (where the burst begins).
      expect(loudest.leftPct).toBeGreaterThanOrEqual(45);
      expect(loudest.leftPct).toBeLessThanOrEqual(55);
    });

    it('skips the loudest marker when dynamic range is too narrow', () => {
      const peaks = new Float32Array(200).fill(0.05);
      for (let i = 100; i < 110; i++) peaks[i] = 0.95;
      player.currentTrack.set(track(snapshot({ loudnessRange: 2 }), peaks));

      expect(service.markers().some((m) => m.kind === 'loudest')).toBe(false);
    });

    it('handles an empty peaks array gracefully', () => {
      player.currentTrack.set(track(snapshot(), new Float32Array(0)));
      // Empty peaks → service falls through to snapshot fallback via the
      // guard in `markers`; with default loudness=5 and clipping=0,
      // expect an empty result.
      expect(service.markers()).toEqual([]);
    });
  });

  describe('reactive recomputation', () => {
    it('re-derives markers when the current track changes', () => {
      player.currentTrack.set(track(snapshot({ clippingRatio: 0.02 })));
      expect(service.markers().some((m) => m.kind === 'clipping')).toBe(true);

      player.currentTrack.set(track(snapshot({ clippingRatio: 0 })));
      expect(service.markers().some((m) => m.kind === 'clipping')).toBe(false);
    });
  });
});
