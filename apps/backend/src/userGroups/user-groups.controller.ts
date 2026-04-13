import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ContractScoped } from '../utils/nest/decorators/ContractScoped.js';
import { ContractScopedContext } from '../utils/nest/decorators/Context.js';
import type { TUseCaseContext } from '../types/useCases.generic.types.js';
import type { TUserGroupId, TAsyncApiResponseDTO } from '@sh3pherd/shared-types';
import { ApiOkResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  SubgroupInitialFormValuesObjectDTO,
  UserGroupListDTO,
} from './application/dto/user-groups.dto.js';
import { ResPayloadValidator } from '../utils/nest/ResPayloadValidator.decorator.js';
import { apiSuccessDTO } from '../utils/swagger/api-response.swagger.util.js';
import { USERGROUP_SUCCESS } from './user-groups.codes.js';
import { buildApiResponseDTO } from '../music/codes.js';
import { QueryBus } from '@nestjs/cqrs';
import { GetCurrentUserUserGroupsQuery } from './application/query/GetCurrentUserUserGroupsQuery.js';
import { GetSubGroupInitialFormValueObjectQuery } from './application/query/GetSubGroupInitialFormValueObjectQuery.js';

@Controller()
export class UserGroupsController {
  constructor(private readonly queryBus: QueryBus) {}

  //--- get/me ---
  @ApiOperation({
    summary: 'Get user groups for the current user (contract scoped operation)',
    description: `
    Retrieves all **user groups** in which the currently authenticated user participates within the current **contract scope**.

    This endpoint uses the contract scope context to:
    - Resolve which user groups are accessible
    - Attach related contract and user profile information
    - Respect permission boundaries defined by the current user's contract
    
    Returns the **aggregated view model** containing:
      - The list of user groups where the user is a member, lead, or delegated
      - The corresponding contracts (keyed by contract_id)
      - The related user profiles`,
  })
  @ApiResponse(apiSuccessDTO(USERGROUP_SUCCESS.GET_CURRENT_USER_USERGROUPS, UserGroupListDTO, 200))
  //--//
  @ResPayloadValidator(UserGroupListDTO, { active: false })
  @ContractScoped()
  @Post('me')
  async getCurrentUserContractsUserGroups(
    @ContractScopedContext() context: TUseCaseContext<'scoped'>,
    @Body() requestDTO: any,
  ): TAsyncApiResponseDTO<UserGroupListDTO> {
    return buildApiResponseDTO(
      USERGROUP_SUCCESS.GET_CURRENT_USER_USERGROUPS,
      await this.queryBus.execute(new GetCurrentUserUserGroupsQuery(context, requestDTO.filter)),
    );
  }

  //--- GET subgroupInitialFormValues ---
  @ApiOperation({
    summary: 'Get initial form values for creating a subgroup',
    description: `
  Retrieves the initial form values required to create a **subgroup** under the specified **user group**.
  Returns default settings and configurations to pre-fill the subgroup creation form.`,
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the parent user group under which the subgroup will be created.',
  })
  @ApiResponse(
    apiSuccessDTO(
      USERGROUP_SUCCESS.GET_SUBGROUP_INITIAL_FORM_VALUES,
      SubgroupInitialFormValuesObjectDTO,
      200,
    ),
  )
  //--//
  @ResPayloadValidator(UserGroupListDTO, { active: false })
  @ContractScoped()
  @Get(':id/sub-group/initial-form-config')
  async getSubgroupInitialFormValues(
    @ContractScopedContext() context: TUseCaseContext<'scoped'>,
    @Param('id') id: TUserGroupId,
  ): TAsyncApiResponseDTO<SubgroupInitialFormValuesObjectDTO> {
    return buildApiResponseDTO(
      USERGROUP_SUCCESS.GET_SUBGROUP_INITIAL_FORM_VALUES,
      await this.queryBus.execute(new GetSubGroupInitialFormValueObjectQuery(context, id)),
    );
  }

  @ApiOperation({
    summary: 'Add member to user group (contract scoped operation)',
    description: `
Adds a new member to the specified **user group** within the current **contract scope**.

This endpoint allows authorized users to:
- Add members to user groups they lead or have permissions for
- Ensure that the addition respects the contract scope and permission boundaries`,
  })
  @ApiOkResponse({
    description: 'Returns the updated user group with the new member added.',
    type: Object,
  })
  @ContractScoped()
  @Patch(':id/add-member')
  addMemberToGroup(
    @ContractScopedContext() context: TUseCaseContext<'scoped'>,
    @Param('id') id: TUserGroupId,
  ): any {
    // TODO implement
    console.log({ context, id });
  }
}
