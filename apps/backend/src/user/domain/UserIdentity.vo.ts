import type { TUserId } from '@sh3pherd/shared-types';
import { ValueObject } from '../../utils/entities/ValueObject.js';

export interface IUserIdentityProps {
  user_id: TUserId;
  first_name: string;
  last_name: string;
}

export class UserIdentityVO extends ValueObject<IUserIdentityProps> {
  constructor(props: IUserIdentityProps) {
    super(props)
  };

  get fullName(): string {
    return `${this.props.first_name} ${this.props.last_name}`;
  };

  get id(): string {
    return this.props.user_id;
  }
}