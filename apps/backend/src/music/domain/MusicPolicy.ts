import type {
  TUserId,
  TMusicVersionId,
  TVersionTrackId,
  TMusicVersionDomainModel,
} from '@sh3pherd/shared-types';
import { BusinessError } from '../../utils/errorManagement/BusinessError.js';
import { MusicApiCodes } from '../codes.js';
import type { MusicVersionEntity } from './entities/MusicVersionEntity.js';
import type { RepertoireEntryEntity } from './entities/RepertoireEntryEntity.js';

// ─── Limits ─────────────────────────────────────────────────

/** Max tracks per version (1 original upload + 1 master). */
const MAX_TRACKS_PER_VERSION = 2;

/** Max master tracks per version. */
const MAX_MASTERS_PER_VERSION = 1;

/** Max derived versions from a single source version. */
const MAX_DERIVATIONS_PER_SOURCE = 3;

/** Max total versions per user per reference. */
const MAX_VERSIONS_PER_REFERENCE = 10;

// ─── Policy ─────────────────────────────────────────────────

/**
 * Business rules enforcement for the Music domain.
 *
 * Centralizes all invariants so handlers stay thin.
 * Each method either passes silently or throws with an explicit error code.
 */
export class MusicPolicy {
  // ── Ownership ───────────────────────────────────────────

  /** Ensures the actor owns the version before mutating it. */
  ensureCanMutateVersion(actorId: TUserId, version: MusicVersionEntity): void {
    if (!version.isOwnedBy(actorId)) {
      throw new BusinessError(MusicApiCodes.MUSIC_VERSION_NOT_OWNED.code, {
        code: MusicApiCodes.MUSIC_VERSION_NOT_OWNED.code,
        status: 403,
      });
    }
  }

  /** Ensures the actor owns the repertoire entry. */
  ensureCanMutateEntry(actorId: TUserId, entry: RepertoireEntryEntity): void {
    if (!entry.isOwnedBy(actorId)) {
      throw new Error('REPERTOIRE_ENTRY_NOT_OWNED');
    }
  }

  // ── Track limits ────────────────────────────────────────

  /** Ensures a version can accept another track. */
  ensureCanAddTrack(version: MusicVersionEntity): void {
    if (version.tracks.length >= MAX_TRACKS_PER_VERSION) {
      throw new Error('MAX_TRACKS_REACHED');
    }
  }

  /** Ensures a version can accept a master track. */
  ensureCanMasterTrack(version: MusicVersionEntity): void {
    const masterCount = version.tracks.filter((t) => t.processingType === 'master').length;
    if (masterCount >= MAX_MASTERS_PER_VERSION) {
      throw new Error('MAX_MASTERS_REACHED');
    }
    this.ensureCanAddTrack(version);
  }

  /** Ensures the source track has analysis data and is stored in R2. */
  ensureTrackReadyForProcessing(version: MusicVersionEntity, trackId: TVersionTrackId): void {
    const track = version.findTrack(trackId);
    if (!track) {
      throw new Error('TRACK_NOT_FOUND');
    }
    if (!track.analysisResult) {
      throw new Error('TRACK_NOT_ANALYZED');
    }
    if (!track.s3Key) {
      throw new Error('TRACK_NOT_IN_STORAGE');
    }
  }

  // ── Version derivation limits ───────────────────────────

  /**
   * Ensures a new version can be created for this user on this reference.
   * @param existingVersions — all versions by this user for this reference.
   */
  ensureCanCreateVersion(existingVersions: TMusicVersionDomainModel[]): void {
    if (existingVersions.length >= MAX_VERSIONS_PER_REFERENCE) {
      throw new BusinessError(MusicApiCodes.MAX_VERSIONS_PER_REFERENCE_REACHED.code, {
        code: MusicApiCodes.MAX_VERSIONS_PER_REFERENCE_REACHED.code,
        status: 409,
      });
    }
  }

  /**
   * Ensures a version can be derived (pitch_shift) from a source.
   * @param existingVersions — all versions by this user for the same reference.
   * @param sourceVersionId — the version being derived from.
   */
  ensureCanDeriveVersion(
    existingVersions: TMusicVersionDomainModel[],
    sourceVersionId: TMusicVersionId,
  ): void {
    // Global limit per reference
    this.ensureCanCreateVersion(existingVersions);

    // Derivation limit per source
    const derivationCount = existingVersions.filter(
      (v) => v.parentVersionId === sourceVersionId,
    ).length;
    if (derivationCount >= MAX_DERIVATIONS_PER_SOURCE) {
      throw new Error('MAX_DERIVATIONS_PER_SOURCE_REACHED');
    }
  }
}
