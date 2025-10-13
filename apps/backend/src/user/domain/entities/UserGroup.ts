import type { TUserGroupDomainModel } from '@sh3pherd/shared-types';
import { Entity, type TEntityInput } from '../../../utils/entities/Entity.js';



export class UserGroup extends Entity<TUserGroupDomainModel> {
  constructor(props: TEntityInput<TUserGroupDomainModel>) {
    super(props, 'userGroup');
  };


}