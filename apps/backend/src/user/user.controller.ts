import { Body, Controller, Get, Inject, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { ApiResponse, TUserMeViewModel, TUpdateUserPreferencesRequestDTO } from '@sh3pherd/shared-types';
import { buildApiResponse } from '../music/codes.js';
import { USER_API_CODES_SUCCESS } from './__tests__/userCodes.js';
import { USER } from '../permissions/permissionsRegistry.js';
import type { TUserUseCases } from './useCases/UserUseCasesFactory.js';
import { USER_USE_CASES } from './user.tokens.js';


@Controller()
export class UserController {
  constructor(
    @Inject(USER_USE_CASES) private readonly uc: TUserUseCases,
  ) {};

  /**
   * Endpoint to get the current user's information.
   * Retrieves the user_id from the request object and fetches the user's details.
   * @param req
   */
  @Get('me')
  async getUserMe(@Req() req: Request): Promise<ApiResponse<TUserMeViewModel>> {
    return buildApiResponse(USER_API_CODES_SUCCESS.GET_USER_ME, await this.uc.getUserMe(req.user_id));
  };

  /**
   * Endpoint to update user preferences.
   * @param req
   * @param requestDTO
   */
  @Patch('preferences')
  updatePreferences(
    @Req() req: Request,
    @Body() requestDTO: TUpdateUserPreferencesRequestDTO
  ) {
    return this.uc.updateUserPreferences({
      asker_id: req.user_id,
      permission: USER.PREFERENCES.WRITE.SELF,
      filter: { user_id: req.user_id },
      update: requestDTO.update,
    });
  };
}
