import { Module } from '@nestjs/common';
import { UserGroupsController } from './user-groups.controller.js';
import { UserGroupsService } from './user-groups.service.js';
import {
  GET_CURRENT_USER_USER_GROUPS_USE_CASE,
  USER_GROUPS_BY_CONTRACT_ASSEMBLER,
  USER_GROUPS_SERVICE,
} from './user-groups.tokens.js';
import { GetCurrentUserUserGroupsUseCase } from './useCases/GetCurrentUserUserGroups.js';
import { UserGroupListByContractAssembler } from './core/UserGroupListByContractAssembler.js';

@Module({
  imports: [],
  providers: [
    { provide: USER_GROUPS_SERVICE, useClass: UserGroupsService },

    //--- APPLICATION LAYER : ASSEMBLERS ---
    { provide: USER_GROUPS_BY_CONTRACT_ASSEMBLER, useClass: UserGroupListByContractAssembler },

    //--- USE CASES --
    { provide: GET_CURRENT_USER_USER_GROUPS_USE_CASE, useClass: GetCurrentUserUserGroupsUseCase }
  ],
  controllers: [UserGroupsController],
  exports: [USER_GROUPS_SERVICE],
})
export class UserGroupsModule {}
