import { Inject, Injectable } from '@nestjs/common';
import {
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
import type { CreateCompanyUseCase, TCreateCompanyDTO } from './company/CreateCompanyUseCase.js';
import type { CreateTeamUseCase, TCreateTeamDTO } from './team/CreateTeamUseCase.js';
import type { AddTeamMemberUseCase, TAddTeamMemberDTO } from './team/AddTeamMemberUseCase.js';
import type { RemoveTeamMemberUseCase, TRemoveTeamMemberDTO } from './team/RemoveTeamMemberUseCase.js';
import type { GetTeamMembersUseCase, TGetTeamMembersDTO } from './team/GetTeamMembersUseCase.js';
import type { GetCompanyByOwnerUseCase } from './company/GetCompanyByOwnerUseCase.js';
import type { GetCompanyByIdUseCase } from './company/GetCompanyByIdUseCase.js';
import type { DeleteCompanyUseCase } from './company/DeleteCompanyUseCase.js';
import type { UpdateCompanyInfoUseCase, TUpdateCompanyInfoDTO } from './company/UpdateCompanyInfoUseCase.js';
import type { AddAdminUseCase, TAddAdminDTO } from './company/AddAdminUseCase.js';
import type { RemoveAdminUseCase, TRemoveAdminDTO } from './company/RemoveAdminUseCase.js';
import type { AddServiceUseCase, TAddServiceDTO } from './company/AddServiceUseCase.js';
import type { RemoveServiceUseCase, TRemoveServiceDTO } from './company/RemoveServiceUseCase.js';
import type { GetCompanyTeamsUseCase, TGetCompanyTeamsDTO } from './team/GetCompanyTeamsUseCase.js';
import type { GetMyCompaniesUseCase } from './company/GetMyCompaniesUseCase.js';
import type { GetServiceDetailUseCase } from './company/GetServiceDetailUseCase.js';
import type { UpdateServiceUseCase, TUpdateServiceDTO } from './company/UpdateServiceUseCase.js';
import type { GetCompanyOrgChartUseCase } from './company/GetCompanyOrgChartUseCase.js';
import type {
  TUserId,
  TCompanyId,
  TCompanyRecord,
  TCompanyCardViewModel,
  TTeamRecord,
  TCastMembershipEventRecord,
  TTeamMemberViewModel,
  TServiceDetailViewModel,
  TServiceId,
  TService,
  TCompanyOrgChartViewModel,
} from '@sh3pherd/shared-types';

export type TCompanyUseCases = {
  createCompany: (dto: TCreateCompanyDTO, actorId: TUserId) => Promise<TCompanyRecord>;
  getMyCompany: (actorId: TUserId) => Promise<TCompanyRecord | null>;
  getMyCompanies: (actorId: TUserId) => Promise<TCompanyCardViewModel[]>;
  getCompanyById: (id: TCompanyId, actorId: TUserId) => Promise<TCompanyRecord | null>;
  deleteCompany: (id: TCompanyId, actorId: TUserId) => Promise<void>;
  updateCompanyInfo: (dto: TUpdateCompanyInfoDTO, actorId: TUserId) => Promise<TCompanyRecord>;
  addAdmin: (dto: TAddAdminDTO, actorId: TUserId) => Promise<TCompanyRecord>;
  removeAdmin: (dto: TRemoveAdminDTO, actorId: TUserId) => Promise<TCompanyRecord>;
  addService: (dto: TAddServiceDTO, actorId: TUserId) => Promise<TCompanyRecord>;
  removeService: (dto: TRemoveServiceDTO, actorId: TUserId) => Promise<TCompanyRecord>;
  createTeam: (dto: TCreateTeamDTO, actorId: TUserId) => Promise<TTeamRecord>;
  getCompanyTeams: (dto: TGetCompanyTeamsDTO) => Promise<TTeamRecord[]>;
  addTeamMember: (dto: TAddTeamMemberDTO, actorId: TUserId) => Promise<TCastMembershipEventRecord>;
  removeTeamMember: (dto: TRemoveTeamMemberDTO, actorId: TUserId) => Promise<TCastMembershipEventRecord>;
  getTeamMembers: (dto: TGetTeamMembersDTO) => Promise<TTeamMemberViewModel[]>;
  getServiceDetail: (companyId: TCompanyId, serviceId: TServiceId) => Promise<TServiceDetailViewModel>;
  updateService: (dto: TUpdateServiceDTO) => Promise<TService>;
  getOrgChart: (companyId: TCompanyId) => Promise<TCompanyOrgChartViewModel>;
};

@Injectable()
export class CompanyUseCasesFactory {
  constructor(
    @Inject(CREATE_COMPANY_USE_CASE) private readonly createCompanyUC: CreateCompanyUseCase,
    @Inject(GET_COMPANY_BY_OWNER_USE_CASE) private readonly getCompanyByOwnerUC: GetCompanyByOwnerUseCase,
    @Inject(ADD_SERVICE_USE_CASE) private readonly addServiceUC: AddServiceUseCase,
    @Inject(REMOVE_SERVICE_USE_CASE) private readonly removeServiceUC: RemoveServiceUseCase,
    @Inject(CREATE_TEAM_USE_CASE) private readonly createTeamUC: CreateTeamUseCase,
    @Inject(GET_COMPANY_TEAMS_USE_CASE) private readonly getCompanyTeamsUC: GetCompanyTeamsUseCase,
    @Inject(ADD_TEAM_MEMBER_USE_CASE) private readonly addMemberUC: AddTeamMemberUseCase,
    @Inject(REMOVE_TEAM_MEMBER_USE_CASE) private readonly removeMemberUC: RemoveTeamMemberUseCase,
    @Inject(GET_TEAM_MEMBERS_USE_CASE) private readonly getMembersUC: GetTeamMembersUseCase,
    @Inject(GET_MY_COMPANIES_USE_CASE) private readonly getMyCompaniesUC: GetMyCompaniesUseCase,
    @Inject(GET_COMPANY_BY_ID_USE_CASE) private readonly getCompanyByIdUC: GetCompanyByIdUseCase,
    @Inject(DELETE_COMPANY_USE_CASE) private readonly deleteCompanyUC: DeleteCompanyUseCase,
    @Inject(UPDATE_COMPANY_INFO_USE_CASE) private readonly updateCompanyInfoUC: UpdateCompanyInfoUseCase,
    @Inject(ADD_ADMIN_USE_CASE) private readonly addAdminUC: AddAdminUseCase,
    @Inject(REMOVE_ADMIN_USE_CASE) private readonly removeAdminUC: RemoveAdminUseCase,
    @Inject(GET_SERVICE_DETAIL_USE_CASE) private readonly getServiceDetailUC: GetServiceDetailUseCase,
    @Inject(UPDATE_SERVICE_USE_CASE) private readonly updateServiceUC: UpdateServiceUseCase,
    @Inject(GET_COMPANY_ORGCHART_USE_CASE) private readonly getOrgChartUC: GetCompanyOrgChartUseCase,
  ) {}

  create(): TCompanyUseCases {
    return {
      createCompany: (dto, actorId) => this.createCompanyUC.execute(dto, actorId),
      getMyCompany: (actorId) => this.getCompanyByOwnerUC.execute(actorId),
      getMyCompanies: (actorId) => this.getMyCompaniesUC.execute(actorId),
      getCompanyById: (id, _actorId) => this.getCompanyByIdUC.execute(id),
      deleteCompany: (id, actorId) => this.deleteCompanyUC.execute(id, actorId),
      updateCompanyInfo: (dto, actorId) => this.updateCompanyInfoUC.execute(dto, actorId),
      addAdmin: (dto, actorId) => this.addAdminUC.execute(dto, actorId),
      removeAdmin: (dto, actorId) => this.removeAdminUC.execute(dto, actorId),
      addService: (dto, actorId) => this.addServiceUC.execute(dto, actorId),
      removeService: (dto, actorId) => this.removeServiceUC.execute(dto, actorId),
      createTeam: (dto, actorId) => this.createTeamUC.execute(dto, actorId),
      getCompanyTeams: (dto) => this.getCompanyTeamsUC.execute(dto),
      addTeamMember: (dto, actorId) => this.addMemberUC.execute(dto, actorId),
      removeTeamMember: (dto, actorId) => this.removeMemberUC.execute(dto, actorId),
      getTeamMembers: (dto) => this.getMembersUC.execute(dto),
      getServiceDetail: (companyId, serviceId) => this.getServiceDetailUC.execute(companyId, serviceId),
      updateService: (dto) => this.updateServiceUC.execute(dto),
      getOrgChart: (companyId) => this.getOrgChartUC.execute(companyId),
    };
  }
}
