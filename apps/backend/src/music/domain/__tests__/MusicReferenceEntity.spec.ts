import { DomainError } from '../../../utils/errorManagement/DomainError.js';
import { MusicReferenceEntity } from '../entities/MusicReferenceEntity.js';
import { makeReference, userId } from './test-helpers.js';

/** Asserts that fn throws a DomainError with the expected code. */
function expectDomainError(fn: () => void, code: string): void {
  try {
    fn();
    fail(`Expected DomainError with code ${code}`);
  } catch (err) {
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe(code);
  }
}

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
      expectDomainError(() => makeReference({ title: '' }), 'MUSIC_REFERENCE_TITLE_REQUIRED');
    });

    it('should reject whitespace-only title', () => {
      expectDomainError(() => makeReference({ title: '   ' }), 'MUSIC_REFERENCE_TITLE_REQUIRED');
    });

    it('should reject empty artist', () => {
      expectDomainError(() => makeReference({ artist: '' }), 'MUSIC_REFERENCE_ARTIST_REQUIRED');
    });

    it('should reject whitespace-only artist', () => {
      expectDomainError(() => makeReference({ artist: '   ' }), 'MUSIC_REFERENCE_ARTIST_REQUIRED');
    });
  });

  // ─── Creator contribution marker ────────────────────────

  describe('creator', () => {
    it('should expose a user contribution', () => {
      const contributor = userId(1);
      const ref = makeReference({ creator: { type: 'user', id: contributor } });
      expect(ref.creator).toEqual({ type: 'user', id: contributor });
    });

    it('should expose a system contribution with its source', () => {
      const ref = makeReference({ creator: { type: 'system', source: 'musicbrainz' } });
      expect(ref.creator).toEqual({ type: 'system', source: 'musicbrainz' });
    });
  });

  // ─── Factory: create() ──────────────────────────────────

  describe('create()', () => {
    it('should stamp created_at at the moment of contribution', () => {
      const before = Date.now();
      const ref = MusicReferenceEntity.create({
        title: 'Anthem',
        artist: 'Leonard Cohen',
        creator: { type: 'user', id: userId(1) },
      });
      const after = Date.now();
      expect(ref.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(ref.createdAt.getTime()).toBeLessThanOrEqual(after);
    });

    it('should apply the normalization invariants', () => {
      const ref = MusicReferenceEntity.create({
        title: '  Hallelujah  ',
        artist: '  LEONARD Cohen ',
        creator: { type: 'user', id: userId(1) },
      });
      expect(ref.title).toBe('hallelujah');
      expect(ref.artist).toBe('leonard cohen');
    });

    it('should reject empty title via the same domain error', () => {
      expectDomainError(
        () =>
          MusicReferenceEntity.create({
            title: '   ',
            artist: 'Anyone',
            creator: { type: 'user', id: userId(1) },
          }),
        'MUSIC_REFERENCE_TITLE_REQUIRED',
      );
    });
  });

  // ─── Immutability: no mutation methods ──────────────────

  describe('immutability', () => {
    it('should not expose rename or any legacy ownership mutator', () => {
      const ref = makeReference();
      const asRecord = ref as unknown as Record<string, unknown>;
      expect(asRecord['rename']).toBeUndefined();
      expect(asRecord['isOwnedBy']).toBeUndefined();
    });
  });

  // ─── toDomain snapshot ──────────────────────────────────

  describe('toDomain', () => {
    it('should return a plain object copy including creator and created_at', () => {
      const contributor = userId(1);
      const ref = makeReference({
        title: 'Snapshot',
        artist: 'Test',
        creator: { type: 'user', id: contributor },
      });
      const domain = ref.toDomain;
      expect(domain.title).toBe('snapshot');
      expect(domain.artist).toBe('test');
      expect(domain.id).toBe(ref.id);
      expect(domain.creator).toEqual({ type: 'user', id: contributor });
      expect(domain.created_at).toBeInstanceOf(Date);
    });
  });
});
