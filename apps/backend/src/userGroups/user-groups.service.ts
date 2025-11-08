import { Inject, Injectable } from '@nestjs/common';
import {
  GET_CURRENT_USER_USER_GROUPS_USE_CASE,
  GET_USER_GROUP_SUBGROUP_INITIAL_FORM_VALUES_USE_CASE,
} from './user-groups.tokens.js';
import {
  GetCurrentUserUserGroupsUseCase,
  type TGetCurrentUserUserGroupsUseCase,
} from './useCases/GetCurrentUserUserGroups.js';
import type {
  GetSubGroupInitialFormValueObjectUseCase,
  TGetSubGroupInitialFormValueObjectUseCase,
} from './useCases/get-sub-group-initial-form-value-object-use-case.service.js';

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
  readonly getSubGroupInitialFormValues: TGetSubGroupInitialFormValueObjectUseCase;

  constructor(
    @Inject(GET_CURRENT_USER_USER_GROUPS_USE_CASE) private readonly getCurrentUserUserGroupsUseCase: GetCurrentUserUserGroupsUseCase,
    @Inject(GET_USER_GROUP_SUBGROUP_INITIAL_FORM_VALUES_USE_CASE) private readonly getSubGroupInitialFormValuesUseCase: GetSubGroupInitialFormValueObjectUseCase,

  ) {
    this.getCurrentUserUserGroups = (input) => this.getCurrentUserUserGroupsUseCase.execute(input);
    this.getSubGroupInitialFormValues = (input: any, x: any) => this.getSubGroupInitialFormValuesUseCase.execute(input, x);
  };
}
