import type { ContractEntity } from '../../contracts/domain/ContractEntity.js';
import type { UserGroupEntity } from './UserGroupEntity.js';
import { DomainError } from '../../utils/errorManagement/DomainError.js';
import { type TContractId, UserGroupTypesEnum } from '@sh3pherd/shared-types';

export class UserGroupPolicy {
  constructor(
    private readonly actor: ContractEntity,
    private readonly group: UserGroupEntity,
  ) {
    if (!this.actor.isActive()) {
      throw new DomainError('Actor contract is not active', { code: 'CONTRACT_NOT_ACTIVE' });
    }
  }

  canAddOrRemoveMember(member: ContractEntity): boolean {
    this.ensureMemberIsActiveAndInParentGroup(member);
    this.canManageGuard(this.actor.id);

    if (this.group.isGroupLead(this.actor.id)) {
      return true;
    }

    /*
    if (
    this.group.isReferent(this.actor.id)
    && this.actor.isSameFieldOfActivityAs(member)
    ) {
      return true;
    }
     */

    return false;
  }

  canChangeGroupLead(newLead: ContractEntity): boolean {
    this.ensureMemberIsActiveAndInParentGroup(newLead);
    this.canManageGuard(this.actor.id);

    if (this.group.isGroupLead(this.actor.id)) {
      return true;
    }
    return false;
  }

  canUseType(type: UserGroupTypesEnum): boolean {
    this.canManageGuard(this.actor.id);

    if (this.group.isGroupLead(this.actor.id) && type === UserGroupTypesEnum.TEAM) {
      return true;
    }

    return false;
  }

  /**
   * Guard to check if the requester has rights to manage the user group.
   * @param actor_id
   * @private
   */
  private canManageGuard(actor_id: TContractId): void {
    if (!this.group.isGroupLead(actor_id) && !this.group.isReferent(actor_id)) {
      throw new DomainError('Not authorized to manage this user group', {
        code: 'USER_GROUP_UNAUTHORIZED',
      });
    }
  }

  ensureMemberIsActiveAndInParentGroup(member: ContractEntity): void {
    const inParent = this.group.isMember(member.id);

    if (!member.isActive()) {
      throw new DomainError('Member is not active', { code: 'MEMBER_NOT_ACTIVE' });
    }

    if (!inParent) {
      throw new DomainError('Member does not belong to parent group', {
        code: 'MEMBER_NOT_IN_GROUP',
      });
    }
  }
}
