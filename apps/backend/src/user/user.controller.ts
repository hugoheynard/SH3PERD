import { Body, Controller, Get, Inject, Patch} from '@nestjs/common';
import type { TUpdateUserPreferencesRequestDTO, TUserId } from '@sh3pherd/shared-types';//TApiResponse,
import { SGetUserMeResponseDTO, type TAsyncApiResponse, type TUserMeViewModel } from '@sh3pherd/shared-types';
import { buildApiResponse } from '../music/codes.js';
import { USER_CODES_SUCCESS } from './userCodes.js';
import { USER } from '../permissions/permissionsRegistry.js';
import type { TUserUseCases } from './useCases/UserUseCasesFactory.js';
import { USER_USE_CASES } from './user.tokens.js';
import { CurrentUser } from '../utils/nest/decorators/CurrentUser.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiSuccess } from '../utils/swagger/api-response.swagger.util.js';
import { ApiModel } from '../utils/swagger/api-model.swagger.util.js';
import { createZodDto } from 'nestjs-zod';


// DTOs
@ApiModel()
export class GetUserMeResponseDTO extends createZodDto(SGetUserMeResponseDTO) {}


@ApiTags('users')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'Authentication required. Missing or invalid Bearer token.',
})
@Controller()
export class UserController {
  constructor(
    @Inject(USER_USE_CASES) private readonly uc: TUserUseCases
  ) {};

  @ApiOperation({
    summary: 'Get current user informations',
    description: "Returns the current user's information." +
      " This includes user profile details and preferences."
  })
  @ApiResponse(apiSuccess(USER_CODES_SUCCESS.GET_USER_ME, GetUserMeResponseDTO , 200))
  @Get('me')
  async getUserMe(@CurrentUser() id: TUserId): TAsyncApiResponse<TUserMeViewModel> {
    return buildApiResponse(USER_CODES_SUCCESS.GET_USER_ME, await this.uc.getUserMe(id));
  };

  /**
   * Endpoint to update user preferences.
   * @param id
   * @param requestDTO
   */
  @Patch('preferences')
  updatePreferences(
    @CurrentUser() id: TUserId,
    @Body() requestDTO: TUpdateUserPreferencesRequestDTO
  ) {
    return this.uc.updateUserPreferences({
      asker_id: id,
      permission: USER.PREFERENCES.WRITE.SELF,
      filter: { user_id: id },
      update: requestDTO.update,
    });
  };
}
