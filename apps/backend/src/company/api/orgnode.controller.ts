import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import type { TOrgNodeId, TCompanyId, TUserId } from '@sh3pherd/shared-types';
import type { TTeamType, TTeamRole, TOrgNodeCommunication } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from './company.codes.js';

import { CreateOrgNodeCommand } from '../application/commands/CreateTeamCommand.js';
import { UpdateOrgNodeInfoCommand } from '../application/commands/UpdateOrgNodeInfoCommand.js';
import { ArchiveOrgNodeCommand } from '../application/commands/ArchiveOrgNodeCommand.js';
import { AddOrgNodeMemberCommand } from '../application/commands/AddTeamMemberCommand.js';
import { RemoveOrgNodeMemberCommand } from '../application/commands/RemoveTeamMemberCommand.js';
import { AddGuestMemberCommand, RemoveGuestMemberCommand } from '../application/commands/GuestMemberCommands.js';
import { GetOrgNodeMembersQuery } from '../application/queries/GetTeamMembersQuery.js';

@ApiTags('org-nodes')
@ApiBearerAuth('bearer')
@Controller('org-nodes')
export class OrgNodeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ── Node CRUD ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create an org node' })
  @Post()
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
  @Patch(':nodeId')
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
  @Delete(':nodeId')
  async archiveOrgNode(
    @Param('nodeId') nodeId: TOrgNodeId,
    @ActorId() actorId: TUserId,
  ) {
    await this.commandBus.execute(new ArchiveOrgNodeCommand(nodeId, actorId));
  }

  // ── Members ──────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get org node members' })
  @Get(':nodeId/members')
  async getOrgNodeMembers(@Param('nodeId') nodeId: TOrgNodeId) {
    const result = await this.queryBus.execute(new GetOrgNodeMembersQuery(nodeId));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_ORGNODE_MEMBERS, result);
  }

  @ApiOperation({ summary: 'Get org node members at date' })
  @Get(':nodeId/members/at/:date')
  async getOrgNodeMembersAt(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Param('date') date: string,
  ) {
    const result = await this.queryBus.execute(new GetOrgNodeMembersQuery(nodeId, new Date(date)));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_ORGNODE_MEMBERS, result);
  }

  @ApiOperation({ summary: 'Add member to org node' })
  @Post(':nodeId/members')
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
  @Delete(':nodeId/members/:userId')
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

  @ApiOperation({ summary: 'Add a guest member to an org node' })
  @Post(':nodeId/guests')
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
  @Delete(':nodeId/guests/:guestId')
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
