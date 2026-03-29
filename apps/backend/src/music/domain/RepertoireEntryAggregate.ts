import { AggregateRoot } from '@nestjs/cqrs';
import { RepertoireEntryEntity } from './entities/RepertoireEntryEntity.js';
import { MusicReferenceEntity } from './entities/MusicReferenceEntity.js';
import { MusicVersionEntity } from './entities/MusicVersionEntity.js';
import { MusicPolicy } from './MusicPolicy.js';
import type {
  TRepertoireEntryId,
  TMusicReferenceId,
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
 * All mutations go through this aggregate to enforce business rules.
 */
export class RepertoireEntryAggregate extends AggregateRoot {

  constructor(
    private readonly entry: RepertoireEntryEntity,
    private readonly reference: MusicReferenceEntity,
    private readonly versions: MusicVersionEntity[],
    private readonly policy: MusicPolicy = new MusicPolicy(),
  ) {
    super();
  }

  /* ── Identity ── */

  get id(): TRepertoireEntryId { return this.entry.id; }
  get musicReference_id(): TMusicReferenceId { return this.entry.musicReference_id; }
  get user_id(): TUserId { return this.entry.user_id; }

  /* ── Query ── */

  getVersions(): readonly MusicVersionEntity[] {
    return this.versions;
  }

  findVersion(versionId: string): MusicVersionEntity | undefined {
    return this.versions.find(v => v.id === versionId);
  }

  /* ── Commands: Version lifecycle ── */

  addVersion(version: MusicVersionEntity): void {
    this.policy.ensureCanMutateEntry(version.owner_id, this.entry);
    this.versions.push(version);
  }

  removeVersion(actorId: TUserId, versionId: string): MusicVersionEntity {
    const idx = this.versions.findIndex(v => v.id === versionId);
    if (idx === -1) throw new Error('MUSIC_VERSION_NOT_FOUND');

    const version = this.versions[idx];
    this.policy.ensureCanMutateVersion(actorId, version);

    this.versions.splice(idx, 1);
    return version;
  }

  /* ── Commands: Track lifecycle (delegated to version entity) ── */

  addTrack(actorId: TUserId, versionId: string, track: TVersionTrackDomainModel): void {
    const version = this.getVersionOrThrow(versionId);
    this.policy.ensureCanMutateVersion(actorId, version);
    version.addTrack(track);
  }

  removeTrack(actorId: TUserId, versionId: string, trackId: TVersionTrackId): TVersionTrackDomainModel {
    const version = this.getVersionOrThrow(versionId);
    this.policy.ensureCanMutateVersion(actorId, version);
    return version.removeTrack(trackId);
  }

  setFavoriteTrack(actorId: TUserId, versionId: string, trackId: TVersionTrackId): void {
    const version = this.getVersionOrThrow(versionId);
    this.policy.ensureCanMutateVersion(actorId, version);
    version.setFavoriteTrack(trackId);
  }

  setTrackAnalysis(versionId: string, trackId: TVersionTrackId, snapshot: TAudioAnalysisSnapshot): void {
    const version = this.getVersionOrThrow(versionId);
    version.setTrackAnalysis(trackId, snapshot);
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
      versions: this.versions.map(v => v.toDomain),
    };
  }

  /* ── Internals ── */

  private getVersionOrThrow(versionId: string): MusicVersionEntity {
    const version = this.findVersion(versionId);
    if (!version) throw new Error('MUSIC_VERSION_NOT_FOUND');
    return version;
  }
}
