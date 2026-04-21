import { DomainError } from '../../../utils/errorManagement/DomainError.js';
import {
  makeAggregate,
  makeVersion,
  makeTrack,
  makeAnalyzedTrack,
  makeAnalysis,
  userId,
  versionId,
  trackId,
} from './test-helpers.js';

function expectDomainError(fn: () => void, code: string): void {
  try {
    fn();
    fail(`Expected DomainError with code ${code}`);
  } catch (err) {
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe(code);
  }
}

describe('RepertoireEntryAggregate', () => {
  // ─── Version lifecycle ────────────────────────────────

  describe('addVersion', () => {
    it('should add a version', () => {
      const agg = makeAggregate();
      const version = makeVersion();

      agg.addVersion(version);

      expect(agg.getVersions()).toHaveLength(1);
      expect(agg.newVersions).toHaveLength(1);
    });

    it('should reject if actor does not own the entry', () => {
      const agg = makeAggregate({ owner: userId(1) });
      const version = makeVersion({ owner_id: userId(2) });

      expectDomainError(() => agg.addVersion(version), 'REPERTOIRE_ENTRY_NOT_OWNED');
    });

    it('should reject when max versions reached', () => {
      const owner = userId();
      const versions = Array.from({ length: 10 }, (_, i) =>
        makeVersion({ id: versionId(i + 1), owner_id: owner }),
      );
      const agg = makeAggregate({ owner, versions });

      expectDomainError(
        () => agg.addVersion(makeVersion({ owner_id: owner })),
        'MAX_VERSIONS_PER_REFERENCE_REACHED',
      );
    });
  });

  describe('removeVersion', () => {
    it('should remove a version and track it for deletion', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      const agg = makeAggregate({ owner, versions: [v] });

      const removed = agg.removeVersion(owner, versionId(1));

      expect(removed.id).toBe(versionId(1));
      expect(agg.getVersions()).toHaveLength(0);
      expect(agg.removedVersions).toHaveLength(1);
    });

    it('should reject if version not found', () => {
      const agg = makeAggregate();
      expectDomainError(
        () => agg.removeVersion(userId(), versionId(999)),
        'MUSIC_VERSION_NOT_FOUND',
      );
    });

    it('should reject if actor does not own the version', () => {
      const owner = userId(1);
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      const agg = makeAggregate({ owner, versions: [v] });

      expectDomainError(
        () => agg.removeVersion(userId(2), versionId(1)),
        'MUSIC_VERSION_NOT_OWNED',
      );
    });
  });

  describe('updateVersionMetadata', () => {
    it('should update version metadata', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      const agg = makeAggregate({ owner, versions: [v] });

      agg.updateVersionMetadata(owner, versionId(1), { label: 'Updated' });

      expect(agg.findVersion(versionId(1))!.label).toBe('Updated');
    });

    it('should reject empty label', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      const agg = makeAggregate({ owner, versions: [v] });

      expect(() => agg.updateVersionMetadata(owner, versionId(1), { label: '  ' })).toThrow(
        'MUSIC_VERSION_LABEL_REQUIRED',
      );
    });
  });

  // ─── Track lifecycle ──────────────────────────────────

  describe('addTrack', () => {
    it('should add a track to a version', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      const agg = makeAggregate({ owner, versions: [v] });
      const track = makeTrack({ id: trackId(1) });

      agg.addTrack(owner, versionId(1), track);

      expect(agg.findVersion(versionId(1))!.tracks).toHaveLength(1);
    });

    it('should auto-favorite the first track', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      const agg = makeAggregate({ owner, versions: [v] });
      const track = makeTrack({ id: trackId(1), favorite: false });

      agg.addTrack(owner, versionId(1), track);

      expect(agg.findVersion(versionId(1))!.tracks[0].favorite).toBe(true);
    });
  });

  describe('ensureCanAddTrack', () => {
    it('should reject when max tracks reached', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      v.addTrack(makeTrack({ id: trackId(1) }));
      v.addTrack(makeTrack({ id: trackId(2) }));
      const agg = makeAggregate({ owner, versions: [v] });

      expectDomainError(() => agg.ensureCanAddTrack(owner, versionId(1)), 'MAX_TRACKS_REACHED');
    });
  });

  describe('removeTrack', () => {
    it('should remove a track and return it', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      v.addTrack(makeTrack({ id: trackId(1) }));
      const agg = makeAggregate({ owner, versions: [v] });

      const removed = agg.removeTrack(owner, versionId(1), trackId(1));

      expect(removed.id).toBe(trackId(1));
      expect(agg.findVersion(versionId(1))!.tracks).toHaveLength(0);
    });

    it('should promote next track to favorite when favorite is removed', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      v.addTrack(makeTrack({ id: trackId(1), favorite: true }));
      v.addTrack(makeTrack({ id: trackId(2), favorite: false }));
      const agg = makeAggregate({ owner, versions: [v] });

      agg.removeTrack(owner, versionId(1), trackId(1));

      const tracks = agg.findVersion(versionId(1))!.tracks;
      expect(tracks).toHaveLength(1);
      expect(tracks[0].favorite).toBe(true);
    });
  });

  describe('setFavoriteTrack', () => {
    it('should set favorite and unset others', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      v.addTrack(makeTrack({ id: trackId(1) }));
      v.addTrack(makeTrack({ id: trackId(2) }));
      const agg = makeAggregate({ owner, versions: [v] });

      agg.setFavoriteTrack(owner, versionId(1), trackId(2));

      const tracks = agg.findVersion(versionId(1))!.tracks;
      expect(tracks.find((t) => t.id === trackId(1))!.favorite).toBe(false);
      expect(tracks.find((t) => t.id === trackId(2))!.favorite).toBe(true);
    });
  });

  describe('setTrackAnalysis', () => {
    it('should attach analysis to a track', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      v.addTrack(makeTrack({ id: trackId(1) }));
      const agg = makeAggregate({ owner, versions: [v] });
      const analysis = makeAnalysis({ bpm: 140 });

      agg.setTrackAnalysis(versionId(1), trackId(1), analysis);

      const track = agg.findVersion(versionId(1))!.tracks[0];
      expect(track.analysisResult).toBeDefined();
      expect(track.analysisResult!.bpm).toBe(140);
    });
  });

  // ─── Mastering ────────────────────────────────────────

  describe('ensureCanMasterTrack', () => {
    it('should return version when preconditions are met', () => {
      const owner = userId();
      const t = makeAnalyzedTrack(trackId(1));
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      v.addTrack(t);
      const agg = makeAggregate({ owner, versions: [v] });

      const result = agg.ensureCanMasterTrack(owner, versionId(1), trackId(1));
      expect(result.id).toBe(versionId(1));
    });

    it('should reject if track has no analysis', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      v.addTrack(makeTrack({ id: trackId(1), s3Key: 'some/key' }));
      const agg = makeAggregate({ owner, versions: [v] });

      expectDomainError(
        () => agg.ensureCanMasterTrack(owner, versionId(1), trackId(1)),
        'TRACK_NOT_ANALYZED',
      );
    });

    it('should reject if track has no s3Key', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      v.addTrack(makeTrack({ id: trackId(1), analysisResult: makeAnalysis() }));
      const agg = makeAggregate({ owner, versions: [v] });

      expectDomainError(
        () => agg.ensureCanMasterTrack(owner, versionId(1), trackId(1)),
        'TRACK_NOT_IN_STORAGE',
      );
    });

    it('should reject if max masters reached', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      v.addTrack(makeAnalyzedTrack(trackId(1)));
      v.addTrack(makeTrack({ id: trackId(2), processingType: 'master' }));
      const agg = makeAggregate({ owner, versions: [v] });

      expectDomainError(
        () => agg.ensureCanMasterTrack(owner, versionId(1), trackId(1)),
        'MAX_MASTERS_REACHED',
      );
    });
  });

  // ─── Derivation ───────────────────────────────────────

  describe('ensureCanDeriveVersion', () => {
    it('should return source version when valid', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      v.addTrack(makeAnalyzedTrack(trackId(1)));
      const agg = makeAggregate({ owner, versions: [v] });

      const result = agg.ensureCanDeriveVersion(owner, versionId(1), trackId(1));
      expect(result.id).toBe(versionId(1));
    });

    it('should reject when max derivations per source reached', () => {
      const owner = userId();
      const source = makeVersion({ id: versionId(1), owner_id: owner });
      source.addTrack(makeAnalyzedTrack(trackId(1)));

      const derived = Array.from({ length: 3 }, (_, i) =>
        makeVersion({
          id: versionId(10 + i),
          owner_id: owner,
          parentVersionId: versionId(1),
          derivationType: 'pitch_shift',
        }),
      );

      const agg = makeAggregate({ owner, versions: [source, ...derived] });

      expectDomainError(
        () => agg.ensureCanDeriveVersion(owner, versionId(1), trackId(1)),
        'MAX_DERIVATIONS_PER_SOURCE_REACHED',
      );
    });
  });

  describe('createDerivedVersion', () => {
    it('should add a derived version', () => {
      const owner = userId();
      const agg = makeAggregate({ owner, versions: [] });
      const derived = makeVersion({
        owner_id: owner,
        parentVersionId: versionId(1),
        derivationType: 'pitch_shift',
      });

      agg.createDerivedVersion(derived);

      expect(agg.getVersions()).toHaveLength(1);
      expect(agg.newVersions).toHaveLength(1);
    });
  });

  // ─── Dirty tracking ──────────────────────────────────

  describe('dirty tracking', () => {
    it('should track new versions', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });

      expect(agg.newVersions).toHaveLength(0);

      agg.addVersion(makeVersion({ owner_id: owner }));

      expect(agg.newVersions).toHaveLength(1);
      expect(agg.existingVersions).toHaveLength(0);
    });

    it('should track existing versions', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      const agg = makeAggregate({ owner, versions: [v] });

      expect(agg.existingVersions).toHaveLength(1);
      expect(agg.newVersions).toHaveLength(0);
    });

    it('should track removed versions', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      const agg = makeAggregate({ owner, versions: [v] });

      agg.removeVersion(owner, versionId(1));

      expect(agg.removedVersions).toHaveLength(1);
      expect(agg.existingVersions).toHaveLength(0);
    });
  });

  // ─── View model ───────────────────────────────────────

  describe('toViewModel', () => {
    it('should project the aggregate to a view model', () => {
      const owner = userId();
      const v = makeVersion({ id: versionId(1), owner_id: owner });
      const agg = makeAggregate({ owner, versions: [v] });

      const vm = agg.toViewModel();

      expect(vm.reference.title).toBe('test song');
      expect(vm.reference.originalArtist).toBe('test artist');
      expect(vm.versions).toHaveLength(1);
      expect(vm.versions[0].id).toBe(versionId(1));
    });
  });
});
