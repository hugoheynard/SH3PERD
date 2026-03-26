import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import { USER_CODES_SUCCESS } from './codes/user.codes.js';
import { SearchUserByEmailUseCase } from '../useCase/SearchUserByEmailUseCase.js';
import { InviteUserUseCase, type TInviteUserDTO } from '../useCase/InviteUserUseCase.js';
import type { TUserId } from '@sh3pherd/shared-types';

@ApiTags('users')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@Controller()
export class UserLookupController {
  constructor(
    private readonly searchUC: SearchUserByEmailUseCase,
    private readonly inviteUC: InviteUserUseCase,
  ) {}

  @ApiOperation({ summary: 'Search user by email', description: 'Returns basic profile info if a user with this email exists.' })
  @Get('search')
  async searchByEmail(
    @Query('email') email: string,
  ) {
    const result = await this.searchUC.execute(email);
    return buildApiResponseDTO(USER_CODES_SUCCESS.SEARCH_USER, result);
  }

  @ApiOperation({ summary: 'Invite a new user', description: 'Creates a user account (inactive) from email + name. User must set their password before logging in.' })
  @Post('invite')
  async inviteUser(
    @Body() dto: TInviteUserDTO,
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.inviteUC.execute(dto, actorId);
    return buildApiResponseDTO(USER_CODES_SUCCESS.INVITE_USER, result);
  }
}
