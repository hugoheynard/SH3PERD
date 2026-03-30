import { Entity, type TEntityInput } from '../../../utils/entities/Entity.js';
import type { TMusicRepertoireEntryDomainModel, TMusicReferenceId, TUserId } from '@sh3pherd/shared-types';

export class RepertoireEntryEntity extends Entity<TMusicRepertoireEntryDomainModel> {
  constructor(props: TEntityInput<TMusicRepertoireEntryDomainModel>) {
    super(props, 'repEntry');
  }

  get musicReference_id(): TMusicReferenceId { return this.props.musicReference_id; }
  get owner_id(): TUserId { return this.props.owner_id; }

  /** Check if this entry belongs to the given user. */
  isOwnedBy(userId: TUserId): boolean {
    return this.props.owner_id === userId;
  }
}
