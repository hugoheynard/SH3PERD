import { DomainError } from '../../../utils/errorManagement/DomainError.js';
import { MusicPolicy } from '../MusicPolicy.js';
import {
  makeVersion,
  makeTrack,
  makeAnalyzedTrack,
  makeEntry,
  userId,
  versionId,
  trackId,
} from './test-helpers.js';
import type { TMusicVersionDomainModel } from '@sh3pherd/shared-types';

function expectDomainError(fn: () => void, code: string): void {
  try {
    fn();
    fail(`Expected DomainError with code ${code}`);
  } catch (err) {
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe(code);
  }
}

describe('MusicPolicy', () => {
  const policy = new MusicPolicy();

  // ─── Ownership ──────────────────────────────────────────

  describe('ensureCanMutateVersion', () => {
    it('should pass when actor owns the version', () => {
      const owner = userId(1);
      const version = makeVersion({ owner_id: owner });
      expect(() => policy.ensureCanMutateVersion(owner, version)).not.toThrow();
    });

    it('should throw when actor does not own the version', () => {
      const version = makeVersion({ owner_id: userId(1) });
      expectDomainError(
        () => policy.ensureCanMutateVersion(userId(2), version),
        'MUSIC_VERSION_NOT_OWNED',
      );
    });
  });

  describe('ensureCanMutateEntry', () => {
    it('should pass when actor owns the entry', () => {
      const owner = userId(1);
      const entry = makeEntry({ owner_id: owner });
      expect(() => policy.ensureCanMutateEntry(owner, entry)).not.toThrow();
    });

    it('should throw when actor does not own the entry', () => {
      const entry = makeEntry({ owner_id: userId(1) });
      expectDomainError(
        () => policy.ensureCanMutateEntry(userId(2), entry),
        'REPERTOIRE_ENTRY_NOT_OWNED',
      );
    });
  });

  // ─── Track limits ──────────────────────────────────────

  describe('ensureCanAddTrack', () => {
    it('should pass when version has fewer than max tracks', () => {
      const version = makeVersion();
      version.addTrack(makeTrack({ id: trackId(1) }));
      expect(() => policy.ensureCanAddTrack(version)).not.toThrow();
    });

    it('should throw when max tracks reached (2)', () => {
      const version = makeVersion();
      version.addTrack(makeTrack({ id: trackId(1) }));
      version.addTrack(makeTrack({ id: trackId(2) }));
      expectDomainError(() => policy.ensureCanAddTrack(version), 'MAX_TRACKS_REACHED');
    });
  });

  describe('ensureCanMasterTrack', () => {
    it('should pass when no master exists and track slot available', () => {
      const version = makeVersion();
      version.addTrack(makeTrack({ id: trackId(1) }));
      expect(() => policy.ensureCanMasterTrack(version)).not.toThrow();
    });

    it('should throw when a master already exists', () => {
      const version = makeVersion();
      version.addTrack(makeTrack({ id: trackId(1), processingType: 'master' }));
      expectDomainError(() => policy.ensureCanMasterTrack(version), 'MAX_MASTERS_REACHED');
    });

    it('should throw when track slots are full even without master', () => {
      const version = makeVersion();
      version.addTrack(makeTrack({ id: trackId(1) }));
      version.addTrack(makeTrack({ id: trackId(2) }));
      expectDomainError(() => policy.ensureCanMasterTrack(version), 'MAX_TRACKS_REACHED');
    });
  });

  // ─── Track readiness ───────────────────────────────────

  describe('ensureTrackReadyForProcessing', () => {
    it('should pass when track has analysis and s3Key', () => {
      const version = makeVersion();
      version.addTrack(makeAnalyzedTrack(trackId(1)));
      expect(() => policy.ensureTrackReadyForProcessing(version, trackId(1))).not.toThrow();
    });

    it('should throw when track not found', () => {
      const version = makeVersion();
      expectDomainError(
        () => policy.ensureTrackReadyForProcessing(version, trackId(999)),
        'TRACK_NOT_FOUND',
      );
    });

    it('should throw when track has no analysis', () => {
      const version = makeVersion();
      version.addTrack(makeTrack({ id: trackId(1), s3Key: 'some/key' }));
      expectDomainError(
        () => policy.ensureTrackReadyForProcessing(version, trackId(1)),
        'TRACK_NOT_ANALYZED',
      );
    });

    it('should throw when track has no s3Key', () => {
      const version = makeVersion();
      version.addTrack(makeTrack({ id: trackId(1), analysisResult: { bpm: 120 } as any }));
      expectDomainError(
        () => policy.ensureTrackReadyForProcessing(version, trackId(1)),
        'TRACK_NOT_IN_STORAGE',
      );
    });
  });

  // ─── Version creation limits ───────────────────────────

  describe('ensureCanCreateVersion', () => {
    it('should pass when under the limit', () => {
      const versions = Array.from({ length: 9 }, (_, i) => ({
        id: versionId(i),
      })) as TMusicVersionDomainModel[];
      expect(() => policy.ensureCanCreateVersion(versions)).not.toThrow();
    });

    it('should throw when 10 versions exist', () => {
      const versions = Array.from({ length: 10 }, (_, i) => ({
        id: versionId(i),
      })) as TMusicVersionDomainModel[];
      expectDomainError(
        () => policy.ensureCanCreateVersion(versions),
        'MAX_VERSIONS_PER_REFERENCE_REACHED',
      );
    });
  });

  // ─── Derivation limits ─────────────────────────────────

  describe('ensureCanDeriveVersion', () => {
    it('should pass when under both limits', () => {
      const sourceId = versionId(1);
      const versions = [
        { id: versionId(10), parentVersionId: sourceId },
      ] as TMusicVersionDomainModel[];
      expect(() => policy.ensureCanDeriveVersion(versions, sourceId)).not.toThrow();
    });

    it('should throw when global version limit reached', () => {
      const versions = Array.from({ length: 10 }, (_, i) => ({
        id: versionId(i),
      })) as TMusicVersionDomainModel[];
      expectDomainError(
        () => policy.ensureCanDeriveVersion(versions, versionId(1)),
        'MAX_VERSIONS_PER_REFERENCE_REACHED',
      );
    });

    it('should throw when 3 derivations from same source exist', () => {
      const sourceId = versionId(1);
      const versions = Array.from({ length: 3 }, (_, i) => ({
        id: versionId(10 + i),
        parentVersionId: sourceId,
      })) as TMusicVersionDomainModel[];
      expectDomainError(
        () => policy.ensureCanDeriveVersion(versions, sourceId),
        'MAX_DERIVATIONS_PER_SOURCE_REACHED',
      );
    });

    it('should not count derivations from other sources', () => {
      const sourceId = versionId(1);
      const versions = [
        { id: versionId(10), parentVersionId: versionId(2) },
        { id: versionId(11), parentVersionId: versionId(2) },
        { id: versionId(12), parentVersionId: versionId(2) },
        { id: versionId(13), parentVersionId: sourceId },
      ] as TMusicVersionDomainModel[];
      expect(() => policy.ensureCanDeriveVersion(versions, sourceId)).not.toThrow();
    });
  });

  // ─── Injectable limits ──────────────────────────────────

  describe('limits injection', () => {
    it('accepts a custom track limit and enforces it', () => {
      const custom = new MusicPolicy({
        maxTracksPerVersion: 4,
        maxMastersPerVersion: 1,
        maxDerivationsPerSource: 3,
        maxVersionsPerReference: 10,
      });
      const v = makeVersion();
      for (let i = 0; i < 3; i++) v.addTrack(makeTrack());
      expect(() => custom.ensureCanAddTrack(v)).not.toThrow();

      v.addTrack(makeTrack());
      expectDomainError(() => custom.ensureCanAddTrack(v), 'MAX_TRACKS_REACHED');
    });

    it('accepts a relaxed master limit (e.g. Pro plan) allowing multiple masters per version', () => {
      const custom = new MusicPolicy({
        maxTracksPerVersion: 10,
        maxMastersPerVersion: 3,
        maxDerivationsPerSource: 3,
        maxVersionsPerReference: 10,
      });
      const v = makeVersion();
      v.addTrack(makeAnalyzedTrack(trackId(1)));
      v.addTrack({ ...makeAnalyzedTrack(trackId(2)), processingType: 'master' });
      expect(() => custom.ensureCanMasterTrack(v)).not.toThrow();
    });

    it('surfaces the effective limit in the error context', () => {
      const custom = new MusicPolicy({
        maxTracksPerVersion: 1,
        maxMastersPerVersion: 1,
        maxDerivationsPerSource: 3,
        maxVersionsPerReference: 10,
      });
      const v = makeVersion();
      v.addTrack(makeTrack());
      try {
        custom.ensureCanAddTrack(v);
        fail('Expected MAX_TRACKS_REACHED');
      } catch (err) {
        expect((err as DomainError).context).toEqual(expect.objectContaining({ limit: 1 }));
      }
    });
  });
});
