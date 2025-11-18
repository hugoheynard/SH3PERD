import { Controller, Get, Patch, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  UpdateUserProfileCommand,
  UpdateUserProfileResponseDTO,
} from '../application/commands/UpdateUserProfileCommand.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import type { TUserId, TUserProfileDomainModel, TApiResponse } from '@sh3pherd/shared-types';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { USER_PROFILE_SUCCESS } from './codes/user-profile.apiCodes.js';
import { GetUserProfileQuery } from '../application/query/GetUserProfileQuery.js';

@ApiTags('user-profile')
@Controller()
export class UserProfileController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {};


  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse(apiSuccessDTO(USER_PROFILE_SUCCESS.GET_USER_PROFILE, Object))
  @Get('me')
  async getCurrentUserProfile(
    @ActorId() actor_id: TUserId,
  ): Promise<TApiResponse<any>> {
    return buildApiResponseDTO(
      USER_PROFILE_SUCCESS.GET_USER_PROFILE,
      this.qryBus.execute(
        new GetUserProfileQuery({ actor_id }, actor_id)
      )
    )
  };

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse(apiSuccessDTO(USER_PROFILE_SUCCESS.UPDATE_USER_PROFILE, UpdateUserProfileResponseDTO))
  @Patch('me')
  async updateCurrentUserProfile(
    @ActorId() actor_id: TUserId,
    @Body() requestDTO: { updateData: Partial<TUserProfileDomainModel> }
  ):Promise<TApiResponse<UpdateUserProfileResponseDTO>> {

    return buildApiResponseDTO(
      USER_PROFILE_SUCCESS.UPDATE_USER_PROFILE,
      await this.cmdBus.execute(
        new UpdateUserProfileCommand({ actor_id }, actor_id, requestDTO.updateData)
      )
    )
  };

}
