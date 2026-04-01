import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import { USER_CODES_SUCCESS } from './codes/user.codes.js';
import { SearchUserByEmailQuery } from '../application/query/SearchUserByEmailQuery.js';
import { InviteUserCommand, type TInviteUserDTO } from '../application/commands/InviteUserCommand.js';
import type { TUserId } from '@sh3pherd/shared-types';

@ApiTags('users')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@Controller()
export class UserLookupController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Search user by email', description: 'Returns basic profile info if a user with this email exists.' })
  @Get('search')
  async searchByEmail(
    @Query('email') email: string,
  ) {
    const result = await this.qryBus.execute(new SearchUserByEmailQuery(email));
    return buildApiResponseDTO(USER_CODES_SUCCESS.SEARCH_USER, result);
  }

  @ApiOperation({ summary: 'Invite a new user', description: 'Creates a user account (inactive) from email + name. User must set their password before logging in.' })
  @Post('invite')
  async inviteUser(
    @Body() dto: TInviteUserDTO,
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.cmdBus.execute(new InviteUserCommand(dto, actorId));
    return buildApiResponseDTO(USER_CODES_SUCCESS.INVITE_USER, result);
  }
}
