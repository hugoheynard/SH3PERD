import { Body, Controller, Delete, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO } from '../../utils/response/buildApiResponseDTO.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { P } from '@sh3pherd/shared-types';
import type {
  TOrgNodeId,
  TCompanyId,
  TUserId,
  TOrgNodeDomainModel,
  TApiResponse,
} from '@sh3pherd/shared-types';
import type { TTeamType, TOrgNodeCommunication } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from './company.codes.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { OrgNodePayload } from '../dto/company.dto.js';
import { CreateOrgNodeCommand } from '../application/commands/CreateTeamCommand.js';
import { UpdateOrgNodeInfoCommand } from '../application/commands/UpdateOrgNodeInfoCommand.js';
import { ArchiveOrgNodeCommand } from '../application/commands/ArchiveOrgNodeCommand.js';
import { ReorderOrgNodesCommand } from '../application/commands/ReorderOrgNodesCommand.js';
import { GroupOrgNodesCommand } from '../application/commands/GroupOrgNodesCommand.js';
import { UngroupOrgNodeCommand } from '../application/commands/UngroupOrgNodeCommand.js';

@ApiTags('org-nodes / crud')
@ApiBearerAuth('bearer')
@ContractScoped()
@Controller('org-nodes')
export class OrgNodeCrudController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Create an org node' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.CREATE_ORGNODE, OrgNodePayload, 201))
  @RequirePermission(P.Company.OrgChart.Write)
  @Post()
  async createOrgNode(
    @Body()
    dto: {
      company_id: TCompanyId;
      name: string;
      parent_id?: TOrgNodeId;
      type?: TTeamType;
      color?: string;
    },
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TOrgNodeDomainModel>> {
    const result = await this.commandBus.execute<CreateOrgNodeCommand, TOrgNodeDomainModel>(
      new CreateOrgNodeCommand(dto, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.CREATE_ORGNODE, result);
  }

  // ⚠️ reorder MUST be before :nodeId to avoid NestJS matching "reorder" as a nodeId param
  @ApiOperation({ summary: 'Reorder org nodes within a parent' })
  @ApiResponse({ status: 200, description: 'Nodes reordered.' })
  @RequirePermission(P.Company.OrgChart.Write)
  @Patch('reorder')
  async reorderOrgNodes(
    @Body() body: { companyId: TCompanyId; parentId?: TOrgNodeId; orderedIds: TOrgNodeId[] },
  ) {
    await this.commandBus.execute(
      new ReorderOrgNodesCommand(body.companyId, body.parentId, body.orderedIds),
    );
    return { ok: true };
  }

  @ApiOperation({ summary: 'Group sibling nodes under a new parent' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.CREATE_ORGNODE, OrgNodePayload, 201))
  @RequirePermission(P.Company.OrgChart.Write)
  @Post('group')
  async groupOrgNodes(
    @Body() body: { companyId: TCompanyId; parentName: string; nodeIds: TOrgNodeId[] },
  ): Promise<TApiResponse<any>> {
    const result = await this.commandBus.execute(
      new GroupOrgNodesCommand(body.companyId, body.parentName, body.nodeIds),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.CREATE_ORGNODE, result);
  }

  @ApiOperation({ summary: 'Ungroup — move children up and archive the node' })
  @ApiResponse({ status: 200, description: 'Node ungrouped.' })
  @RequirePermission(P.Company.OrgChart.Write)
  @Post('ungroup')
  async ungroupOrgNode(@Body() body: { companyId: TCompanyId; nodeId: TOrgNodeId }) {
    await this.commandBus.execute(new UngroupOrgNodeCommand(body.companyId, body.nodeId));
    return { ok: true };
  }

  @ApiOperation({ summary: 'Update an org node' })
  @ApiParam({ name: 'nodeId', description: 'Org node ID' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.UPDATE_ORGNODE, OrgNodePayload))
  @RequirePermission(P.Company.OrgChart.Write)
  @Patch(':nodeId')
  async updateOrgNode(
    @Param('nodeId') nodeId: TOrgNodeId,
    @Body()
    body: {
      name?: string;
      color?: string;
      type?: TTeamType;
      communications?: TOrgNodeCommunication[];
    },
    @ActorId() actorId: TUserId,
  ) {
    const result = await this.commandBus.execute(
      new UpdateOrgNodeInfoCommand({ org_node_id: nodeId, ...body }, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.UPDATE_ORGNODE, result);
  }

  @ApiOperation({ summary: 'Archive an org node' })
  @ApiParam({ name: 'nodeId', description: 'Org node ID' })
  @ApiResponse({ status: 204, description: 'Node archived.' })
  @RequirePermission(P.Company.OrgChart.Write)
  @HttpCode(204)
  @Delete(':nodeId')
  async archiveOrgNode(@Param('nodeId') nodeId: TOrgNodeId, @ActorId() actorId: TUserId) {
    await this.commandBus.execute(new ArchiveOrgNodeCommand(nodeId, actorId));
  }
}
