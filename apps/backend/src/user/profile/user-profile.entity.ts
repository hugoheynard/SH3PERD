import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type {TUserProfileDomainModel, TUserId } from '@sh3pherd/shared-types'

export class UserProfile extends Entity<TUserProfileDomainModel>{
  constructor(props: TEntityInput<TUserProfileDomainModel>) {
    super(props, 'userProfile');
  };

  // --- Getters ---
  get user_id(): TUserId {
    return this.props.user_id;
  };

  // --- Methods ---
  updateFirstName(value: string, requester_id: TUserId): void {
    this.ensureUserOwnership(requester_id);
    this.props.first_name = value;
  };

  updateLastName(value: string, requester_id: TUserId): void {
    this.ensureUserOwnership(requester_id);
    this.props.last_name = value;
  };

  // --- Guards ---
  /**
   * Ensure that the requester is the owner of the profile.
   * @param requester_id
   * @private
   */
  private ensureUserOwnership(requester_id: TUserId): void {
    if (requester_id !== this.user_id) {
      throw new Error("Only the profile's user can update his information");
    }
  };
}