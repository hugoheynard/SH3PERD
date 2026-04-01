import { makeReference, userId } from './test-helpers.js';

describe('MusicReferenceEntity', () => {

  // ─── Construction invariants ────────────────────────────

  describe('constructor', () => {
    it('should create a reference with valid props', () => {
      const ref = makeReference({ title: 'Bohemian Rhapsody', artist: 'Queen' });
      expect(ref.title).toBe('bohemian rhapsody');
      expect(ref.artist).toBe('queen');
      expect(ref.id).toMatch(/^musicRef_/);
    });

    it('should trim and lowercase title and artist', () => {
      const ref = makeReference({ title: '  My Song  ', artist: '  The Artist  ' });
      expect(ref.title).toBe('my song');
      expect(ref.artist).toBe('the artist');
    });

    it('should reject empty title', () => {
      expect(() => makeReference({ title: '' })).toThrow('MUSIC_REFERENCE_TITLE_REQUIRED');
    });

    it('should reject whitespace-only title', () => {
      expect(() => makeReference({ title: '   ' })).toThrow('MUSIC_REFERENCE_TITLE_REQUIRED');
    });

    it('should reject empty artist', () => {
      expect(() => makeReference({ artist: '' })).toThrow('MUSIC_REFERENCE_ARTIST_REQUIRED');
    });

    it('should reject whitespace-only artist', () => {
      expect(() => makeReference({ artist: '   ' })).toThrow('MUSIC_REFERENCE_ARTIST_REQUIRED');
    });
  });

  // ─── Ownership ──────────────────────────────────────────

  describe('isOwnedBy', () => {
    it('should return true for the owner', () => {
      const owner = userId(1);
      const ref = makeReference({ owner_id: owner });
      expect(ref.isOwnedBy(owner)).toBe(true);
    });

    it('should return false for another user', () => {
      const ref = makeReference({ owner_id: userId(1) });
      expect(ref.isOwnedBy(userId(2))).toBe(false);
    });
  });

  // ─── Rename ─────────────────────────────────────────────

  describe('rename', () => {
    it('should rename title and artist', () => {
      const ref = makeReference({ title: 'Old Title', artist: 'Old Artist' });
      ref.rename('New Title', 'New Artist');
      expect(ref.title).toBe('new title');
      expect(ref.artist).toBe('new artist');
    });

    it('should trim and lowercase on rename', () => {
      const ref = makeReference();
      ref.rename('  Trimmed  ', '  LOWERED  ');
      expect(ref.title).toBe('trimmed');
      expect(ref.artist).toBe('lowered');
    });

    it('should reject empty title on rename', () => {
      const ref = makeReference();
      expect(() => ref.rename('', 'Artist')).toThrow('MUSIC_REFERENCE_TITLE_REQUIRED');
    });

    it('should reject whitespace-only title on rename', () => {
      const ref = makeReference();
      expect(() => ref.rename('   ', 'Artist')).toThrow('MUSIC_REFERENCE_TITLE_REQUIRED');
    });

    it('should reject empty artist on rename', () => {
      const ref = makeReference();
      expect(() => ref.rename('Title', '')).toThrow('MUSIC_REFERENCE_ARTIST_REQUIRED');
    });

    it('should reject whitespace-only artist on rename', () => {
      const ref = makeReference();
      expect(() => ref.rename('Title', '   ')).toThrow('MUSIC_REFERENCE_ARTIST_REQUIRED');
    });
  });

  // ─── toDomain snapshot ──────────────────────────────────

  describe('toDomain', () => {
    it('should return a plain object copy', () => {
      const ref = makeReference({ title: 'Snapshot', artist: 'Test' });
      const domain = ref.toDomain;
      expect(domain.title).toBe('snapshot');
      expect(domain.artist).toBe('test');
      expect(domain.id).toBe(ref.id);
    });
  });
});
