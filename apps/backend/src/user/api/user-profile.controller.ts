import { Controller, Get, Patch, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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

@ApiTags('user-profile')
@Controller()
export class UserProfileController {
  constructor(
    private readonly cmdBus: CommandBus
  ) {};


  @Get('me')
  async getCurrentUserProfile() {

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
