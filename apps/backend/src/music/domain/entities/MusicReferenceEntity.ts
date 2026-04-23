import { Entity, type TEntityInput } from '../../../utils/entities/Entity.js';
import { DomainError } from '../../../utils/errorManagement/DomainError.js';
import { normalizeRefKey } from '../normalizeRefKey.js';
import type { TMusicReferenceCreator, TMusicReferenceDomainModel } from '@sh3pherd/shared-types';

/**
 * The canonical song entry — shared across the whole user base.
 *
 * A reference represents "the song itself" (e.g. "Bohemian Rhapsody" by Queen),
 * not any user's rendition. Two design invariants drive this entity:
 *
 * 1. **Immutable from the user-facing API.** Once created, title and artist
 *    cannot be changed by end users. Any correction, dedup merge, or metadata
 *    enrichment is an admin / cron / AI operation that must emit its own
 *    domain event (`music_reference_merged`, `music_reference_enriched`…).
 *    There is intentionally no `rename()` method on this entity.
 *
 * 2. **No ownership.** `creator` is a contribution marker for the community
 *    leaderboard, not an access-control field. All users can read every
 *    reference; no user can mutate any reference. Gating of admin ops happens
 *    at the controller / permission layer, never via this entity.
 *
 * Storage invariants:
 * - `title` and `artist` are normalised through `normalizeRefKey` on
 *   construction (NFKD + diacritic + zero-width strip + whitespace collapse
 *   + lowercase) so `findByExactTitleAndArtist` dedups across Unicode
 *   variants. The same normaliser is used by `CreateMusicReferenceHandler`
 *   at the lookup boundary — both sides of the dedup contract must agree.
 * - `title` and `artist` must be non-empty after normalisation.
 */
export class MusicReferenceEntity extends Entity<TMusicReferenceDomainModel> {
  constructor(props: TEntityInput<TMusicReferenceDomainModel>) {
    const title = normalizeRefKey(props.title);
    const artist = normalizeRefKey(props.artist);
    if (!title) {
      throw new DomainError('Music reference title is required', {
        code: 'MUSIC_REFERENCE_TITLE_REQUIRED',
        context: { field: 'title' },
      });
    }
    if (!artist) {
      throw new DomainError('Music reference artist is required', {
        code: 'MUSIC_REFERENCE_ARTIST_REQUIRED',
        context: { field: 'artist' },
      });
    }
    super({ ...props, title, artist }, 'musicRef');
  }

  /**
   * Factory for a freshly contributed reference. Stamps `created_at` at the
   * moment of contribution so the domain model carries the community timeline
   * without leaking a persistence-level `TRecordMetadata`.
   */
  static create(input: {
    title: string;
    artist: string;
    creator: TMusicReferenceCreator;
  }): MusicReferenceEntity {
    return new MusicReferenceEntity({
      title: input.title,
      artist: input.artist,
      creator: input.creator,
      created_at: new Date(),
    });
  }

  get title(): string {
    return this.props.title;
  }
  get artist(): string {
    return this.props.artist;
  }
  get creator(): TMusicReferenceCreator {
    return this.props.creator;
  }
  get createdAt(): Date {
    return this.props.created_at;
  }
}
