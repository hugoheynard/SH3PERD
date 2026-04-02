import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PermissionsModule } from '../permissions/permissions.module.js';

// Commands
import { CreateCompanyHandler } from './application/commands/CreateCompanyCommand.js';
import { UpdateCompanyInfoHandler } from './application/commands/UpdateCompanyInfoCommand.js';
import { DeleteCompanyHandler } from './application/commands/DeleteCompanyCommand.js';
import { CreateOrgNodeHandler } from './application/commands/CreateTeamCommand.js';
import { UpdateOrgNodeInfoHandler } from './application/commands/UpdateOrgNodeInfoCommand.js';
import { AddOrgNodeMemberHandler } from './application/commands/AddTeamMemberCommand.js';
import { RemoveOrgNodeMemberHandler } from './application/commands/RemoveTeamMemberCommand.js';
import { AddGuestMemberHandler, RemoveGuestMemberHandler } from './application/commands/GuestMemberCommands.js';

// Queries
import { GetCompanyByIdHandler } from './application/queries/GetCompanyByIdQuery.js';
import { GetCompanyByOwnerHandler } from './application/queries/GetCompanyByOwnerQuery.js';
import { GetMyCompaniesHandler } from './application/queries/GetMyCompaniesQuery.js';
import { GetCompanyOrgNodesHandler } from './application/queries/GetCompanyTeamsQuery.js';
import { GetOrgNodeMembersHandler } from './application/queries/GetTeamMembersQuery.js';
import { GetCompanyOrgChartHandler } from './application/queries/GetCompanyOrgChartQuery.js';

const CommandHandlers = [
  CreateCompanyHandler,
  UpdateCompanyInfoHandler,
  DeleteCompanyHandler,
  CreateOrgNodeHandler,
  UpdateOrgNodeInfoHandler,
  AddOrgNodeMemberHandler,
  RemoveOrgNodeMemberHandler,
  AddGuestMemberHandler,
  RemoveGuestMemberHandler,
];

const QueryHandlers = [
  GetCompanyByIdHandler,
  GetCompanyByOwnerHandler,
  GetMyCompaniesHandler,
  GetCompanyOrgNodesHandler,
  GetOrgNodeMembersHandler,
  GetCompanyOrgChartHandler,
];

@Module({
  imports: [CqrsModule, PermissionsModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class CompanyHandlersModule {}
