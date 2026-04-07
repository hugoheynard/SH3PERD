import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  TCompanyId,
  TContractId,
  TContractDomainModel,
  TCreateContractRequestDTO,
  TUpdateContractDTO,
} from '@sh3pherd/shared-types';
import type { TContractRole } from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import type { TUserId } from '@sh3pherd/shared-types';

// Commands
import { CreateContractCommand } from '../application/commands/CreateContractCommand.js';
import { UpdateContractCommand } from '../application/commands/UpdateContractCommand.js';
import { AssignContractRoleCommand } from '../application/commands/AssignContractRoleCommand.js';
import { RemoveContractRoleCommand } from '../application/commands/RemoveContractRoleCommand.js';

// Queries
import { GetCurrentUserContractsQuery } from '../application/queries/GetCurrentUserContractsQuery.js';
import { GetCompanyContractsQuery } from '../application/queries/GetCompanyContractsQuery.js';
import { GetContractByIdQuery } from '../application/queries/GetContractByIdQuery.js';

@ApiTags('contracts')
@ApiBearerAuth('bearer')
@Controller()
export class ContractController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Returns all contracts belonging to the authenticated user.
   * Each contract is reconstituted through ContractEntity for domain integrity.
   */
  @ApiOperation({
    summary: 'Get current user contracts',
    description: 'Returns all contracts where the authenticated user is the employee/contractor. Each record is hydrated through the domain entity.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of contract domain models for the current user.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id:            { type: 'string', example: 'contract_abc-123' },
          user_id:       { type: 'string', example: 'user_xyz-456' },
          company_id:    { type: 'string', example: 'company_def-789' },
          roles:         { type: 'array', items: { type: 'string' }, example: ['artist'] },
          status:        { type: 'string', enum: ['draft', 'active', 'terminated'], example: 'active' },
          contract_type: { type: 'string', enum: ['CDI', 'CDD', 'freelance', 'stage', 'alternance'], example: 'CDI' },
          job_title:     { type: 'string', example: 'Sound Engineer' },
          startDate:     { type: 'string', format: 'date-time' },
          endDate:       { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @Get('me')
  getCurrentUserContractList(@ActorId() actorId: TUserId): Promise<TContractDomainModel[]> {
    return this.queryBus.execute(new GetCurrentUserContractsQuery(actorId));
  }

  @Get('company/:companyId')
  getCompanyContracts(@Param('companyId') companyId: TCompanyId) {
    return this.queryBus.execute(new GetCompanyContractsQuery(companyId));
  }

  @Get(':contractId')
  getContractById(@Param('contractId') contractId: TContractId) {
    return this.queryBus.execute(new GetContractByIdQuery(contractId));
  }

  @Patch(':contractId')
  updateContract(
    @Param('contractId') contractId: TContractId,
    @Body() dto: Omit<TUpdateContractDTO, 'contract_id'>,
  ) {
    return this.commandBus.execute(new UpdateContractCommand({ ...dto, contract_id: contractId }));
  }

  @Post()
  createContract(
    @Body() dto: TCreateContractRequestDTO,
    @ActorId() actorId: TUserId,
  ) {
    return this.commandBus.execute(new CreateContractCommand(dto, actorId));
  }





  // ── Role management ──────────────────────────────────────

  @Post(':contractId/roles')
  assignRole(
    @Param('contractId') contractId: TContractId,
    @Body() body: { role: TContractRole },
    @ActorId() actorId: TUserId,
  ) {
    return this.commandBus.execute(new AssignContractRoleCommand(contractId, body.role, actorId));
  }

  @Delete(':contractId/roles/:role')
  removeRole(
    @Param('contractId') contractId: TContractId,
    @Param('role') role: TContractRole,
    @ActorId() actorId: TUserId,
  ) {
    return this.commandBus.execute(new RemoveContractRoleCommand(contractId, role, actorId));
  }
}
