import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from './company.codes.js';

import { CreateCompanyCommand } from '../application/commands/CreateCompanyCommand.js';
import { DeleteCompanyCommand } from '../application/commands/DeleteCompanyCommand.js';
import { GetCompanyByIdQuery } from '../application/queries/GetCompanyByIdQuery.js';
import { GetCompanyByOwnerQuery } from '../application/queries/GetCompanyByOwnerQuery.js';
import { GetMyCompaniesQuery } from '../application/queries/GetMyCompaniesQuery.js';
import { GetCompanyOrgChartQuery } from '../application/queries/GetCompanyOrgChartQuery.js';
import { GetCompanyOrgNodesQuery } from '../application/queries/GetCompanyTeamsQuery.js';

@ApiTags('companies')
@ApiBearerAuth('bearer')
@Controller()
export class CompanyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Create a company' })
  @Post()
  async createCompany(
    @Body() dto: { name: string },
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.commandBus.execute(new CreateCompanyCommand(dto, actorId));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.CREATE_COMPANY, result);
  }

  @ApiOperation({ summary: 'Get my company (as owner)' })
  @Get('me')
  async getMyCompany(@ActorId() actorId: TUserId) {
    const result = await this.queryBus.execute(new GetCompanyByOwnerQuery(actorId));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY, result);
  }

  @ApiOperation({ summary: 'Get all companies for current user' })
  @Get('my-companies')
  async getMyCompanies(@ActorId() actorId: TUserId) {
    const result = await this.queryBus.execute(new GetMyCompaniesQuery(actorId));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_MY_COMPANIES, result);
  }

  @ApiOperation({ summary: 'Get company by ID' })
  @Get(':id')
  async getCompanyById(@Param('id') id: TCompanyId) {
    const result = await this.queryBus.execute(new GetCompanyByIdQuery(id));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_BY_ID, result);
  }

  @ApiOperation({ summary: 'Delete a company (owner only)' })
  @HttpCode(204)
  @Delete(':id')
  async deleteCompany(
    @Param('id') id: TCompanyId,
    @ActorId() actorId: TUserId,
  ) {
    await this.commandBus.execute(new DeleteCompanyCommand(id, actorId));
  }

  // ── Org Chart (company-level views) ─────────────────────────

  @ApiOperation({ summary: 'Get company org chart (hierarchy tree)' })
  @Get(':id/orgchart')
  async getOrgChart(@Param('id') id: TCompanyId) {
    const result = await this.queryBus.execute(new GetCompanyOrgChartQuery(id));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_ORGCHART, result);
  }

  @ApiOperation({ summary: 'Get company org nodes (flat list)' })
  @Get(':id/org-nodes')
  async getCompanyOrgNodes(@Param('id') id: TCompanyId) {
    const result = await this.queryBus.execute(new GetCompanyOrgNodesQuery(id));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_ORGNODES, result);
  }
}
