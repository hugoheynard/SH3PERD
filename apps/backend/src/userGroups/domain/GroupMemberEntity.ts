import { Entity } from '../../utils/entities/Entity.js';
import type { IUserIdentityProps } from '../../user/domain/UserIdentity.vo.js';

export type TGroupMemberDomainModel =
  IUserIdentityProps & {
  contract_id: string;
  role: string[];
  active: boolean;
}


export class GroupMemberEntity extends Entity<any> {

}