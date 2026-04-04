import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { COMPANY_AGGREGATE_REPO, COMPANY_REPO, ORG_NODE_REPO } from './company.tokens.js';
import { CompanyAggregateRepository } from './repositories/CompanyAggregateRepository.js';
import type { ICompanyRepository } from './repositories/CompanyMongoRepository.js';
import type { IOrgNodeRepository } from './repositories/OrgNodeMongoRepository.js';

// Commands
import { CreateCompanyHandler } from './application/commands/CreateCompanyCommand.js';
import { UpdateCompanyInfoHandler } from './application/commands/UpdateCompanyInfoCommand.js';
import { UpdateOrgLayersHandler } from './application/commands/UpdateOrgLayersCommand.js';
import { DeleteCompanyHandler } from './application/commands/DeleteCompanyCommand.js';
import { CreateOrgNodeHandler } from './application/commands/CreateTeamCommand.js';
import { UpdateOrgNodeInfoHandler } from './application/commands/UpdateOrgNodeInfoCommand.js';
import { AddOrgNodeMemberHandler } from './application/commands/AddTeamMemberCommand.js';
import { RemoveOrgNodeMemberHandler } from './application/commands/RemoveTeamMemberCommand.js';
import { AddGuestMemberHandler, RemoveGuestMemberHandler } from './application/commands/GuestMemberCommands.js';
import { ArchiveOrgNodeHandler } from './application/commands/ArchiveOrgNodeCommand.js';

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
  UpdateOrgLayersHandler,
  DeleteCompanyHandler,
  CreateOrgNodeHandler,
  UpdateOrgNodeInfoHandler,
  AddOrgNodeMemberHandler,
  RemoveOrgNodeMemberHandler,
  AddGuestMemberHandler,
  RemoveGuestMemberHandler,
  ArchiveOrgNodeHandler,
];

const QueryHandlers = [
  GetCompanyByIdHandler,
  GetCompanyByOwnerHandler,
  GetMyCompaniesHandler,
  GetCompanyOrgNodesHandler,
  GetOrgNodeMembersHandler,
  GetCompanyOrgChartHandler,
];

const AggregateRepositories = [
  {
    provide: COMPANY_AGGREGATE_REPO,
    useFactory: (companyRepo: ICompanyRepository, orgNodeRepo: IOrgNodeRepository) =>
      new CompanyAggregateRepository(companyRepo, orgNodeRepo),
    inject: [COMPANY_REPO, ORG_NODE_REPO],
  },
];

@Module({
  imports: [CqrsModule, PermissionsModule],
  providers: [...CommandHandlers, ...QueryHandlers, ...AggregateRepositories],
  exports: [...CommandHandlers, ...QueryHandlers, ...AggregateRepositories],
})
export class CompanyHandlersModule {}
