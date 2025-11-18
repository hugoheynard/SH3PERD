import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TUserId, TUserProfileDomainModel } from '@sh3pherd/shared-types';
import { UserIdentityVO } from './UserIdentity.vo.js';


export class UserProfileEntity extends Entity<TUserProfileDomainModel> {
  constructor(props: TEntityInput<TUserProfileDomainModel>) {
    super(props, 'userProfile');
  };

  // --- Getters ---
  get user_id(): TUserId {
    return this.props.user_id;
  };

  rename(first: string, last: string): void {
    this.props.first_name = first;
    this.props.last_name = last;
  };

  /**
   * Get the identity value object of the user.
   * @return {UserIdentityVO}
   */
  getIdentity(): UserIdentityVO {
    return new UserIdentityVO({
      user_id: this.user_id,
      first_name: this.props.first_name,
      last_name: this.props.last_name,
    })
  };

  deactivate(): void {
    this.props.active = false;
  }
}