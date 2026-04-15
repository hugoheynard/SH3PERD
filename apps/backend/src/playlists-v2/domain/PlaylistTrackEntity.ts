import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type {
  TMusicReferenceId,
  TMusicVersionId,
  TPlaylistId,
  TPlaylistTrackDomainModel,
} from '@sh3pherd/shared-types';

export class PlaylistTrackEntity extends Entity<TPlaylistTrackDomainModel> {
  constructor(props: TEntityInput<TPlaylistTrackDomainModel>) {
    super(props, 'plTrack');
  }

  get playlistId(): TPlaylistId {
    return this.props.playlistId;
  }
  get referenceId(): TMusicReferenceId {
    return this.props.referenceId;
  }
  get versionId(): TMusicVersionId {
    return this.props.versionId;
  }
  get position(): number {
    return this.props.position;
  }
}
