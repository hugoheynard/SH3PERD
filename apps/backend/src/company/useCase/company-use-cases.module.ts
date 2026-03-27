import { Module } from '@nestjs/common';
import {
  COMPANY_USE_CASES,
  COMPANY_USE_CASES_FACTORY,
  CREATE_COMPANY_USE_CASE,
  CREATE_TEAM_USE_CASE,
  ADD_TEAM_MEMBER_USE_CASE,
  REMOVE_TEAM_MEMBER_USE_CASE,
  GET_TEAM_MEMBERS_USE_CASE,
  GET_COMPANY_BY_OWNER_USE_CASE,
  GET_COMPANY_BY_ID_USE_CASE,
  DELETE_COMPANY_USE_CASE,
  UPDATE_COMPANY_INFO_USE_CASE,
  ADD_ADMIN_USE_CASE,
  REMOVE_ADMIN_USE_CASE,
  ADD_SERVICE_USE_CASE,
  REMOVE_SERVICE_USE_CASE,
  GET_COMPANY_TEAMS_USE_CASE,
  GET_MY_COMPANIES_USE_CASE,
  GET_SERVICE_DETAIL_USE_CASE,
  UPDATE_SERVICE_USE_CASE,
  GET_COMPANY_ORGCHART_USE_CASE,
} from '../company.tokens.js';
import { CompanyUseCasesFactory } from './CompanyUseCasesFactory.js';
import { CreateCompanyUseCase } from './company/CreateCompanyUseCase.js';
import { GetCompanyByOwnerUseCase } from './company/GetCompanyByOwnerUseCase.js';
import { AddServiceUseCase } from './company/AddServiceUseCase.js';
import { RemoveServiceUseCase } from './company/RemoveServiceUseCase.js';
import { CreateTeamUseCase } from './team/CreateTeamUseCase.js';
import { GetCompanyTeamsUseCase } from './team/GetCompanyTeamsUseCase.js';
import { AddTeamMemberUseCase } from './team/AddTeamMemberUseCase.js';
import { RemoveTeamMemberUseCase } from './team/RemoveTeamMemberUseCase.js';
import { GetTeamMembersUseCase } from './team/GetTeamMembersUseCase.js';
import { GetMyCompaniesUseCase } from './company/GetMyCompaniesUseCase.js';
import { GetCompanyByIdUseCase } from './company/GetCompanyByIdUseCase.js';
import { DeleteCompanyUseCase } from './company/DeleteCompanyUseCase.js';
import { UpdateCompanyInfoUseCase } from './company/UpdateCompanyInfoUseCase.js';
import { AddAdminUseCase } from './company/AddAdminUseCase.js';
import { RemoveAdminUseCase } from './company/RemoveAdminUseCase.js';
import { GetServiceDetailUseCase } from './company/GetServiceDetailUseCase.js';
import { UpdateServiceUseCase } from './company/UpdateServiceUseCase.js';
import { GetCompanyOrgChartUseCase } from './company/GetCompanyOrgChartUseCase.js';

@Module({
  providers: [
    { provide: COMPANY_USE_CASES_FACTORY, useClass: CompanyUseCasesFactory },
    {
      provide: COMPANY_USE_CASES,
      useFactory: (factory: CompanyUseCasesFactory) => factory.create(),
      inject: [COMPANY_USE_CASES_FACTORY],
    },
    { provide: CREATE_COMPANY_USE_CASE,       useClass: CreateCompanyUseCase       },
    { provide: GET_COMPANY_BY_OWNER_USE_CASE, useClass: GetCompanyByOwnerUseCase   },
    { provide: ADD_SERVICE_USE_CASE,          useClass: AddServiceUseCase          },
    { provide: REMOVE_SERVICE_USE_CASE,       useClass: RemoveServiceUseCase       },
    { provide: CREATE_TEAM_USE_CASE,          useClass: CreateTeamUseCase          },
    { provide: GET_COMPANY_TEAMS_USE_CASE,    useClass: GetCompanyTeamsUseCase     },
    { provide: ADD_TEAM_MEMBER_USE_CASE,      useClass: AddTeamMemberUseCase       },
    { provide: REMOVE_TEAM_MEMBER_USE_CASE,   useClass: RemoveTeamMemberUseCase    },
    { provide: GET_TEAM_MEMBERS_USE_CASE,     useClass: GetTeamMembersUseCase      },
    { provide: GET_MY_COMPANIES_USE_CASE,     useClass: GetMyCompaniesUseCase      },
    { provide: GET_COMPANY_BY_ID_USE_CASE,   useClass: GetCompanyByIdUseCase      },
    { provide: DELETE_COMPANY_USE_CASE,      useClass: DeleteCompanyUseCase       },
    { provide: UPDATE_COMPANY_INFO_USE_CASE, useClass: UpdateCompanyInfoUseCase   },
    { provide: ADD_ADMIN_USE_CASE,           useClass: AddAdminUseCase            },
    { provide: REMOVE_ADMIN_USE_CASE,        useClass: RemoveAdminUseCase         },
    { provide: GET_SERVICE_DETAIL_USE_CASE,  useClass: GetServiceDetailUseCase    },
    { provide: UPDATE_SERVICE_USE_CASE,       useClass: UpdateServiceUseCase          },
    { provide: GET_COMPANY_ORGCHART_USE_CASE, useClass: GetCompanyOrgChartUseCase     },
  ],
  exports: [COMPANY_USE_CASES],
})
export class CompanyUseCasesModule {}
