import type { User } from '../../domain/User.aggregate.js';
import type { TUserMeViewModel } from '@sh3pherd/shared-types';

/**
 * Mapper to convert a User aggregate to the current user's view model.
 */
export class UserToCurrentUserViewModelMapper {
  constructor(private readonly user: User) {};

  map(): TUserMeViewModel {
    const snapshot = this.user.snapshot();

    return {
      id: this.user.id,
      profile: snapshot.profile,
      preferences: snapshot.preferences
    }
  }
}