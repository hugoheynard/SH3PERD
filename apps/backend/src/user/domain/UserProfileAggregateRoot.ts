import { AggregateRoot } from '@nestjs/cqrs';
import { UserProfileEntity } from './UserProfileEntity.js';
import { UserIdentityChangedEvent } from '../application/events/UserIdentityChangedEvent.js';
import type { TUserId, TUserProfileId } from '@sh3pherd/shared-types';
import { UserProfilePolicy } from './UserProfilePolicy.js';


export class UserProfileAggregateRoot extends AggregateRoot {
  constructor(
    private readonly profile: UserProfileEntity,
    private readonly policy: UserProfilePolicy = new UserProfilePolicy(),
  ) {
    super();
  };

  get id(): TUserProfileId {
    return this.profile.id;
  }

  /**
   * Renames the user profile.
   * @param actor_id
   * @param first
   * @param last
   * sends UserIdentityChangedEvent after renaming.
   */
  rename(actor_id: TUserId, first: string, last: string): void {
    this.policy.ensureCanModifyProfile(actor_id, this.profile);
    this.profile.rename(first, last);

    this.apply(
      new UserIdentityChangedEvent(
        this.profile.user_id,
        this.profile.getIdentity().value
      )
    );
  };

  /**
   * Get the update object representing the changes made to the profile.
   */
  getUpdateObject() {
    return this.profile.getDiffProps();
  };
}