import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Commands
import { CreateContractHandler } from './application/commands/CreateContractCommand.js';
import { UpdateContractHandler } from './application/commands/UpdateContractCommand.js';
import { AssignContractRoleHandler } from './application/commands/AssignContractRoleCommand.js';
import { RemoveContractRoleHandler } from './application/commands/RemoveContractRoleCommand.js';
import { UploadContractDocumentHandler } from './application/commands/UploadContractDocumentCommand.js';
import { PatchContractDocumentHandler } from './application/commands/PatchContractDocumentCommand.js';
import { SignContractHandler } from './application/commands/SignContractCommand.js';
import { SignContractDocumentHandler } from './application/commands/SignContractDocumentCommand.js';
import { CreateAddendumHandler } from './application/commands/CreateAddendumCommand.js';
import { SignAddendumHandler } from './application/commands/SignAddendumCommand.js';

// Queries
import { GetCurrentUserContractsHandler } from './application/queries/GetCurrentUserContractsQuery.js';
import { GetCompanyContractsHandler } from './application/queries/GetCompanyContractsQuery.js';
import { GetContractByIdHandler } from './application/queries/GetContractByIdQuery.js';
import { GetContractDocumentDownloadUrlHandler } from './application/queries/GetContractDocumentDownloadUrlQuery.js';
import { GetAddendaByContractHandler } from './application/queries/GetAddendaByContractQuery.js';

// Events
import { ContractSentHandler } from './application/events/ContractSentHandler.js';
import { ContractActivatedHandler } from './application/events/ContractActivatedHandler.js';

import { ContractStorageModule } from './infra/ContractStorageModule.js';

const CommandHandlers = [
  CreateContractHandler,
  UpdateContractHandler,
  AssignContractRoleHandler,
  RemoveContractRoleHandler,
  UploadContractDocumentHandler,
  PatchContractDocumentHandler,
  SignContractHandler,
  SignContractDocumentHandler,
  CreateAddendumHandler,
  SignAddendumHandler,
];

const QueryHandlers = [
  GetCurrentUserContractsHandler,
  GetCompanyContractsHandler,
  GetContractByIdHandler,
  GetContractDocumentDownloadUrlHandler,
  GetAddendaByContractHandler,
];

const EventHandlers = [ContractSentHandler, ContractActivatedHandler];

@Module({
  imports: [CqrsModule, ContractStorageModule],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class ContractHandlersModule {}
