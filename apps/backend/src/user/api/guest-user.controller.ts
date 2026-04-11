import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { P } from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { CreateGuestUserCommand, type TCreateGuestUserDTO, type TCreateGuestUserResult } from '../application/commands/CreateGuestUserCommand.js';
import { UpdateGuestProfileCommand, type TUpdateGuestProfileDTO } from '../application/commands/UpdateGuestProfileCommand.js';
import { GetCompanyGuestsQuery, type TGuestViewModel } from '../application/query/GetCompanyGuestsQuery.js';
import { GUEST_COMPANY_REPO } from '../../appBootstrap/nestTokens.js';
import type { IGuestCompanyRepository } from '../infra/GuestCompanyMongoRepo.repository.js';

@ApiTags('users / guest')
@ApiBearerAuth('bearer')
@ContractScoped()
@Controller()
export class GuestUserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(GUEST_COMPANY_REPO) private readonly guestCompanyRepo: IGuestCompanyRepository,
  ) {}

  @ApiOperation({ summary: 'Create a guest user (and link to a company if company_id is provided)' })
  @ApiResponse({ status: 201, description: 'Guest user created or found (deduplication by email).' })
  @ApiResponse({ status: 409, description: 'Email belongs to an active (non-guest) user.' })
  @RequirePermission(P.Company.Members.Write)
  @Post('guest')
  async createGuestUser(
    @Body() dto: TCreateGuestUserDTO,
    @ActorId() actorId: TUserId,
  ): Promise<TCreateGuestUserResult> {
    return this.commandBus.execute(new CreateGuestUserCommand(dto, actorId));
  }

  @ApiOperation({ summary: 'List guest users for a company' })
  @ApiResponse({ status: 200, description: 'List of guest users linked to the company via the guest_company junction.' })
  @RequirePermission(P.Company.Members.Read)
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
  @RequirePermission(P.Company.Members.Write)
  @Patch('guest/:userId')
  async updateGuestProfile(
    @Param('userId') userId: TUserId,
    @Body() patch: TUpdateGuestProfileDTO,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateGuestProfileCommand(userId, patch));
  }

  @ApiOperation({ summary: 'Unlink a guest from a company (does NOT delete the user)' })
  @ApiResponse({ status: 200, description: 'Guest unlinked from the company.' })
  @RequirePermission(P.Company.Members.Write)
  @Delete('guest/:userId/companies/:companyId')
  async unlinkGuestFromCompany(
    @Param('userId') userId: TUserId,
    @Param('companyId') companyId: TCompanyId,
  ): Promise<{ ok: boolean }> {
    const removed = await this.guestCompanyRepo.unlink(userId, companyId);
    return { ok: removed };
  }
}
