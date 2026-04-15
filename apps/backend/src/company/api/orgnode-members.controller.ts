import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO } from '../../utils/response/buildApiResponseDTO.js';
import { P } from '@sh3pherd/shared-types';
import type {
  TApiResponse,
  TContractId,
  TOrgNodeGuestMember,
  TOrgNodeId,
  TOrgNodeMember,
  TOrgMembershipEventRecord,
  TUserId,
} from '@sh3pherd/shared-types';
import type { TTeamRole } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from './company.codes.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { AddOrgNodeMemberCommand } from '../application/commands/AddTeamMemberCommand.js';
import { RemoveOrgNodeMemberCommand } from '../application/commands/RemoveTeamMemberCommand.js';
import {
  AddGuestMemberCommand,
  RemoveGuestMemberCommand,
} from '../application/commands/GuestMemberCommands.js';
import { GetOrgNodeMembersQuery } from '../application/queries/GetTeamMembersQuery.js';

@ApiTags('org-nodes / members')
@ApiBearerAuth('bearer')
@ContractScoped()
@Controller('org-nodes')
export class OrgNodeMembersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ── Members ──────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get org node members' })
  @ApiParam({ name: 'nodeId', description: 'Org node ID' })
  @ApiResponse({ status: 200, description: 'List of node members.' })
  @RequirePermission(P.Company.OrgChart.Read)
  @Get(':nodeId/members')
  async getOrgNodeMembers(
    @Param('nodeId') nodeId: TOrgNodeId,
  ): Promise<TApiResponse<TOrgNodeMember[]>> {
    const result = await this.queryBus.execute<GetOrgNodeMembersQuery, TOrgNodeMember[]>(
      new GetOrgNodeMembersQuery(nodeId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_ORGNODE_MEMBERS, result);
  }

  @ApiOperation({ summary: 'Get org node members at date' })
  @ApiParam({ name: 'nodeId', description: 'Org node ID' })
  @ApiParam({ name: 'date', description: 'ISO date string', example: '2025-01-15' })
  @ApiResponse({ status: 200, description: 'List of node members at given date.' })
  @RequirePermission(P.Company.OrgChart.Read)
  @Get(':nodeId/members/at/:date')
  async getOrgNodeMembersAt(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Param('date') date: string,
  ): Promise<TApiResponse<TOrgNodeMember[]>> {
    const result = await this.queryBus.execute<GetOrgNodeMembersQuery, TOrgNodeMember[]>(
      new GetOrgNodeMembersQuery(nodeId, new Date(date)),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_ORGNODE_MEMBERS, result);
  }

  @ApiOperation({ summary: 'Add member to org node' })
  @ApiParam({ name: 'nodeId', description: 'Org node ID' })
  @ApiResponse({ status: 201, description: 'Member added.' })
  @RequirePermission(P.Company.OrgChart.Write)
  @Post(':nodeId/members')
  async addOrgNodeMember(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Body()
    body: { user_id: TUserId; contract_id: TContractId; team_role?: TTeamRole; job_title?: string },
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TOrgMembershipEventRecord>> {
    const result = await this.commandBus.execute<
      AddOrgNodeMemberCommand,
      TOrgMembershipEventRecord
    >(
      new AddOrgNodeMemberCommand(
        {
          org_node_id: nodeId,
          user_id: body.user_id,
          contract_id: body.contract_id,
          team_role: body.team_role,
          job_title: body.job_title,
        },
        actorId,
      ),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.ADD_ORGNODE_MEMBER, result);
  }

  @ApiOperation({ summary: 'Remove member from org node' })
  @ApiParam({ name: 'nodeId', description: 'Org node ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove' })
  @ApiResponse({ status: 200, description: 'Member removed.' })
  @RequirePermission(P.Company.OrgChart.Write)
  @Delete(':nodeId/members/:userId')
  async removeOrgNodeMember(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Param('userId') userId: TUserId,
    @Body() body: { reason?: string },
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TOrgMembershipEventRecord>> {
    const result = await this.commandBus.execute<
      RemoveOrgNodeMemberCommand,
      TOrgMembershipEventRecord
    >(
      new RemoveOrgNodeMemberCommand(
        { org_node_id: nodeId, user_id: userId, reason: body?.reason },
        actorId,
      ),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.REMOVE_ORGNODE_MEMBER, result);
  }

  // ── Guest Members ────────────────────────────────────────────

  @ApiOperation({ summary: 'Add a guest member to an org node' })
  @ApiParam({ name: 'nodeId', description: 'Org node ID' })
  @ApiResponse({ status: 201, description: 'Guest added.' })
  @RequirePermission(P.Company.OrgChart.Write)
  @Post(':nodeId/guests')
  async addGuestMember(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Body() body: { display_name: string; title?: string; team_role: TTeamRole },
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TOrgNodeGuestMember>> {
    const result = await this.commandBus.execute<AddGuestMemberCommand, TOrgNodeGuestMember>(
      new AddGuestMemberCommand({ org_node_id: nodeId, ...body }, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.ADD_GUEST_MEMBER, result);
  }

  @ApiOperation({ summary: 'Remove a guest member from an org node' })
  @ApiParam({ name: 'nodeId', description: 'Org node ID' })
  @ApiParam({ name: 'guestId', description: 'Guest member ID' })
  @ApiResponse({ status: 200, description: 'Guest removed.' })
  @RequirePermission(P.Company.OrgChart.Write)
  @Delete(':nodeId/guests/:guestId')
  async removeGuestMember(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Param('guestId') guestId: string,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<boolean>> {
    const result = await this.commandBus.execute<RemoveGuestMemberCommand, boolean>(
      new RemoveGuestMemberCommand({ org_node_id: nodeId, guest_id: guestId }, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.REMOVE_GUEST_MEMBER, result);
  }
}
