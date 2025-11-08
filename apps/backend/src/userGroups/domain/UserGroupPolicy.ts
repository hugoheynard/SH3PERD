import type { ContractEntity } from '../../contracts/domain/ContractEntity.js';
import { UserGroupEntity } from './UserGroupEntity.js';
import { DomainError } from '../../utils/errorManagement/errorClasses/DomainError.js';
import  { type TContractId, UserGroupTypesEnum } from '@sh3pherd/shared-types';

export class UserGroupPolicy {
  constructor(
    private readonly actor: ContractEntity,
    private readonly group: UserGroupEntity,
  ) {
    if (!this.actor.isActive()) {
      throw new DomainError(`Actor contract ${this.actor.id} is not active.`);
    }
  };

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
  };

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

    if (this.group.isGroupLead(this.actor.id)
      && type === UserGroupTypesEnum.TEAM
    ) {
      return true;
    }


    return false;
  };


  /**
   * Guard to check if the requester has rights to manage the user group.
   * @param actor_id
   * @private
   */
  private canManageGuard(actor_id: TContractId): void {
    if (!this.group.isGroupLead(actor_id) && !this.group.isReferent(actor_id)) {
      throw new DomainError(`Contract ${actor_id} does not have rights to manage this user group.`);
    }
  };

  ensureMemberIsActiveAndInParentGroup(member: ContractEntity): void {
    const inParent = this.group.isMember(member.id);

    if (!member.isActive()) {
      throw new DomainError(`Member ${member.id} is not active.`);
    }

    if (!inParent) {
      throw new DomainError(`Member ${member.id} does not belong to parent group ${this.group.id}`);
    }
  };


}