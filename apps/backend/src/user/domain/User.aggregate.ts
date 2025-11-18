import type { IUserIdentityProps } from './UserIdentity.vo.js';
import type { UserProfileEntity } from './UserProfileEntity.js';
import type { UserCredentialEntity } from './UserCredential.entity.js';
import type { UserPreferences } from './UserPreferences.entity.js';
import type { TContractId } from '@sh3pherd/shared-types';
import { UserPolicy } from './UserPolicy.js';
import type { TUserId } from '@sh3pherd/shared-types';

/**
 * Composite root representing a User, façade composed of profile, preferences and credentials.
 */
export class User {
  private readonly policy: UserPolicy;

  constructor(
    private readonly profile: UserProfileEntity,
    private readonly credentials: UserCredentialEntity,
    private readonly preferences: UserPreferences,
  ) {
    this.policy = new UserPolicy()
  };

  get id(): TUserId {
    return this.credentials.id;
  };

  /**
   * Get the identity value object of the user.
   */
  getIdentity(): IUserIdentityProps {
    return this.profile.getIdentity().value;
  };

  rename(actor: TUserId, first: string, last: string): void {
    this.policy.ensureCanRename(actor, this.profile)
    this.profile.rename(first, last);
  };

  changeContractWorkspace(newWorkspace: TContractId): void {
    this.preferences.changeContractWorkspace(newWorkspace);
  };

  changeEmail(newEmail: string): void {
    this.credentials.changeEmail(newEmail);
  };

  changePassword(newHashedPassword: string): void {
    this.credentials.changePassword(newHashedPassword);
  };

  deactivate(): void {
    //this.credentials.deactivate();
    //this.profile.deactivate();
    //this.preferences.deactivate();
  };

  /**
   * Get a snapshot of the current state of the User aggregate.
   */
  snapshot(): {
    profile: any;
    credentials: any;
    preferences: any;
  } {
    return {
      profile: this.profile.toDomain,
      credentials: this.credentials.toDomain,
      preferences: this.preferences.toDomain,
    };
  }
}