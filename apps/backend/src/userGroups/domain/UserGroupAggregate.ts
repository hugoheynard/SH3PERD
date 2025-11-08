import { UserGroupEntity } from './UserGroupEntity.js';
import type { ContractEntity } from '../../contracts/domain/ContractEntity.js';
import { type TContractId, UserGroupTypesEnum } from '@sh3pherd/shared-types';
import { UserGroupPolicy } from './UserGroupPolicy.js';

export class UserGroupAggregate {
  private readonly contractMap: Map<TContractId, ContractEntity>;

  constructor(
    private readonly group: UserGroupEntity,
    contracts: ContractEntity[]
  ) {
    this.contractMap = new Map(contracts.map(ctr => [ctr.id, ctr]));
  };

  // --- Getters ---
  /**
   * Get a contract entity by its ID.
   * @param id
   */
  getContractById(id: TContractId): ContractEntity {
    const entity =  this.contractMap.get(id);

    if (!entity) {
      throw new Error(`Contract with id ${id} not found in group ${this.group.id}`);
    }
    return entity;
  };

  /**
   * Get the list of members that the actor can add or remove from the group.
   * @param actor_id
   */
  getActionableMembers(actor_id: TContractId): ContractEntity[] {
    const policy = this.getPolicy(actor_id);

    return Array.from(this.contractMap.values())
      .filter(member => policy.canAddOrRemoveMember(member));
  };

  /**
   * Get the list of user group types that the actor is allowed to use.
   * @param actor_id
   */
  getAllowedTypes(actor_id: TContractId): UserGroupTypesEnum[] {
    const policy = this.getPolicy(actor_id);
    const types = Object.values(UserGroupTypesEnum)

    return types.filter((type) => policy.canUseType(type));
  };



  // --- Methods ---
  /*
  changeGroupLead(actor_id: TContractId, newLead: TContractId): UserGroupEntity {
    const newLeadEntity = this.getContractById(newLead);

    if (!this.getPolicy(actor_id).canChangeGroupLead(this.getContractById(newLeadEntity))) {

    }
    return this.group.changeGroupLead(newLead)
  };

   */

  /**
   *
   * @param actor_id
   * @param newMemberIds
   */
  addMembersToGroup(actor_id: TContractId, newMemberIds: TContractId[]): UserGroupEntity {
    const policy = this.getPolicy(actor_id);

    const allowedMemberIds = newMemberIds.filter(id => {
      const member = this.getContractById(id);

      return policy.canAddOrRemoveMember(member);
    });

    if (allowedMemberIds.length === 0) {
      return this.group;
    }

    const updatedMembers = Array.from(
      new Set([...this.group.toDomain.members, ...allowedMemberIds])
    );

    return new UserGroupEntity({
      ...this.group.toDomain,
      members: updatedMembers,
    });
  };

  /*
  removeMembers(actor_id: TContractId, memberIdsToRemove: TContractId[]): UserGroupEntity {
    const policy = this.getPolicy(actor_id);

    const current = this.group.toDomain
    const updatedMembers = memberIdsToRemove.filter(id => {

      const entity = this.getContractById(id);

      if (!this.group.isMember(id) && policy.canAddOrRemoveMember(entity)) {
         return id
       }
    });

    return new UserGroupEntity({
      ...current,
      members: updatedMembers,
    });
  };

   */


  //---Helper Methods ---
  /**
   * Get the policy for a given actor in the context of this user group.
   * @param actor_id
   */
  getPolicy(actor_id: TContractId): UserGroupPolicy {
    return new UserGroupPolicy(this.getContractById(actor_id), this.group);
  };


  /**
   * Factory method to create a UserGroupAggregate
   * strips out inactive contracts from the group members and referrals
   * @param group
   * @param contracts
   */
  static create(group: UserGroupEntity, contracts: ContractEntity[]): UserGroupAggregate {

    const { activeContracts, inactiveContractIds } = contracts.reduce(
      (acc, ctr) => {
        if (ctr.isActive()) {
          acc.activeContracts.push(ctr);
        } else {
          acc.inactiveContractIds.push(ctr.id);
        }
        return acc;
      },
      {
        activeContracts: [] as ContractEntity[],
        inactiveContractIds: [] as TContractId[],
      }
    );

    return new UserGroupAggregate(
      group.withoutMembers(inactiveContractIds),
      activeContracts
    );
  };
}

