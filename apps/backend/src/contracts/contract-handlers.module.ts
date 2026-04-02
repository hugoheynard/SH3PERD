import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Commands
import { CreateContractHandler } from './application/commands/CreateContractCommand.js';
import { UpdateContractHandler } from './application/commands/UpdateContractCommand.js';
import { AssignContractRoleHandler } from './application/commands/AssignContractRoleCommand.js';
import { RemoveContractRoleHandler } from './application/commands/RemoveContractRoleCommand.js';

// Queries
import { GetCurrentUserContractsHandler } from './application/queries/GetCurrentUserContractsQuery.js';
import { GetCompanyContractsHandler } from './application/queries/GetCompanyContractsQuery.js';
import { GetContractByIdHandler } from './application/queries/GetContractByIdQuery.js';

const CommandHandlers = [
  CreateContractHandler,
  UpdateContractHandler,
  AssignContractRoleHandler,
  RemoveContractRoleHandler,
];

const QueryHandlers = [
  GetCurrentUserContractsHandler,
  GetCompanyContractsHandler,
  GetContractByIdHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class ContractHandlersModule {}
