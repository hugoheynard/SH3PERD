import type { IUserIdentityProps } from '../../domain/UserIdentity.vo.js';
import type { TUserId } from '@sh3pherd/shared-types';


export class UserIdentityChangedEvent {
  constructor(
    public readonly user_id: TUserId,
    public readonly value: IUserIdentityProps,
  ) {
  }
}