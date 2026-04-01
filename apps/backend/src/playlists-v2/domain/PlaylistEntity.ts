import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TPlaylistDomainModel, TUserId } from '@sh3pherd/shared-types';

export class PlaylistEntity extends Entity<TPlaylistDomainModel> {
  constructor(props: TEntityInput<TPlaylistDomainModel>) {
    super({
      ...props,
      name: props.name.trim(),
      description: props.description?.trim(),
    }, 'playlist');
  }

  get name(): string { return this.props.name; }
  get owner_id(): TUserId { return this.props.owner_id; }

  isOwnedBy(userId: TUserId): boolean {
    return this.props.owner_id === userId;
  }

  ensureOwnedBy(userId: TUserId): void {
    if (!this.isOwnedBy(userId)) {
      throw new Error('PLAYLIST_NOT_OWNED');
    }
  }
}
