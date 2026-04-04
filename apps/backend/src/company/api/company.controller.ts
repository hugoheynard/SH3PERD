import { Body, Controller, Delete, Get, HttpCode, Param, Post, Patch } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import type { TOrgNodeId, TCompanyId, TUserId } from '@sh3pherd/shared-types';
import type { TTeamType, TTeamRole, TOrgNodeCommunication } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from './company.codes.js';

// Commands
import { CreateCompanyCommand } from '../application/commands/CreateCompanyCommand.js';
import { DeleteCompanyCommand } from '../application/commands/DeleteCompanyCommand.js';
import { CreateOrgNodeCommand } from '../application/commands/CreateTeamCommand.js';
import { UpdateOrgNodeInfoCommand } from '../application/commands/UpdateOrgNodeInfoCommand.js';
import { AddOrgNodeMemberCommand } from '../application/commands/AddTeamMemberCommand.js';
import { RemoveOrgNodeMemberCommand } from '../application/commands/RemoveTeamMemberCommand.js';
import { AddGuestMemberCommand, RemoveGuestMemberCommand } from '../application/commands/GuestMemberCommands.js';
import { ArchiveOrgNodeCommand } from '../application/commands/ArchiveOrgNodeCommand.js';

// Queries
import { GetCompanyByIdQuery } from '../application/queries/GetCompanyByIdQuery.js';
import { GetCompanyByOwnerQuery } from '../application/queries/GetCompanyByOwnerQuery.js';
import { GetMyCompaniesQuery } from '../application/queries/GetMyCompaniesQuery.js';
import { GetCompanyOrgNodesQuery } from '../application/queries/GetCompanyTeamsQuery.js';
import { GetOrgNodeMembersQuery } from '../application/queries/GetTeamMembersQuery.js';
import { GetCompanyOrgChartQuery } from '../application/queries/GetCompanyOrgChartQuery.js';

@ApiTags('companies')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'Authentication required. Missing or invalid Bearer token.',
})
@Controller()
export class CompanyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ── Company CRUD ─────────────────────────────────────────────

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

  // ── Org Chart ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get company org chart (hierarchy tree)' })
  @Get(':id/orgchart')
  async getOrgChart(@Param('id') id: TCompanyId) {
    const result = await this.queryBus.execute(new GetCompanyOrgChartQuery(id));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_ORGCHART, result);
  }

  // ── Org Nodes ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create an org node' })
  @Post('org-nodes')
  async createOrgNode(
    @Body() dto: {
      company_id: TCompanyId;
      name: string;
      parent_id?: TOrgNodeId;
      type?: TTeamType;
      color?: string;
    },
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.commandBus.execute(new CreateOrgNodeCommand(dto, actorId));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.CREATE_ORGNODE, result);
  }

  @ApiOperation({ summary: 'Update an org node' })
  @Patch('org-nodes/:nodeId')
  async updateOrgNode(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Body() body: { name?: string; color?: string; type?: TTeamType; communications?: TOrgNodeCommunication[] },
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.commandBus.execute(
      new UpdateOrgNodeInfoCommand({ org_node_id: nodeId, ...body }, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.UPDATE_ORGNODE, result);
  }

  @ApiOperation({ summary: 'Archive an org node' })
  @HttpCode(204)
  @Delete('org-nodes/:nodeId')
  async archiveOrgNode(
    @Param('nodeId') nodeId: TOrgNodeId,
    @ActorId() actorId: TUserId,
  ) {
    await this.commandBus.execute(new ArchiveOrgNodeCommand(nodeId, actorId));
  }

  @ApiOperation({ summary: 'Get company org nodes (flat list)' })
  @Get(':companyId/org-nodes')
  async getCompanyOrgNodes(@Param('companyId') companyId: TCompanyId) {
    const result = await this.queryBus.execute(new GetCompanyOrgNodesQuery(companyId));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_ORGNODES, result);
  }

  @ApiOperation({ summary: 'Get org node members' })
  @Get('org-nodes/:nodeId/members')
  async getOrgNodeMembers(@Param('nodeId') nodeId: TOrgNodeId) {
    const result = await this.queryBus.execute(new GetOrgNodeMembersQuery(nodeId));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_ORGNODE_MEMBERS, result);
  }

  @ApiOperation({ summary: 'Get org node members at date' })
  @Get('org-nodes/:nodeId/members/at/:date')
  async getOrgNodeMembersAt(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Param('date') date: string,
  ) {
    const result = await this.queryBus.execute(new GetOrgNodeMembersQuery(nodeId, new Date(date)));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_ORGNODE_MEMBERS, result);
  }

  @ApiOperation({ summary: 'Add member to org node' })
  @Post('org-nodes/:nodeId/members')
  async addOrgNodeMember(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Body() body: { user_id: TUserId; contract_id: string; team_role?: TTeamRole },
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.commandBus.execute(
      new AddOrgNodeMemberCommand(
        { org_node_id: nodeId, user_id: body.user_id, contract_id: body.contract_id as any, team_role: body.team_role },
        actorId,
      ),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.ADD_ORGNODE_MEMBER, result);
  }

  @ApiOperation({ summary: 'Remove member from org node' })
  @Delete('org-nodes/:nodeId/members/:userId')
  async removeOrgNodeMember(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Param('userId') userId: string,
    @Body() body: { reason?: string },
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.commandBus.execute(
      new RemoveOrgNodeMemberCommand(
        { org_node_id: nodeId, user_id: userId as TUserId, reason: body?.reason },
        actorId,
      ),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.REMOVE_ORGNODE_MEMBER, result);
  }

  // ── Guest Members ────────────────────────────────────────────

  @ApiOperation({ summary: 'Add a guest (display-only) member to an org node' })
  @Post('org-nodes/:nodeId/guests')
  async addGuestMember(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Body() body: { display_name: string; title?: string; team_role: TTeamRole },
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.commandBus.execute(
      new AddGuestMemberCommand({ org_node_id: nodeId, ...body }, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.ADD_GUEST_MEMBER, result);
  }

  @ApiOperation({ summary: 'Remove a guest member from an org node' })
  @Delete('org-nodes/:nodeId/guests/:guestId')
  async removeGuestMember(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Param('guestId') guestId: string,
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.commandBus.execute(
      new RemoveGuestMemberCommand({ org_node_id: nodeId, guest_id: guestId }, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.REMOVE_GUEST_MEMBER, result);
  }
}
