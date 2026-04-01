import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TPlaylistTrackDomainModel } from '@sh3pherd/shared-types';

export class PlaylistTrackEntity extends Entity<TPlaylistTrackDomainModel> {
  constructor(props: TEntityInput<TPlaylistTrackDomainModel>) {
    super(props, 'plTrack');
  }

  get playlistId() { return this.props.playlistId; }
  get referenceId() { return this.props.referenceId; }
  get versionId() { return this.props.versionId; }
  get position() { return this.props.position; }
}
