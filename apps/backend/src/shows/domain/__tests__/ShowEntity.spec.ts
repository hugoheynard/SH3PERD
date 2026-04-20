import { ShowEntity } from '../ShowEntity.js';
import { makeShow, userId } from './test-helpers.js';

describe('ShowEntity', () => {
  it('trims the name on construction', () => {
    const s = makeShow({ name: '  Sunset Gig  ' });
    expect(s.name).toBe('Sunset Gig');
  });

  it('rejects empty names', () => {
    expect(() => makeShow({ name: '   ' })).toThrow('SHOW_NAME_REQUIRED');
  });

  it('defaults createdAt and updatedAt to now when not provided', () => {
    const before = Date.now();
    // Bypass the helper's default to exercise the entity's own defaulting.
    const s = new ShowEntity({
      owner_id: userId(),
      name: 'No timestamps',
      color: 'indigo',
    } as unknown as ConstructorParameters<typeof ShowEntity>[0]);
    expect(s.toDomain.createdAt).toBeGreaterThanOrEqual(before);
    expect(s.toDomain.updatedAt).toBe(s.toDomain.createdAt);
  });

  describe('rename', () => {
    it('updates the name and bumps updatedAt', () => {
      const s = makeShow({ createdAt: 100, updatedAt: 100 });
      s.rename('New Name');
      expect(s.name).toBe('New Name');
      expect(s.toDomain.updatedAt).toBeGreaterThan(100);
    });

    it('rejects empty names', () => {
      const s = makeShow();
      expect(() => s.rename('   ')).toThrow('SHOW_NAME_REQUIRED');
    });
  });

  describe('markPlayed', () => {
    it('stores the timestamp and touches updatedAt', () => {
      const s = makeShow({ updatedAt: 100 });
      s.markPlayed(12345);
      expect(s.lastPlayedAt).toBe(12345);
      expect(s.toDomain.updatedAt).toBeGreaterThan(100);
    });
  });

  describe('isOwnedBy', () => {
    it('returns true for the owner', () => {
      const owner = userId(1);
      const s = makeShow({ owner_id: owner });
      expect(s.isOwnedBy(owner)).toBe(true);
    });

    it('returns false for anyone else', () => {
      const s = makeShow({ owner_id: userId(1) });
      expect(s.isOwnedBy(userId(2))).toBe(false);
    });
  });
});
