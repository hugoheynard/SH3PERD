import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { UserScopedContext } from '../../utils/nest/decorators/Context.js';
import type { TUseCaseContext } from '../../types/useCases.generic.types.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { COMPANY_USE_CASES } from '../company.tokens.js';
import type { TCompanyUseCases } from '../useCase/CompanyUseCasesFactory.js';
import type { TCreateCompanyDTO } from '../useCase/company/CreateCompanyUseCase.js';
import type { TAddServiceDTO } from '../useCase/company/AddServiceUseCase.js';
import type { TCreateTeamDTO } from '../useCase/team/CreateTeamUseCase.js';
import type { TAddTeamMemberDTO } from '../useCase/team/AddTeamMemberUseCase.js';
import type { TRemoveTeamMemberDTO } from '../useCase/team/RemoveTeamMemberUseCase.js';
import type { TTeamId, TCompanyId, TCompanyAdminRole, TServiceId, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from './company.codes.js';
import {
  CompanyViewModelPayload,
  CompanyDetailViewModelPayload,
  CompanyCardViewModelPayload,
  TeamViewModelPayload,
  TeamMemberViewModelPayload,
} from '../dto/company.dto.js';

@ApiTags('companies')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'Authentication required. Missing or invalid Bearer token.',
})
@Controller()
export class CompanyController {
  constructor(
    @Inject(COMPANY_USE_CASES) private readonly uc: TCompanyUseCases,
  ) {}

