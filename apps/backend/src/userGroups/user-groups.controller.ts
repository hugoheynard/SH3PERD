import { Body, Controller, Inject, Param, Patch, Post } from '@nestjs/common';
import { Scoped } from '../utils/nest/decorators/Scoped.js';
import { ContractScopedContext } from '../utils/nest/decorators/Context.js';
import type { TUseCaseContext } from '../types/useCases.generic.types.js';
import type { UserGroupsService } from './user-groups.service.js';
import { USER_GROUPS_SERVICE } from './user-groups.tokens.js';
import type { TUserGroupId } from '@sh3pherd/shared-types';


@Controller()
export class UserGroupsController {
  constructor(
    @Inject(USER_GROUPS_SERVICE) private readonly userGroupsService: UserGroupsService,
  ) {};

  /**
   * Endpoint to get the current user's user-groups scoped to the current contract.
   * @param context
   * @param requestDTO
   */
  @Scoped('contract')
  @Post('me')
  async getCurrentUserContractsUserGroups(
    @ContractScopedContext() context: TUseCaseContext<'scoped'>,
    @Body() requestDTO: any
  ): Promise<any> {
    return await this.userGroupsService.getCurrentUserUserGroups({ requestDTO, context });
  };

  /**
   * Endpoint to add members to a user group.
   * @param context
   * @param id
   * @param requestDTO
   */
  @Scoped('contract')
  @Patch(':id/add-member')
  addMemberToGroup(
    @ContractScopedContext() context: TUseCaseContext<'scoped'>,
    @Param('id') id: TUserGroupId,
    @Body() requestDTO: any
  ): any {
    // TODO implement
    console.log({ context, id, requestDTO })
  };
}
