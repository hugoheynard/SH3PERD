import { Inject, Injectable } from '@nestjs/common';
import { GET_CURRENT_USER_USER_GROUPS_USE_CASE } from './user-groups.tokens.js';
import {
  GetCurrentUserUserGroupsUseCase,
  type TGetCurrentUserUserGroupsUseCase,
} from './useCases/GetCurrentUserUserGroups.js';

export interface IUserGroupsService {
  getCurrentUserUserGroups: TGetCurrentUserUserGroupsUseCase;
}

/**
 * UserGroupsService
 * @description Service to handle user groups related operations
 * aggregates use cases
 */
@Injectable()
export class UserGroupsService implements IUserGroupsService {
  readonly getCurrentUserUserGroups: TGetCurrentUserUserGroupsUseCase;

  constructor(
    @Inject(GET_CURRENT_USER_USER_GROUPS_USE_CASE) private readonly getCurrentUserUserGroupsUseCase: GetCurrentUserUserGroupsUseCase
  ) {
    this.getCurrentUserUserGroups = (input) =>this.getCurrentUserUserGroupsUseCase.execute(input);
  };
}
