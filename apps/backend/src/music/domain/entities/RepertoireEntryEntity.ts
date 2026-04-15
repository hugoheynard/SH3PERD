import { Entity, type TEntityInput } from '../../../utils/entities/Entity.js';
import type {
  TMusicRepertoireEntryDomainModel,
  TMusicReferenceId,
  TUserId,
} from '@sh3pherd/shared-types';

/**
 * The link between a user and a music reference — "this song is in my repertoire".
 *
 * This is a thin entity with no mutable state. It exists solely to express
 * ownership: a user has chosen to add this reference to their library.
 * A user can have at most one entry per reference.
 *
 * Managed by {@link RepertoireEntryAggregate}, which composes the entry
 * with its reference and all user versions of the song.
 *
 * Invariants:
 * - musicReference_id must be a valid reference
 * - owner_id must be a valid user
 * - uniqueness (owner_id + musicReference_id) is enforced at the repository level
 */
export class RepertoireEntryEntity extends Entity<TMusicRepertoireEntryDomainModel> {
  constructor(props: TEntityInput<TMusicRepertoireEntryDomainModel>) {
    if (!props.musicReference_id) {
      throw new Error('REPERTOIRE_ENTRY_REFERENCE_REQUIRED');
    }
    if (!props.owner_id) {
      throw new Error('REPERTOIRE_ENTRY_OWNER_REQUIRED');
    }
    super(props, 'repEntry');
  }

  get musicReference_id(): TMusicReferenceId {
    return this.props.musicReference_id;
  }
  get owner_id(): TUserId {
    return this.props.owner_id;
  }

  /** Check if this entry belongs to the given user. */
  isOwnedBy(userId: TUserId): boolean {
    return this.props.owner_id === userId;
  }
}
