import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type {
  TCompanyId,
  TContractId,
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

@Controller()
export class ContractController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  getCurrentUserContractList(@ActorId() actorId: TUserId) {
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
