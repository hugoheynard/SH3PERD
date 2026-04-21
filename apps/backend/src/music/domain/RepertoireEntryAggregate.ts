import { AggregateRoot } from '@nestjs/cqrs';
import type { RepertoireEntryEntity } from './entities/RepertoireEntryEntity.js';
import type { MusicReferenceEntity } from './entities/MusicReferenceEntity.js';
import type { MusicVersionEntity } from './entities/MusicVersionEntity.js';
import { MusicPolicy } from './MusicPolicy.js';
import { DomainError } from '../../utils/errorManagement/DomainError.js';
import type {
  TRepertoireEntryId,
  TMusicReferenceId,
  TMusicVersionId,
  TUserId,
  TRepertoireEntryViewModel,
  TVersionTrackDomainModel,
  TVersionTrackId,
  TAudioAnalysisSnapshot,
} from '@sh3pherd/shared-types';

/**
 * Aggregate root for a user's repertoire entry.
 *
 * Composes:
 * - The repertoire entry itself (ownership link: user ↔ reference)
 * - The music reference (the canonical song)
 * - The user's versions of that song (with nested tracks)
 *
 * All mutations go through this aggregate to enforce business rules via MusicPolicy.
 */
export class RepertoireEntryAggregate extends AggregateRoot {
  private readonly _originalVersionIds: Set<string>;
  private readonly _removedVersions: MusicVersionEntity[] = [];

  constructor(
    private readonly entry: RepertoireEntryEntity,
    private readonly reference: MusicReferenceEntity,
    private readonly versions: MusicVersionEntity[],
    private readonly policy: MusicPolicy = new MusicPolicy(),
  ) {
    super();
    this._originalVersionIds = new Set(versions.map((v) => v.id));
  }

  /* ── Identity ── */

  get id(): TRepertoireEntryId {
    return this.entry.id;
  }
  get musicReference_id(): TMusicReferenceId {
    return this.entry.musicReference_id;
  }
  get owner_id(): TUserId {
    return this.entry.owner_id;
  }

  /* ── Query ── */

  getVersions(): readonly MusicVersionEntity[] {
    return this.versions;
  }

  findVersion(versionId: TMusicVersionId): MusicVersionEntity | undefined {
    return this.versions.find((v) => v.id === versionId);
  }

  /* ── Dirty tracking (for save) ── */

  /** Versions added after load (not in original set). */
  get newVersions(): MusicVersionEntity[] {
    return this.versions.filter((v) => !this._originalVersionIds.has(v.id));
  }

  /** Versions removed since load. */
  get removedVersions(): readonly MusicVersionEntity[] {
    return this._removedVersions;
  }

  /** Versions that existed at load and still exist (may have changes). */
  get existingVersions(): MusicVersionEntity[] {
    return this.versions.filter((v) => this._originalVersionIds.has(v.id));
  }

  /* ── Commands: Version lifecycle ── */

  /** Add a new version. Enforces max versions per reference. */
  addVersion(version: MusicVersionEntity): void {
    this.policy.ensureCanMutateEntry(version.owner_id, this.entry);
    this.policy.ensureCanCreateVersion(this.versions.map((v) => v.toDomain));
    this.versions.push(version);
  }

  /** Remove a version. Returns the removed entity for S3 cleanup. */
  removeVersion(actorId: TUserId, versionId: TMusicVersionId): MusicVersionEntity {
    const idx = this.versions.findIndex((v) => v.id === versionId);
    if (idx === -1) {
      throw new DomainError('Music version not found in aggregate', {
        code: 'MUSIC_VERSION_NOT_FOUND',
        context: { version_id: versionId, entry_id: this.entry.id },
      });
    }

    const version = this.versions[idx];
    this.policy.ensureCanMutateVersion(actorId, version);

    this.versions.splice(idx, 1);
    this._removedVersions.push(version);
    return version;
  }

  /** Update version metadata (label, genre, ratings, etc.). */
  updateVersionMetadata(
    actorId: TUserId,
    versionId: TMusicVersionId,
    patch: Parameters<MusicVersionEntity['updateMetadata']>[0],
  ): void {
    const version = this.getVersionOrThrow(versionId);
    this.policy.ensureCanMutateVersion(actorId, version);
    version.updateMetadata(patch);
  }

