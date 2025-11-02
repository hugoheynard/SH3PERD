import { Body, Controller, Get, Inject, Patch } from '@nestjs/common';
import type { TUpdateUserPreferencesRequestDTO, TUserId } from '@sh3pherd/shared-types'; //TApiResponse,
import { type TAsyncApiResponseDTO, type TUserMeViewModel } from '@sh3pherd/shared-types';
import { buildApiResponseDTO } from '../music/codes.js';
import { USER_CODES_SUCCESS } from './user.codes.js';
import { USER } from '../permissions/permissionsRegistry.js';
import type { TUserUseCases } from './useCases/UserUseCasesFactory.js';
import { USER_USE_CASES } from './user.tokens.js';
import { CurrentUser } from '../utils/nest/decorators/CurrentUser.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { apiSuccessDTO } from '../utils/swagger/api-response.swagger.util.js';
import { ResPayloadValidator } from '../utils/nest/ResPayloadValidator.decorator.js';
import { UserMeViewModelPayload } from './dtos/user.dto.js';


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
  @ApiResponse(apiSuccessDTO(USER_CODES_SUCCESS.GET_USER_ME, UserMeViewModelPayload , 200))
  @ResPayloadValidator(UserMeViewModelPayload)
  @Get('me')
  async getUserMe(@CurrentUser() id: TUserId): TAsyncApiResponseDTO<TUserMeViewModel> {
    return buildApiResponseDTO<TUserMeViewModel>(USER_CODES_SUCCESS.GET_USER_ME, await this.uc.getUserMe(id));
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
