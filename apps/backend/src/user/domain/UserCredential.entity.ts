import type { TUserCredentialsDomainModel } from '@sh3pherd/shared-types';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';

export class UserCredentialEntity extends Entity<TUserCredentialsDomainModel> {
  constructor(props: TEntityInput<TUserCredentialsDomainModel>) {
    super(props, 'userCredential');
  }

  changeEmail(newEmail: string): void {
    this.props.email = newEmail;
  }

  changePassword(newHashedPassword: string): void {
    this.props.password = newHashedPassword;
  }

  deactivate(): void {
    this.props.active = false;
  }
}
