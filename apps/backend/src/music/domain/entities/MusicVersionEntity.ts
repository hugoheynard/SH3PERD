import { Entity, type TEntityInput } from '../../../utils/entities/Entity.js';
import type {
  TMusicVersionDomainModel,
  TMusicReferenceId,
  TUserId,
  TVersionTrackDomainModel,
  TVersionTrackId,
  TAudioAnalysisSnapshot,
  TMusicRating,
} from '@sh3pherd/shared-types';

/**
 * A user's rendition of a music reference (cover, pitch variant, acoustic…).
 *
 * Owns a list of tracks (audio files). Exactly one track must be marked
 * as `favorite` at all times — this invariant is enforced automatically:
 * - The first track added is auto-promoted to favorite
 * - Removing the favorite auto-promotes the next remaining track
 * - `setFavoriteTrack` unsets all others
 *
 * Managed by {@link RepertoireEntryAggregate}. All mutations go through
 * the aggregate, which delegates to MusicPolicy for authorization and
 * limit checks before calling entity methods.
 *
 * Invariants:
 * - label must be non-empty
 * - owner_id must be set
 * - musicReference_id must be set
 * - exactly one favorite track (when tracks.length > 0)
 *
 * @note Authorization (ownership checks) is handled by MusicPolicy, not here.
 */
export class MusicVersionEntity extends Entity<TMusicVersionDomainModel> {
  constructor(props: TEntityInput<TMusicVersionDomainModel>) {
    if (!props.label?.trim()) {
      throw new Error('MUSIC_VERSION_LABEL_REQUIRED');
    }
    if (!props.owner_id) {
      throw new Error('MUSIC_VERSION_OWNER_REQUIRED');
    }
    if (!props.musicReference_id) {
      throw new Error('MUSIC_VERSION_REFERENCE_REQUIRED');
    }
    super({ ...props, label: props.label.trim() }, 'musicVer');
  }

  /* ── Getters ── */

  get musicReference_id(): TMusicReferenceId {
    return this.props.musicReference_id;
  }
  get owner_id(): TUserId {
    return this.props.owner_id;
  }
  get label(): string {
    return this.props.label;
  }
  get tracks(): readonly TVersionTrackDomainModel[] {
    return this.props.tracks;
  }

  /* ── Ownership ── */

  isOwnedBy(userId: TUserId): boolean {
    return this.props.owner_id === userId;
  }

  /* ── Version metadata mutation ── */

  /**
   * Partial update of version metadata.
   * Only provided fields are updated; others are left untouched.
   * @throws MUSIC_VERSION_LABEL_REQUIRED — if label is set to empty
   */
  updateMetadata(patch: {
    label?: string;
    genre?: TMusicVersionDomainModel['genre'];
    type?: TMusicVersionDomainModel['type'];
    bpm?: number | null;
    pitch?: number | null;
    notes?: string;
    mastery?: TMusicRating;
    energy?: TMusicRating;
    effort?: TMusicRating;
  }): void {
    if (patch.label !== undefined) {
      if (!patch.label.trim()) {
        throw new Error('MUSIC_VERSION_LABEL_REQUIRED');
      }
      this.props.label = patch.label.trim();
    }
    if (patch.genre !== undefined)   this.props.genre = patch.genre;
    if (patch.type !== undefined)    this.props.type = patch.type;
    if (patch.bpm !== undefined)     this.props.bpm = patch.bpm;
    if (patch.pitch !== undefined)   this.props.pitch = patch.pitch;
    if (patch.notes !== undefined)   this.props.notes = patch.notes;
    if (patch.mastery !== undefined) this.props.mastery = patch.mastery;
    if (patch.energy !== undefined)  this.props.energy = patch.energy;
    if (patch.effort !== undefined)  this.props.effort = patch.effort;
  }

  /* ── Track management ── */

  /** Add a track. First track is automatically set as favorite. */
  addTrack(track: TVersionTrackDomainModel): void {
    const isFirst = this.props.tracks.length === 0;
    this.props.tracks = [
      ...this.props.tracks,
      { ...track, favorite: isFirst ? true : track.favorite },
    ];
  }

  /**
   * Remove a track by id.
   * If the removed track was the favorite, promotes the first remaining track.
   * @throws TRACK_NOT_FOUND
   */
  removeTrack(trackId: TVersionTrackId): TVersionTrackDomainModel {
    const track = this.props.tracks.find(t => t.id === trackId);
    if (!track) throw new Error('TRACK_NOT_FOUND');

    const wasFavorite = track.favorite;
    this.props.tracks = this.props.tracks.filter(t => t.id !== trackId);

    if (wasFavorite && this.props.tracks.length > 0) {
      this.props.tracks = this.props.tracks.map((t, i) =>
        i === 0 ? { ...t, favorite: true } : t,
      );
    }

    return track;
  }

  /**
   * Set a track as favorite (unsets all others).
   * @throws TRACK_NOT_FOUND
   */
  setFavoriteTrack(trackId: TVersionTrackId): void {
    if (!this.props.tracks.some(t => t.id === trackId)) throw new Error('TRACK_NOT_FOUND');
    this.props.tracks = this.props.tracks.map(t => ({
      ...t,
      favorite: t.id === trackId,
    }));
  }

  /**
   * Attach an analysis result to a specific track.
   * @throws TRACK_NOT_FOUND
   */
  setTrackAnalysis(trackId: TVersionTrackId, snapshot: TAudioAnalysisSnapshot): void {
    if (!this.props.tracks.some(t => t.id === trackId)) throw new Error('TRACK_NOT_FOUND');
    this.props.tracks = this.props.tracks.map(t =>
      t.id === trackId ? { ...t, analysisResult: snapshot } : t,
    );
  }

  /** Get the favorite track, or undefined if no tracks. */
  get favoriteTrack(): TVersionTrackDomainModel | undefined {
    return this.props.tracks.find(t => t.favorite);
  }

  /** Get a track by id, or undefined. */
  findTrack(trackId: TVersionTrackId): TVersionTrackDomainModel | undefined {
    return this.props.tracks.find(t => t.id === trackId);
  }

  /**
   * Get a track by id or throw.
   * @throws TRACK_NOT_FOUND
   */
  getTrackOrThrow(trackId: TVersionTrackId): TVersionTrackDomainModel {
    const track = this.findTrack(trackId);
    if (!track) throw new Error('TRACK_NOT_FOUND');
    return track;
  }

  get hasTrack(): boolean {
    return this.props.tracks.length > 0;
  }
}
