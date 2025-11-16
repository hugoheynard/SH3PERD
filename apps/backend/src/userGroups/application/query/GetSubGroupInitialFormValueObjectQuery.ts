import type { IUserGroupsMongoRepository } from '../../infra/UserGroupsMongoRepository.js';
import { Inject, Injectable } from '@nestjs/common';
import type { TUserGroupId, TContractId, TFormOption, TSubgroupInitialFormValuesObject } from '@sh3pherd/shared-types';
import { UserGroupEntity } from '../../domain/UserGroupEntity.js';
import { CONTRACT_READ_REPO, USER_GROUPS_REPO } from '../../../appBootstrap/nestTokens.js';
import { UserGroupAggregate } from '../../domain/UserGroupAggregate.js';
import { ContractEntity } from '../../../contracts/domain/ContractEntity.js';
import type { IContractReadRepository } from '../../../contracts/repositories/ContractReadRepository.js';
import type { TUseCaseContext } from '../../../types/useCases.generic.types.js';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';


export type TGetSubGroupInitialFormValueObjectUseCase = (input: { context: TUseCaseContext<'scoped'>, parentUserGroupId: TUserGroupId }) => Promise<TSubgroupInitialFormValuesObject>;

export class GetSubGroupInitialFormValueObjectQuery {
  constructor(
    public readonly context: TUseCaseContext<'scoped'>,
    public readonly parentUserGroupId: TUserGroupId,
  ) {}
}


@QueryHandler(GetSubGroupInitialFormValueObjectQuery)
@Injectable()
export class GetSubGroupInitialFormValueObjectHandler implements IQueryHandler<GetSubGroupInitialFormValueObjectQuery, TSubgroupInitialFormValuesObject>{
  constructor(
    @Inject(USER_GROUPS_REPO) private readonly ugRepo: IUserGroupsMongoRepository,
    @Inject(CONTRACT_READ_REPO) private readonly ctrReadRepo: IContractReadRepository,
  ) {};

  async execute(input: GetSubGroupInitialFormValueObjectQuery): Promise<TSubgroupInitialFormValuesObject> {
    const { parentUserGroupId, context } = input;

    const actor_id = context.contract_scope;

    const parentUg = await this.getParentGroupFromDb(parentUserGroupId);
    const contractsWithProfile = await this.ctrReadRepo.getContractWithUserProfile(parentUg.uniqueIds);
    const aggregate = UserGroupAggregate.create(parentUg, contractsWithProfile.map(c => ContractEntity.fromRecord(c.contract)));
    const allowedMembers = aggregate.getActionableMembers(actor_id);
    const allowedTypes = aggregate.getAllowedTypes(actor_id);

    return {
      name: `${parentUg.id} - Subgroup`,
      typeOptions: this.transformToFormOptions(allowedTypes.map(value => ({ value }))),
      referentsOptions: this.buildMembersFormOptions(contractsWithProfile, allowedMembers),
      membersOptions: this.buildMembersFormOptions(contractsWithProfile, allowedMembers),
    }
  };


  //--- Helpers ---//
  buildMembersFormOptions(contractsWithProfile: any[], allowedMembers: ContractEntity[]): TFormOption<TContractId>[] {
    const allowedIds = new Set(allowedMembers.map(m => m.id));

    let options: TFormOption<TContractId>[] = [];
    for (const ctr of contractsWithProfile) {

      if (!allowedIds.has(ctr.contract.id)) {
        continue;
      }

      options.push({
        label: `${ctr.userProfile.first_name} ${ctr.userProfile.last_name}`,
        value: ctr.contract.id,
      });
    }

    return options;
  };

  transformToFormOptions<T>(
    array: { label?: string; value: T }[]
  ): TFormOption<T>[] {
    return array.map(({ label, value }) => ({
      label: label ?? String(value),
      value,
    }));
  };

  /**
   * Fetches the parent user group from the database, returning a UserGroupEntity.
   * @param parentUserGroupId
   */
  async getParentGroupFromDb(parentUserGroupId: TUserGroupId): Promise<UserGroupEntity> {
    const parentGroup = await this.ugRepo.findOne({ filter: { id: parentUserGroupId }});

    if (!parentGroup) {
      throw new Error(`Parent user group with id ${parentUserGroupId} not found`);
    }

    return UserGroupEntity.fromRecord(parentGroup);
  };
}