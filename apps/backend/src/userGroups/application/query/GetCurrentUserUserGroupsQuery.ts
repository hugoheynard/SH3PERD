import { Inject, Injectable } from '@nestjs/common';
import type { TUseCaseContext } from '../../../types/useCases.generic.types.js';
import type { TUserGroupRecord, TUserGroupListViewModel } from '@sh3pherd/shared-types';
import type { Filter } from 'mongodb';
import { USER_GROUPS_BY_CONTRACT_ASSEMBLER } from '../../user-groups.tokens.js';
import type { UserGroupListByContractAssembler } from '../UserGroupListByContractAssembler.js';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export type TGetCurrentUserUserGroupsUseCase = (input: {
  requestDTO: Filter<TUserGroupRecord>;
  context: TUseCaseContext<'scoped'>;
}) => Promise<TUserGroupListViewModel>;

export class GetCurrentUserUserGroupsQuery {
  constructor(
    public readonly context: TUseCaseContext<'scoped'>,
    public readonly requestDTO: Filter<TUserGroupRecord>,
  ) {}
}

/**
 * GetCurrentUserUserGroups use case
 * @description Use case to get the user groups of the current user scoped to the current contract
 *
 */
@QueryHandler(GetCurrentUserUserGroupsQuery)
@Injectable()
export class GetCurrentUserUserGroupsHandler implements IQueryHandler<
  GetCurrentUserUserGroupsQuery,
  TUserGroupListViewModel
> {
  constructor(
    @Inject(USER_GROUPS_BY_CONTRACT_ASSEMBLER)
    private readonly assembler: UserGroupListByContractAssembler,
  ) {}

  async execute(input: GetCurrentUserUserGroupsQuery): Promise<TUserGroupListViewModel> {
    const { requestDTO, context } = input;

    const result = await this.assembler.execute(context.contract_scope);

    console.log('GetCurrentUserUserGroupsUseCase', requestDTO);

    return result;
  }
}
