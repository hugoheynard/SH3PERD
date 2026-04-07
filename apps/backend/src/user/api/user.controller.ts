import { Body, Controller, Get, Patch } from '@nestjs/common';
import type { TUserId, TUserPreferencesDomainModel } from '@sh3pherd/shared-types';
import { type TAsyncApiResponseDTO, type TUserMeViewModel } from '@sh3pherd/shared-types';
import { buildApiResponseDTO } from '../../music/codes.js';
import { USER_CODES_SUCCESS } from './codes/user.codes.js';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { ResPayloadValidator } from '../../utils/nest/ResPayloadValidator.decorator.js';
import { UserMeViewModelPayload } from '../dtos/user.dto.js';
import { GetCurrentUserViewModelQuery } from '../application/query/GetCurrentUserViewModel.js';
import { UpdateUserPreferencesCommand } from '../application/commands/UpdateUserPreferencesCommand.js';
import { CommandBus, QueryBus } from '@nestjs/cqrs';


@ApiTags('user')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'Authentication required. Missing or invalid Bearer token.',
})
@Controller()
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {};

  @ApiOperation({
    summary: 'Get current user informations',
    description: "Returns the current user's information." +
      " This includes user profile details and preferences."
  })
  @ApiResponse(apiSuccessDTO(USER_CODES_SUCCESS.GET_USER_ME, UserMeViewModelPayload , 200))
  @ResPayloadValidator(UserMeViewModelPayload, { active: false })
  @Get('me')
  async getUserMe(@ActorId() id: TUserId): TAsyncApiResponseDTO<TUserMeViewModel> {
    return buildApiResponseDTO<TUserMeViewModel>(
      USER_CODES_SUCCESS.GET_USER_ME,
      await this.queryBus.execute(new GetCurrentUserViewModelQuery(id))
    );
  };

  /**
   * Update current user's preferences (theme, workspace, etc.).
   * Accepts a partial patch — only provided fields are updated.
   */
  @ApiOperation({
    summary: 'Update user preferences',
    description: 'Partially updates the authenticated user preferences (theme, contract_workspace).',
  })
  @ApiResponse({ status: 200, description: 'Updated preferences.' })
  @Patch('preferences')
  async updatePreferences(
    @ActorId() actorId: TUserId,
    @Body() patch: Partial<TUserPreferencesDomainModel>,
  ): Promise<TUserPreferencesDomainModel> {
    return this.commandBus.execute(new UpdateUserPreferencesCommand(actorId, patch));
  }
}
