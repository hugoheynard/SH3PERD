import { Entity, type TEntityInput } from '../utils/entities/Entity.js';
import type { TUserGroupDomainModel, TContractId } from '@sh3pherd/shared-types';

export class UserGroup extends Entity<TUserGroupDomainModel>{
  constructor(props: TEntityInput<TUserGroupDomainModel>) {
    super(props, 'user-group');

    this.ensureHasGroupLead(props);
    this.ensureHasEnoughMembers(props);
  };

  // --- Getters  ---
  get groupLead() {
    return this.props.groupLead;
  };

  set groupLead(newGroupLeadId: TContractId) {
    this.props.groupLead = newGroupLeadId;
  };

  get members() {
    return this.props.members;
  };

  set members(newMembers: TContractId[]) {
    this.props.members = newMembers;
  };

  // --- Methods ---



  changeGroupLead(newLead: TContractId, requester_id: TContractId): void {
    this.canManageGuard(requester_id);
    this.groupLead = newLead;
  };

  addMembers(newMemberIds: TContractId[], requester_id: TContractId): void {
    this.canManageGuard(requester_id);

    const membersSet = new Set(this.members);
    newMemberIds.forEach(id => membersSet.add(id));
    this.members = Array.from(membersSet);
  };

  removeMembers(memberIdsToRemove: TContractId[], requester_id: TContractId): void {
    this.canManageGuard(requester_id);
    this.members = this.members.filter(id => !memberIdsToRemove.includes(id));
  };

  createSubGroup(subGroupProps: Omit<TUserGroupDomainModel, 'id' | 'parentGroupId'>, requester_id: TContractId): UserGroup {
    this.canManageGuard(requester_id);

    return new UserGroup({
      ...subGroupProps,
      parent_group_id: this.id
    });
  };

  // --- Private Methods ---
  /**
   * Guard to check if the requester has rights to manage the user group.
   * @param requester_id
   * @private
   */
  private canManageGuard(requester_id: TContractId): void {
    if (!this.members.includes(requester_id) && this.groupLead !== requester_id) {
      throw new Error ('Contract does not have rights to manage this user group.');
    }
  };

  private ensureHasGroupLead(props: TEntityInput<TUserGroupDomainModel>): void {
    if (props.groupLead === undefined) {
      throw new Error('User group must have a group lead.');
    }
  };

  private ensureHasEnoughMembers(props: TEntityInput<TUserGroupDomainModel>): void {
    if (props.members.length < 2) {
      throw new Error('User group must have at least 2 members.');
    }
  };
}