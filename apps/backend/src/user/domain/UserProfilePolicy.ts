import type { TUserId } from '@sh3pherd/shared-types';
import type { UserProfileEntity } from './UserProfileEntity.js';
import { DomainError } from '../../utils/errorManagement/errorClasses/DomainError.js';


export class UserProfilePolicy {

  ensureCanModifyProfile(
    actor_id: TUserId,
    profile: UserProfileEntity,
  ): void {
    if (actor_id !== profile.user_id) {
      throw new DomainError('Unauthorized to modify this profile, actor does not own it.');
    }
  };
}