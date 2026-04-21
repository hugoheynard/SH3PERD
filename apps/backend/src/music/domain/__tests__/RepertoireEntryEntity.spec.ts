import { DomainError } from '../../../utils/errorManagement/DomainError.js';
import { RepertoireEntryEntity } from '../entities/RepertoireEntryEntity.js';
import { makeEntry, userId, refId } from './test-helpers.js';

function expectDomainError(fn: () => void, code: string): void {
  try {
    fn();
    fail(`Expected DomainError with code ${code}`);
  } catch (err) {
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe(code);
  }
}

describe('RepertoireEntryEntity', () => {
  // ─── Construction invariants ────────────────────────────

  describe('constructor', () => {
    it('should create an entry with valid props', () => {
      const entry = makeEntry();
      expect(entry.id).toMatch(/^repEntry_/);
      expect(entry.musicReference_id).toBe(refId());
      expect(entry.owner_id).toBe(userId());
    });

    it('should reject missing musicReference_id', () => {
      expectDomainError(
        () =>
          new RepertoireEntryEntity({
            musicReference_id: '' as any,
            owner_id: userId(),
          }),
        'REPERTOIRE_ENTRY_REFERENCE_REQUIRED',
      );
    });

    it('should reject missing owner_id', () => {
      expectDomainError(
        () =>
          new RepertoireEntryEntity({
            musicReference_id: refId(),
            owner_id: '' as any,
          }),
        'REPERTOIRE_ENTRY_OWNER_REQUIRED',
      );
    });
  });

  // ─── Ownership ──────────────────────────────────────────

  describe('isOwnedBy', () => {
    it('should return true for the owner', () => {
      const owner = userId(1);
      const entry = makeEntry({ owner_id: owner });
      expect(entry.isOwnedBy(owner)).toBe(true);
    });

    it('should return false for another user', () => {
      const entry = makeEntry({ owner_id: userId(1) });
      expect(entry.isOwnedBy(userId(2))).toBe(false);
    });
  });

  // ─── toDomain snapshot ──────────────────────────────────

  describe('toDomain', () => {
    it('should return a plain object copy', () => {
      const entry = makeEntry();
      const domain = entry.toDomain;
      expect(domain.id).toBe(entry.id);
      expect(domain.musicReference_id).toBe(refId());
      expect(domain.owner_id).toBe(userId());
    });
  });
});
