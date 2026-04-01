import { MusicVersionEntity } from '../entities/MusicVersionEntity.js';
import { makeVersion, makeTrack, makeAnalysis, userId, refId, trackId, versionId, GENRE, VERSION_TYPE } from './test-helpers.js';
import type { TMusicRating } from '@sh3pherd/shared-types';

describe('MusicVersionEntity', () => {

  // ─── Construction invariants ────────────────────────────

  describe('constructor', () => {
    it('should create a version with valid props', () => {
      const v = makeVersion({ label: 'My Cover' });
      expect(v.label).toBe('My Cover');
      expect(v.id).toMatch(/^musicVer_/);
    });

    it('should use provided id', () => {
      const v = makeVersion({ id: versionId(42) });
      expect(v.id).toBe(versionId(42));
    });

    it('should trim the label', () => {
      const v = makeVersion({ label: '  Acoustic  ' });
      expect(v.label).toBe('Acoustic');
    });

    it('should reject empty label', () => {
      expect(() => makeVersion({ label: '' })).toThrow('MUSIC_VERSION_LABEL_REQUIRED');
    });

    it('should reject whitespace-only label', () => {
      expect(() => makeVersion({ label: '   ' })).toThrow('MUSIC_VERSION_LABEL_REQUIRED');
    });

    it('should reject missing owner_id', () => {
      expect(() => new MusicVersionEntity({
        owner_id: '' as any,
        musicReference_id: refId(),
        label: 'Test',
        genre: GENRE.Pop,
        type: VERSION_TYPE.Original,
        bpm: null,
        pitch: null,
        mastery: 3 as TMusicRating,
        energy: 3 as TMusicRating,
        effort: 2 as TMusicRating,
        tracks: [],
      })).toThrow('MUSIC_VERSION_OWNER_REQUIRED');
    });

    it('should reject missing musicReference_id', () => {
      expect(() => new MusicVersionEntity({
        owner_id: userId(),
        musicReference_id: '' as any,
        label: 'Test',
        genre: GENRE.Pop,
        type: VERSION_TYPE.Original,
        bpm: null,
        pitch: null,
        mastery: 3 as TMusicRating,
        energy: 3 as TMusicRating,
        effort: 2 as TMusicRating,
        tracks: [],
      })).toThrow('MUSIC_VERSION_REFERENCE_REQUIRED');
    });
  });

  // ─── Ownership ──────────────────────────────────────────

  describe('isOwnedBy', () => {
    it('should return true for the owner', () => {
      const owner = userId(1);
      const v = makeVersion({ owner_id: owner });
      expect(v.isOwnedBy(owner)).toBe(true);
    });

    it('should return false for another user', () => {
      const v = makeVersion({ owner_id: userId(1) });
      expect(v.isOwnedBy(userId(2))).toBe(false);
    });
  });

  // ─── updateMetadata ─────────────────────────────────────

  describe('updateMetadata', () => {
    it('should update label', () => {
      const v = makeVersion({ label: 'Original' });
      v.updateMetadata({ label: 'Updated' });
      expect(v.label).toBe('Updated');
    });

    it('should trim updated label', () => {
      const v = makeVersion();
      v.updateMetadata({ label: '  Trimmed  ' });
      expect(v.label).toBe('Trimmed');
    });

    it('should reject empty label update', () => {
      const v = makeVersion();
      expect(() => v.updateMetadata({ label: '' })).toThrow('MUSIC_VERSION_LABEL_REQUIRED');
    });

    it('should reject whitespace-only label update', () => {
      const v = makeVersion();
      expect(() => v.updateMetadata({ label: '   ' })).toThrow('MUSIC_VERSION_LABEL_REQUIRED');
    });

    it('should partially update only provided fields', () => {
      const v = makeVersion({ label: 'Original', genre: GENRE.Pop, bpm: null });
      v.updateMetadata({ genre: GENRE.Rock, bpm: 120 });
      expect(v.label).toBe('Original');
      expect(v.toDomain.genre).toBe(GENRE.Rock);
      expect(v.toDomain.bpm).toBe(120);
    });

    it('should allow setting bpm to null', () => {
      const v = makeVersion({ bpm: 120 });
      v.updateMetadata({ bpm: null });
      expect(v.toDomain.bpm).toBeNull();
    });

    it('should update ratings', () => {
      const v = makeVersion({ mastery: 3 as TMusicRating, energy: 3 as TMusicRating });
      v.updateMetadata({ mastery: 5 as TMusicRating, energy: 1 as TMusicRating });
      expect(v.toDomain.mastery).toBe(5);
      expect(v.toDomain.energy).toBe(1);
    });
  });

  // ─── Track management ──────────────────────────────────

  describe('addTrack', () => {
    it('should add a track', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1) }));
      expect(v.tracks).toHaveLength(1);
    });

    it('should auto-favorite the first track', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1), favorite: false }));
      expect(v.tracks[0].favorite).toBe(true);
    });

    it('should preserve favorite=false on second track', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1) }));
      v.addTrack(makeTrack({ id: trackId(2), favorite: false }));
      expect(v.tracks[1].favorite).toBe(false);
    });
  });

  describe('removeTrack', () => {
    it('should remove a track by id', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1) }));
      const removed = v.removeTrack(trackId(1));
      expect(removed.id).toBe(trackId(1));
      expect(v.tracks).toHaveLength(0);
    });

    it('should throw if track not found', () => {
      const v = makeVersion();
      expect(() => v.removeTrack(trackId(999))).toThrow('TRACK_NOT_FOUND');
    });

    it('should promote next track to favorite when favorite is removed', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1), favorite: true }));
      v.addTrack(makeTrack({ id: trackId(2), favorite: false }));

      v.removeTrack(trackId(1));

      expect(v.tracks).toHaveLength(1);
      expect(v.tracks[0].id).toBe(trackId(2));
      expect(v.tracks[0].favorite).toBe(true);
    });

    it('should not promote when non-favorite is removed', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1), favorite: true }));
      v.addTrack(makeTrack({ id: trackId(2), favorite: false }));

      v.removeTrack(trackId(2));

      expect(v.tracks).toHaveLength(1);
      expect(v.tracks[0].favorite).toBe(true);
    });
  });

  describe('setFavoriteTrack', () => {
    it('should set the given track as favorite and unset others', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1) })); // auto-favorite
      v.addTrack(makeTrack({ id: trackId(2), favorite: false }));

      v.setFavoriteTrack(trackId(2));

      expect(v.tracks.find(t => t.id === trackId(1))!.favorite).toBe(false);
      expect(v.tracks.find(t => t.id === trackId(2))!.favorite).toBe(true);
    });

    it('should throw if track not found', () => {
      const v = makeVersion();
      expect(() => v.setFavoriteTrack(trackId(999))).toThrow('TRACK_NOT_FOUND');
    });
  });

  describe('setTrackAnalysis', () => {
    it('should attach analysis to a track', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1) }));
      const analysis = makeAnalysis({ bpm: 140, key: 'Am' });

      v.setTrackAnalysis(trackId(1), analysis);

      expect(v.tracks[0].analysisResult).toBeDefined();
      expect(v.tracks[0].analysisResult!.bpm).toBe(140);
      expect(v.tracks[0].analysisResult!.key).toBe('Am');
    });

    it('should throw if track not found', () => {
      const v = makeVersion();
      expect(() => v.setTrackAnalysis(trackId(999), makeAnalysis())).toThrow('TRACK_NOT_FOUND');
    });
  });

  // ─── Query helpers ──────────────────────────────────────

  describe('findTrack', () => {
    it('should return the track if found', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1), fileName: 'song.mp3' }));
      expect(v.findTrack(trackId(1))!.fileName).toBe('song.mp3');
    });

    it('should return undefined if not found', () => {
      const v = makeVersion();
      expect(v.findTrack(trackId(999))).toBeUndefined();
    });
  });

  describe('getTrackOrThrow', () => {
    it('should return the track if found', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1) }));
      expect(v.getTrackOrThrow(trackId(1)).id).toBe(trackId(1));
    });

    it('should throw if not found', () => {
      const v = makeVersion();
      expect(() => v.getTrackOrThrow(trackId(999))).toThrow('TRACK_NOT_FOUND');
    });
  });

  describe('favoriteTrack', () => {
    it('should return the favorite track', () => {
      const v = makeVersion();
      v.addTrack(makeTrack({ id: trackId(1) })); // auto-favorite
      expect(v.favoriteTrack!.id).toBe(trackId(1));
    });

    it('should return undefined when no tracks', () => {
      const v = makeVersion();
      expect(v.favoriteTrack).toBeUndefined();
    });
  });

  describe('hasTrack', () => {
    it('should return false when empty', () => {
      const v = makeVersion();
      expect(v.hasTrack).toBe(false);
    });

    it('should return true when has tracks', () => {
      const v = makeVersion();
      v.addTrack(makeTrack());
      expect(v.hasTrack).toBe(true);
    });
  });

  // ─── toDomain snapshot ──────────────────────────────────

  describe('toDomain', () => {
    it('should return a plain object copy', () => {
      const v = makeVersion({ label: 'Snapshot' });
      const domain = v.toDomain;
      expect(domain.label).toBe('Snapshot');
      expect(domain.id).toBe(v.id);
      expect(domain).not.toBe(v); // different reference
    });
  });
});