  // ── Company ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create a company', description: 'Creates a new company owned by the authenticated user.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.CREATE_COMPANY, CompanyViewModelPayload, 200))
  @Post()
  async createCompany(
    @Body() dto: TCreateCompanyDTO,
    @UserScopedContext() ctx: TUseCaseContext<'unscoped'>,
  ) {
    const result = await this.uc.createCompany(dto, ctx.user_scope);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.CREATE_COMPANY, result);
  }

  @ApiOperation({ summary: 'Get my company', description: 'Returns the company owned by the authenticated user.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.GET_COMPANY, CompanyDetailViewModelPayload, 200))
  @Get('me')
  async getMyCompany(
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.uc.getMyCompany(actorId);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY, result);
  }

  @ApiOperation({ summary: 'Get all companies for current user' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.GET_MY_COMPANIES, CompanyCardViewModelPayload, 200))
  @Get('my-companies')
  async getMyCompanies(@UserScopedContext() ctx: TUseCaseContext<'unscoped'>) {
    return buildApiResponseDTO(
      COMPANY_CODES_SUCCESS.GET_MY_COMPANIES,
      await this.uc.getMyCompanies(ctx.user_scope),
    );
  }

  @ApiOperation({ summary: 'Get company by ID', description: 'Returns a company by its ID.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_BY_ID, CompanyDetailViewModelPayload, 200))
  @Get(':id')
  async getCompanyById(
    @Param('id') id: TCompanyId,
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.uc.getCompanyById(id, actorId);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_BY_ID, result);
  }

  @ApiOperation({ summary: 'Delete a company', description: 'Permanently deletes a company. Only the owner can delete.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.DELETE_COMPANY, undefined as any, 204))
  @HttpCode(204)
  @Delete(':id')
  async deleteCompany(
    @Param('id') id: TCompanyId,
    @ActorId() actorId: TUserId,
  ) {
    await this.uc.deleteCompany(id, actorId);
  }

  @ApiOperation({ summary: 'Update company info', description: 'Updates name, description and/or address. Owner only.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.UPDATE_COMPANY_INFO, CompanyDetailViewModelPayload, 200))
  @Patch(':id')
  async updateCompanyInfo(
    @Param('id') id: TCompanyId,
    @Body() body: { name?: string; description?: string; address?: Record<string, string> },
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.uc.updateCompanyInfo({ company_id: id, ...body }, actorId);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.UPDATE_COMPANY_INFO, result);
  }

  // ── Admins ─────────────────────────────────────────────────

  @ApiOperation({ summary: 'Add admin', description: 'Adds a user to the company admins. Owner only.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.ADD_ADMIN, CompanyDetailViewModelPayload, 200))
  @Post(':id/admins')
  async addAdmin(
    @Param('id') id: TCompanyId,
    @Body() body: { user_id: TUserId; role: TCompanyAdminRole },
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.uc.addAdmin({ company_id: id, user_id: body.user_id, role: body.role }, actorId);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.ADD_ADMIN, result);
  }

  @ApiOperation({ summary: 'Remove admin', description: 'Removes a user from company admins. Owner only.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.REMOVE_ADMIN, CompanyDetailViewModelPayload, 200))
  @Delete(':id/admins/:userId')
  async removeAdmin(
    @Param('id') id: TCompanyId,
    @Param('userId') userId: TUserId,
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.uc.removeAdmin({ company_id: id, user_id: userId }, actorId);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.REMOVE_ADMIN, result);
  }

  // ── Services ───────────────────────────────────────────────

  @ApiOperation({ summary: 'Add a service', description: 'Adds a new service to the specified company.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.ADD_SERVICE, CompanyViewModelPayload, 200))
  @Post('services')
  async addService(
    @Body() dto: TAddServiceDTO,
    @UserScopedContext() ctx: TUseCaseContext<'unscoped'>,
  ) {
    const result = await this.uc.addService(dto, ctx.user_scope);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.ADD_SERVICE, result);
  }

  @ApiOperation({ summary: 'Update a service', description: 'Updates name and/or color of a service.' })
  @Patch('services/:serviceId')
  async updateService(
    @Param('serviceId') serviceId: TServiceId,
    @Body() body: { company_id: TCompanyId; name?: string; color?: string },
  ) {
    const result = await this.uc.updateService({ company_id: body.company_id, service_id: serviceId, name: body.name, color: body.color });
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.UPDATE_SERVICE, result);
  }

  @ApiOperation({ summary: 'Remove a service', description: 'Removes a service from the specified company.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.REMOVE_SERVICE, CompanyViewModelPayload, 200))
  @Delete('services/:serviceId')
  async removeService(
    @Param('serviceId') serviceId: TServiceId,
    @Body() body: { company_id: TCompanyId },
    @UserScopedContext() ctx: TUseCaseContext<'unscoped'>,
  ) {
    const result = await this.uc.removeService({ company_id: body.company_id, service_id: serviceId }, ctx.user_scope);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.REMOVE_SERVICE, result);
  }

  @ApiOperation({ summary: 'Get service detail', description: 'Returns a service with its teams and active members.' })
  @Get(':id/services/:serviceId')
  async getServiceDetail(
    @Param('id') id: TCompanyId,
    @Param('serviceId') serviceId: TServiceId,
  ) {
    const result = await this.uc.getServiceDetail(id, serviceId);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_SERVICE_DETAIL, result);
  }

  // ── Teams ──────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create a team', description: 'Creates a new team for a company.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.CREATE_TEAM, TeamViewModelPayload, 200))
  @Post('teams')
  async createTeam(
    @Body() dto: TCreateTeamDTO,
    @UserScopedContext() ctx: TUseCaseContext<'unscoped'>,
  ) {
    const result = await this.uc.createTeam(dto, ctx.user_scope);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.CREATE_TEAM, result);
  }

  @ApiOperation({ summary: 'Get company teams', description: 'Returns all teams belonging to a company.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_TEAMS, TeamViewModelPayload, 200))
  @Get(':companyId/teams')
  async getCompanyTeams(
    @Param('companyId') companyId: TCompanyId,
  ) {
    const result = await this.uc.getCompanyTeams({ company_id: companyId });
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_TEAMS, result);
  }

  @ApiOperation({ summary: 'Get team members', description: 'Returns active members of a team.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.ADD_TEAM_MEMBER, TeamMemberViewModelPayload, 200))
  @Get('teams/:teamId/members')
  async getTeamMembers(
    @Param('teamId') teamId: TTeamId,
  ) {
    const result = await this.uc.getTeamMembers({ cast_id: teamId });
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.ADD_TEAM_MEMBER, result);
  }

  @ApiOperation({ summary: 'Get team members at date', description: 'Returns team members active at a specific date.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.ADD_TEAM_MEMBER, TeamMemberViewModelPayload, 200))
  @Get('teams/:teamId/members/at/:date')
  async getTeamMembersAt(
    @Param('teamId') teamId: TTeamId,
    @Param('date') date: string,
  ) {
    const result = await this.uc.getTeamMembers({ cast_id: teamId, at: new Date(date) });
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.ADD_TEAM_MEMBER, result);
  }

  @ApiOperation({ summary: 'Add team member', description: 'Adds a member to the specified team.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.ADD_TEAM_MEMBER, TeamMemberViewModelPayload, 200))
  @Post('teams/:teamId/members')
  async addTeamMember(
    @Param('teamId') teamId: TTeamId,
    @Body() body: Omit<TAddTeamMemberDTO, 'cast_id'>,
    @UserScopedContext() ctx: TUseCaseContext<'unscoped'>,
  ) {
    const result = await this.uc.addTeamMember({ ...body, cast_id: teamId }, ctx.user_scope);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.ADD_TEAM_MEMBER, result);
  }

  @ApiOperation({ summary: 'Remove team member', description: 'Removes a member from the specified team.' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.REMOVE_TEAM_MEMBER, TeamMemberViewModelPayload, 200))
  @Delete('teams/:teamId/members/:userId')
  async removeTeamMember(
    @Param('teamId') teamId: TTeamId,
    @Param('userId') userId: string,
    @Body() body: { reason?: string },
    @UserScopedContext() ctx: TUseCaseContext<'unscoped'>,
  ) {
    const dto: TRemoveTeamMemberDTO = { cast_id: teamId, user_id: userId as any, reason: body?.reason };
    const result = await this.uc.removeTeamMember(dto, ctx.user_scope);
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.REMOVE_TEAM_MEMBER, result);
  }
}
