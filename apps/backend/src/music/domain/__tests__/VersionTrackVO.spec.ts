import { VersionTrackVO } from '../entities/VersionTrackVO.js';
import { makeTrack, makeAnalysis, trackId } from './test-helpers.js';

describe('VersionTrackVO', () => {
  // ─── Construction ───────────────────────────────────────

  describe('constructor', () => {
    it('should create a VO with all properties', () => {
      const props = makeTrack({ id: trackId(1), fileName: 'song.mp3' });
      const vo = new VersionTrackVO(props);
      expect(vo.id).toBe(trackId(1));
      expect(vo.fileName).toBe('song.mp3');
      expect(vo.isFavorite).toBe(false);
    });

    it('should freeze props (immutable)', () => {
      const vo = new VersionTrackVO(makeTrack());
      expect(() => {
        (vo.value as any).fileName = 'hacked';
      }).toThrow();
    });
  });

  // ─── Getters ────────────────────────────────────────────

  describe('getters', () => {
    it('should expose uploadedAt', () => {
      const now = Date.now();
      const vo = new VersionTrackVO(makeTrack({ uploadedAt: now }));
      expect(vo.uploadedAt).toBe(now);
    });

    it('should return undefined for optional durationSeconds', () => {
      const vo = new VersionTrackVO(makeTrack());
      expect(vo.durationSeconds).toBeUndefined();
    });

    it('should return analysisResult when set', () => {
      const analysis = makeAnalysis({ bpm: 128 });
      const vo = new VersionTrackVO(makeTrack({ analysisResult: analysis }));
      expect(vo.analysisResult!.bpm).toBe(128);
    });

    it('should return quality from analysis', () => {
      const analysis = makeAnalysis({ quality: 4 as any });
      const vo = new VersionTrackVO(makeTrack({ analysisResult: analysis }));
      expect(vo.quality).toBe(4);
    });

    it('should return undefined quality when no analysis', () => {
      const vo = new VersionTrackVO(makeTrack());
      expect(vo.quality).toBeUndefined();
    });
  });

  // ─── Immutable transformations ──────────────────────────

  describe('withFavorite', () => {
    it('should return a new VO with favorite set', () => {
      const vo = new VersionTrackVO(makeTrack({ favorite: false }));
      const favorited = vo.withFavorite(true);

      expect(favorited.isFavorite).toBe(true);
      expect(vo.isFavorite).toBe(false); // original unchanged
      expect(favorited).not.toBe(vo);
    });
  });

  describe('withAnalysis', () => {
    it('should return a new VO with analysis attached', () => {
      const vo = new VersionTrackVO(makeTrack());
      const analysis = makeAnalysis({ bpm: 140 });
      const analyzed = vo.withAnalysis(analysis);

      expect(analyzed.analysisResult!.bpm).toBe(140);
      expect(vo.analysisResult).toBeUndefined(); // original unchanged
      expect(analyzed).not.toBe(vo);
    });
  });

  // ─── S3 key ─────────────────────────────────────────────

  describe('buildS3Key', () => {
    it('should build the correct storage key', () => {
      const vo = new VersionTrackVO(makeTrack({ id: trackId(1), fileName: 'my-song.mp3' }));
      const key = vo.buildS3Key('userCredential_123', 'musicVer_456');
      expect(key).toBe(`tracks/userCredential_123/musicVer_456/${trackId(1)}/my-song.mp3`);
    });
  });

  // ─── Equality ───────────────────────────────────────────

  describe('equals', () => {
    it('should return true for identical VOs', () => {
      const props = makeTrack({ id: trackId(1) });
      const vo1 = new VersionTrackVO(props);
      const vo2 = new VersionTrackVO(props);
      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for different VOs', () => {
      const vo1 = new VersionTrackVO(makeTrack({ id: trackId(1) }));
      const vo2 = new VersionTrackVO(makeTrack({ id: trackId(2) }));
      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false for undefined', () => {
      const vo = new VersionTrackVO(makeTrack());
      expect(vo.equals(undefined)).toBe(false);
    });
  });
});
