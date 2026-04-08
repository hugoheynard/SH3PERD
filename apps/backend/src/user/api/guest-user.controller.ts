import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { CreateGuestUserCommand, type TCreateGuestUserDTO, type TCreateGuestUserResult } from '../application/commands/CreateGuestUserCommand.js';
import { UpdateGuestProfileCommand, type TUpdateGuestProfileDTO } from '../application/commands/UpdateGuestProfileCommand.js';
import { GetCompanyGuestsQuery, type TGuestViewModel } from '../application/query/GetCompanyGuestsQuery.js';

@ApiTags('users / guest')
@ApiBearerAuth('bearer')
@Controller()
export class GuestUserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Create a guest user' })
  @ApiResponse({ status: 201, description: 'Guest user created or found (deduplication by email).' })
  @ApiResponse({ status: 409, description: 'Email belongs to an active (non-guest) user.' })
  @Post('guest')
  async createGuestUser(
    @Body() dto: TCreateGuestUserDTO,
    @ActorId() actorId: TUserId,
  ): Promise<TCreateGuestUserResult> {
    return this.commandBus.execute(new CreateGuestUserCommand(dto, actorId));
  }

  @ApiOperation({ summary: 'List guest users for a company' })
  @ApiResponse({ status: 200, description: 'List of guest users who are members of any node in the company.' })
  @Get('guests')
  async getCompanyGuests(
    @Query('companyId') companyId: TCompanyId,
  ): Promise<TGuestViewModel[]> {
    return this.queryBus.execute(new GetCompanyGuestsQuery(companyId));
  }

  @ApiOperation({ summary: 'Update a guest user profile' })
  @ApiResponse({ status: 200, description: 'Guest profile updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'User is not a guest.' })
  @Patch('guest/:userId')
  async updateGuestProfile(
    @Param('userId') userId: TUserId,
    @Body() patch: TUpdateGuestProfileDTO,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateGuestProfileCommand(userId, patch));
  }
}
