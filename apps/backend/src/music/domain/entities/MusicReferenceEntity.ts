import { Entity, type TEntityInput } from '../../../utils/entities/Entity.js';
import type { TMusicReferenceDomainModel, TUserId } from '@sh3pherd/shared-types';

/**
 * The canonical song entry — shared across all users.
 *
 * Represents "the song itself" (e.g. "Bohemian Rhapsody" by Queen),
 * not any user's rendition. Title and artist are normalized to lowercase
 * on construction and mutation to enable case-insensitive dedup.
 *
 * Invariants:
 * - title must be non-empty
 * - artist must be non-empty
 * - title/artist are always stored trimmed + lowercased
 *
 * @note This entity is NOT managed by RepertoireEntryAggregate.
 *       References exist independently of any user's repertoire.
 */
export class MusicReferenceEntity extends Entity<TMusicReferenceDomainModel> {
  constructor(props: TEntityInput<TMusicReferenceDomainModel>) {
    const title = props.title.trim().toLowerCase();
    const artist = props.artist.trim().toLowerCase();
    if (!title) {
      throw new Error('MUSIC_REFERENCE_TITLE_REQUIRED');
    }
    if (!artist) {
      throw new Error('MUSIC_REFERENCE_ARTIST_REQUIRED');
    }
    super({ ...props, title, artist }, 'musicRef');
  }

  get title(): string {
    return this.props.title;
  }
  get artist(): string {
    return this.props.artist;
  }
  get owner_id(): TUserId {
    return this.props.owner_id;
  }

  isOwnedBy(userId: TUserId): boolean {
    return this.props.owner_id === userId;
  }

  /** Rename the reference. Enforces non-empty title/artist invariant. */
  rename(title: string, artist: string): void {
    const t = title.trim().toLowerCase();
    const a = artist.trim().toLowerCase();
    if (!t) {
      throw new Error('MUSIC_REFERENCE_TITLE_REQUIRED');
    }
    if (!a) {
      throw new Error('MUSIC_REFERENCE_ARTIST_REQUIRED');
    }
    this.props.title = t;
    this.props.artist = a;
  }
}
