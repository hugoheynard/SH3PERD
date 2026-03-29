import { Entity, type TEntityInput } from '../../../utils/entities/Entity.js';
import type {
  TMusicVersionDomainModel,
  TMusicReferenceId,
  TUserId,
  TVersionTrackDomainModel,
  TVersionTrackId,
  TAudioAnalysisSnapshot,
} from '@sh3pherd/shared-types';

type Rating = 1 | 2 | 3 | 4;

export class MusicVersionEntity extends Entity<TMusicVersionDomainModel> {
  constructor(props: TEntityInput<TMusicVersionDomainModel>) {
    super(props, 'musicVer');
  }

  /* ── Getters ── */

  get musicReference_id(): TMusicReferenceId { return this.props.musicReference_id; }
  get owner_id(): TUserId { return this.props.owner_id; }
  get label(): string { return this.props.label; }
  get tracks(): readonly TVersionTrackDomainModel[] { return this.props.tracks; }

  /* ── Ownership ── */

  isOwnedBy(userId: TUserId): boolean {
    return this.props.owner_id === userId;
  }

  ensureOwnedBy(userId: TUserId): void {
    if (!this.isOwnedBy(userId)) throw new Error('MUSIC_VERSION_NOT_OWNED');
  }

  /* ── Version metadata mutation ── */

  updateMetadata(patch: {
    label?: string;
    genre?: TMusicVersionDomainModel['genre'];
    type?: TMusicVersionDomainModel['type'];
    bpm?: number | null;
    pitch?: number | null;
    notes?: string;
    mastery?: Rating;
    energy?: Rating;
    effort?: Rating;
  }): void {
    if (patch.label !== undefined) {
      if (!patch.label.trim()) throw new Error('MUSIC_VERSION_LABEL_REQUIRED');
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

  /** Remove a track by id. Promotes the first remaining track to favorite if needed. */
  removeTrack(trackId: TVersionTrackId): TVersionTrackDomainModel {
    const track = this.props.tracks.find(t => t.id === trackId);
    if (!track) throw new Error('TRACK_NOT_FOUND');

    const wasFavorite = track.favorite;
    this.props.tracks = this.props.tracks.filter(t => t.id !== trackId);

    // Promote first remaining track if we removed the favorite
    if (wasFavorite && this.props.tracks.length > 0) {
      this.props.tracks = this.props.tracks.map((t, i) =>
        i === 0 ? { ...t, favorite: true } : t,
      );
    }

    return track;
  }

  /** Set a track as favorite (unsets all others). */
  setFavoriteTrack(trackId: TVersionTrackId): void {
    const exists = this.props.tracks.some(t => t.id === trackId);
    if (!exists) throw new Error('TRACK_NOT_FOUND');

    this.props.tracks = this.props.tracks.map(t => ({
      ...t,
      favorite: t.id === trackId,
    }));
  }

  /** Attach an analysis result to a specific track. */
  setTrackAnalysis(trackId: TVersionTrackId, snapshot: TAudioAnalysisSnapshot): void {
    const exists = this.props.tracks.some(t => t.id === trackId);
    if (!exists) throw new Error('TRACK_NOT_FOUND');

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

  get hasTrack(): boolean {
    return this.props.tracks.length > 0;
  }
}
