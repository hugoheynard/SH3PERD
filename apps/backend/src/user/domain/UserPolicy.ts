import type { TUserId } from '@sh3pherd/shared-types';
import type { UserProfileEntity } from './UserProfileEntity.js';

export class UserPolicy {
  /**
   * Check if the actor can rename the profile.
   * @param actor_id
   * @param profile
   */
  ensureCanRename(actor_id: TUserId, profile: UserProfileEntity): void {
    if (actor_id !== profile.user_id) {
      throw new Error('actor must be the owner of the profile to rename it.');
    }
  }
}