  /* ── Commands: Track lifecycle ── */

  /** Validate and return the version for adding a track. */
  ensureCanAddTrack(actorId: TUserId, versionId: TMusicVersionId): MusicVersionEntity {
    const version = this.getVersionOrThrow(versionId);
    this.policy.ensureCanMutateVersion(actorId, version);
    this.policy.ensureCanAddTrack(version);
    return version;
  }

  /** Add a track to a version. Caller must have called ensureCanAddTrack first, or use this for post-validation add. */
  addTrack(actorId: TUserId, versionId: TMusicVersionId, track: TVersionTrackDomainModel): void {
    const version = this.getVersionOrThrow(versionId);
    this.policy.ensureCanMutateVersion(actorId, version);
    version.addTrack(track);
  }

  /** Remove a track. Returns it for S3 cleanup. */
  removeTrack(
    actorId: TUserId,
    versionId: TMusicVersionId,
    trackId: TVersionTrackId,
  ): TVersionTrackDomainModel {
    const version = this.getVersionOrThrow(versionId);
    this.policy.ensureCanMutateVersion(actorId, version);
    return version.removeTrack(trackId);
  }

  /** Set a track as favorite. */
  setFavoriteTrack(actorId: TUserId, versionId: TMusicVersionId, trackId: TVersionTrackId): void {
    const version = this.getVersionOrThrow(versionId);
    this.policy.ensureCanMutateVersion(actorId, version);
    version.setFavoriteTrack(trackId);
  }

  /** Attach analysis result to a track (system action, no ownership check). */
  setTrackAnalysis(
    versionId: TMusicVersionId,
    trackId: TVersionTrackId,
    snapshot: TAudioAnalysisSnapshot,
  ): void {
    const version = this.getVersionOrThrow(versionId);
    version.setTrackAnalysis(trackId, snapshot);
  }

  /* ── Commands: Mastering ── */

  /** Validate mastering preconditions. Returns the version for handler to extract sourceTrack. */
  ensureCanMasterTrack(
    actorId: TUserId,
    versionId: TMusicVersionId,
    trackId: TVersionTrackId,
  ): MusicVersionEntity {
    const version = this.getVersionOrThrow(versionId);
    this.policy.ensureCanMutateVersion(actorId, version);
    this.policy.ensureCanMasterTrack(version);
    this.policy.ensureTrackReadyForProcessing(version, trackId);
    return version;
  }

  /* ── Commands: Derivation (pitch shift) ── */

  /** Validate derivation preconditions. Returns source version. */
  ensureCanDeriveVersion(
    actorId: TUserId,
    versionId: TMusicVersionId,
    trackId: TVersionTrackId,
  ): MusicVersionEntity {
    const version = this.getVersionOrThrow(versionId);
    this.policy.ensureCanMutateVersion(actorId, version);
    this.policy.ensureTrackReadyForProcessing(version, trackId);
    this.policy.ensureCanDeriveVersion(
      this.versions.map((v) => v.toDomain),
      version.id,
    );
    return version;
  }

  /** Add a derived version (pitch_shift). */
  createDerivedVersion(version: MusicVersionEntity): void {
    this.policy.ensureCanCreateVersion(this.versions.map((v) => v.toDomain));
    this.versions.push(version);
  }

  /* ── View adapter ── */

  /** Projects the aggregate into a flat view model for the frontend. */
  toViewModel(): TRepertoireEntryViewModel {
    const ref = this.reference.toDomain;
    return {
      id: this.entry.id,
      reference: {
        id: ref.id,
        title: ref.title,
        originalArtist: ref.artist,
      },
      versions: this.versions.map((v) => v.toDomain),
    };
  }

  /* ── Internals ── */

  private getVersionOrThrow(versionId: TMusicVersionId): MusicVersionEntity {
    const version = this.findVersion(versionId);
    if (!version) {
      throw new DomainError('Music version not found in aggregate', {
        code: 'MUSIC_VERSION_NOT_FOUND',
        context: { version_id: versionId, entry_id: this.entry.id },
      });
    }
    return version;
  }
}
