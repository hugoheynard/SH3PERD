import { Inject, Injectable } from '@nestjs/common';
import { USER_GROUPS_REPO } from '../../appBootstrap/nestTokens.js';
import type { IUserGroupsMongoRepository } from '../infra/UserGroupsMongoRepository.js';
import type { TUseCaseContext } from '../../types/useCases.generic.types.js';
import type { TUserGroupDomainModel, TUserGroupRecord } from '@sh3pherd/shared-types';
import type { Filter } from 'mongodb';
import { UserGroup } from '../user-group.entity.js';

export type TGetCurrentUserUserGroupsUseCase = (input: { requestDTO: Filter<TUserGroupRecord>; context: TUseCaseContext<'scoped'>; }) => Promise<TUserGroupDomainModel[]>;

/**
 * GetCurrentUserUserGroups use case
 * @description Use case to get the user groups of the current user scoped to the current contract
 *
 */
@Injectable()
export class GetCurrentUserUserGroupsUseCase {
  constructor(
    @Inject(USER_GROUPS_REPO) private readonly userGroupsRepo: IUserGroupsMongoRepository,
  ) {};

  async execute(input: { requestDTO: Filter<TUserGroupRecord>; context: TUseCaseContext<'scoped'>; }): Promise<TUserGroupDomainModel[]> {
    const { requestDTO, context } = input;

    const result = await this.userGroupsRepo
      .getContractScopedUserGroups(context.contract_scope);
    console.log(requestDTO);

    const entities = result.map(record => UserGroup.fromRecord(record).toDomain);

    return result ? entities : [];
  };

}

