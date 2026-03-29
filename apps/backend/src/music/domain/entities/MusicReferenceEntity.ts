import { Entity, type TEntityInput } from '../../../utils/entities/Entity.js';
import type { TMusicReferenceDomainModel, TUserId } from '@sh3pherd/shared-types';

export class MusicReferenceEntity extends Entity<TMusicReferenceDomainModel> {
  constructor(props: TEntityInput<TMusicReferenceDomainModel>) {
    super(props, 'musicRef');
  }

  get title(): string { return this.props.title; }
  get artist(): string { return this.props.artist; }
  get owner_id(): TUserId { return this.props.owner_id; }

  isOwnedBy(userId: TUserId): boolean {
    return this.props.owner_id === userId;
  }

  rename(title: string, artist: string): void {
    if (!title.trim()) throw new Error('MUSIC_REFERENCE_TITLE_REQUIRED');
    if (!artist.trim()) throw new Error('MUSIC_REFERENCE_ARTIST_REQUIRED');
    this.props.title = title.trim();
    this.props.artist = artist.trim();
  }
}
