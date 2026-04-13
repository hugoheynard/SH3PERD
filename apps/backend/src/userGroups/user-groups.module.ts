import { Module } from '@nestjs/common';
import { UserGroupsController } from './user-groups.controller.js';
import { UserGroupsService } from './user-groups.service.js';
import {
  GET_CURRENT_USER_USER_GROUPS_USE_CASE,
  GET_USER_GROUP_SUBGROUP_INITIAL_FORM_VALUES_USE_CASE,
  USER_GROUPS_BY_CONTRACT_ASSEMBLER,
  USER_GROUPS_SERVICE,
} from './user-groups.tokens.js';
import { GetCurrentUserUserGroupsHandler } from './application/query/GetCurrentUserUserGroupsQuery.js';
import { UserGroupListByContractAssembler } from './application/UserGroupListByContractAssembler.js';
import { GetSubGroupInitialFormValueObjectHandler } from './application/query/GetSubGroupInitialFormValueObjectQuery.js';

@Module({
  imports: [],
  providers: [
    { provide: USER_GROUPS_SERVICE, useClass: UserGroupsService },

    //--- APPLICATION LAYER : ASSEMBLERS ---
    { provide: USER_GROUPS_BY_CONTRACT_ASSEMBLER, useClass: UserGroupListByContractAssembler },

    //--- USE CASES --
    { provide: GET_CURRENT_USER_USER_GROUPS_USE_CASE, useClass: GetCurrentUserUserGroupsHandler },
    {
      provide: GET_USER_GROUP_SUBGROUP_INITIAL_FORM_VALUES_USE_CASE,
      useClass: GetSubGroupInitialFormValueObjectHandler,
    },
  ],
  controllers: [UserGroupsController],
  exports: [USER_GROUPS_SERVICE],
})
export class UserGroupsModule {}
