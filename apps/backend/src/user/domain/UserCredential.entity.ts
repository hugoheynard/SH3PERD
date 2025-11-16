import type { TUserCredentialsDomainModel } from '@sh3pherd/shared-types';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';


export class UserCredential extends Entity<TUserCredentialsDomainModel>{
  constructor(props: TEntityInput<TUserCredentialsDomainModel>) {
    super(props, 'userCredential');
  };
}