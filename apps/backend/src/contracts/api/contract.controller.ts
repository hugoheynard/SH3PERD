import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { P } from '@sh3pherd/shared-types';
import type {
  TCompanyContractViewModel,
  TCompanyId,
  TContractDetailViewModel,
  TContractId,
  TContractRecord,
  TCreateContractRequestDTO,
  TUpdateContractDTO,
} from '@sh3pherd/shared-types';
import type { TContractRole } from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import type { TUserId } from '@sh3pherd/shared-types';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';

// Commands
import { CreateContractCommand } from '../application/commands/CreateContractCommand.js';
import { UpdateContractCommand } from '../application/commands/UpdateContractCommand.js';
import { AssignContractRoleCommand } from '../application/commands/AssignContractRoleCommand.js';
import { RemoveContractRoleCommand } from '../application/commands/RemoveContractRoleCommand.js';

// Queries
import { GetCompanyContractsQuery } from '../application/queries/GetCompanyContractsQuery.js';
import { GetContractByIdQuery } from '../application/queries/GetContractByIdQuery.js';

/**
 * `@ContractScoped()` lives on the class — not on each method — so that
 * `ContractContextGuard` runs before `PermissionGuard` and populates
 * `req.contract_roles`. Stacking both at method level inverts the guard
 * order and yields a guaranteed 403 (see
 * `orgchart-export.controller.ts`). The unscoped `/me` endpoint lives
 * on `MyContractsController`.
 */
@ApiTags('contracts')
@ApiBearerAuth('bearer')
@ContractScoped()
@Controller()
export class ContractController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @RequirePermission(P.Company.Members.Read)
  @Get('company/:companyId')
  getCompanyContracts(
    @Param('companyId') companyId: TCompanyId,
  ): Promise<TCompanyContractViewModel[]> {
    return this.queryBus.execute<GetCompanyContractsQuery, TCompanyContractViewModel[]>(
      new GetCompanyContractsQuery(companyId),
    );
  }

  @RequirePermission(P.Company.Members.Read)
  @Get(':contractId')
  getContractById(@Param('contractId') contractId: TContractId): Promise<TContractDetailViewModel> {
    return this.queryBus.execute<GetContractByIdQuery, TContractDetailViewModel>(
      new GetContractByIdQuery(contractId),
    );
  }

  @RequirePermission(P.Company.Members.Write)
  @Patch(':contractId')
  updateContract(
    @Param('contractId') contractId: TContractId,
    @Body() dto: Omit<TUpdateContractDTO, 'contract_id'>,
  ): Promise<TContractRecord> {
    return this.commandBus.execute<UpdateContractCommand, TContractRecord>(
      new UpdateContractCommand({ ...dto, contract_id: contractId }),
    );
  }

  @RequirePermission(P.Company.Members.Invite)
  @Post()
  createContract(
    @Body() dto: TCreateContractRequestDTO,
    @ActorId() actorId: TUserId,
  ): Promise<TContractRecord> {
    return this.commandBus.execute<CreateContractCommand, TContractRecord>(
      new CreateContractCommand(dto, actorId),
    );
  }

  // ── Role management ──────────────────────────────────────

  @RequirePermission(P.Company.Members.Write)
  @Post(':contractId/roles')
  assignRole(
    @Param('contractId') contractId: TContractId,
    @Body() body: { role: TContractRole },
    @ActorId() actorId: TUserId,
  ): Promise<TContractRecord> {
    return this.commandBus.execute<AssignContractRoleCommand, TContractRecord>(
      new AssignContractRoleCommand(contractId, body.role, actorId),
    );
  }

  @RequirePermission(P.Company.Members.Write)
  @Delete(':contractId/roles/:role')
  removeRole(
    @Param('contractId') contractId: TContractId,
    @Param('role') role: TContractRole,
    @ActorId() actorId: TUserId,
  ): Promise<TContractRecord> {
    return this.commandBus.execute<RemoveContractRoleCommand, TContractRecord>(
      new RemoveContractRoleCommand(contractId, role, actorId),
    );
  }
}
