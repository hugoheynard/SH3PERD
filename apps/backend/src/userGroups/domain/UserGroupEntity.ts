import { AggregateEntity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TUserGroupDomainModel, TContractId } from '@sh3pherd/shared-types';
import { DomainError } from '../../utils/errorManagement/DomainError.js';

/**
 * Represents a user group entity within the system.
 */
export class UserGroupEntity extends AggregateEntity<TUserGroupDomainModel> {
  private readonly _referentsSet: Set<TContractId>;
  private readonly _membersSet: Set<TContractId>;

  constructor(props: TEntityInput<TUserGroupDomainModel>) {
    super(props, 'user-group');

    this.ensureHasGroupLead(props);

    this._referentsSet = new Set(this.props.referents);
    this._membersSet = new Set(this.props.members);
  }

  // --- Getters  ---
  get allMembers(): TContractId[] {
    return [this.props.groupLead, ...this.props.referents, ...this.props.members];
  }

  get uniqueIds(): TContractId[] {
    return Array.from(new Set(this.allMembers));
  }

  // --- Checkers ---
  isType(type: TUserGroupDomainModel['type']): boolean {
    return this.props.type === type;
  }

  isGroupLead(contractId: TContractId): boolean {
    return this.props.groupLead === contractId;
  }

  isReferent(contractId: TContractId): boolean {
    return this._referentsSet.has(contractId);
  }

  isMember(contractId: TContractId): boolean {
    return this._membersSet.has(contractId);
  }

  // --- Guards Methods ---
  private ensureHasGroupLead(props: TEntityInput<TUserGroupDomainModel>): void {
    if (!props.groupLead) {
      throw new DomainError('User group must have a group lead', { code: 'USER_GROUP_NO_LEAD' });
    }
  }

  changeGroupLead(newLead: TContractId): UserGroupEntity {
    return new UserGroupEntity({
      ...this.props,
      groupLead: newLead,
    });
  }

  // Factory method
  /**
   * Creates a new UserGroupEntity without the specified member IDs.
   * @param idsToExclude
   */
  withoutMembers(idsToExclude: TContractId[]): UserGroupEntity {
    const cleanedMembers = this.props.members.filter((m) => !idsToExclude.includes(m));
    const cleanedReferents = this.props.referents.filter((r) => !idsToExclude.includes(r));

    return new UserGroupEntity({
      ...this.props,
      members: cleanedMembers,
      referents: cleanedReferents,
    });
  }
}
