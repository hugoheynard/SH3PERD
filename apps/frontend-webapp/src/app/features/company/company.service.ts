import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import type { Observable } from 'rxjs';
import type {
  TApiResponse,
  TCompanyAddress,
  TCompanyContractViewModel,
  TCompanyDetailViewModel,
  TCompanyViewModel,
  TCompanyCardViewModel,
  TCompanyId,
  TCompanyAdminRole,
  TCompanyOrgChartViewModel,
  TServiceCommunication,
  TContractStatus,
  TContractDetailViewModel,
  TContractId,
  TTeamRecord,
  TService,
  TServiceId,
  TServiceDetailViewModel,
  TUserId,
  TUserSearchResult,
} from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root',
})
export class CompanyService extends BaseHttpService {

  createCompany(name: string): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.post<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').build(),
      { name }
    );
  }

  getMyCompany(): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.get<TApiResponse<TCompanyDetailViewModel>>(
      `${this.UrlBuilder.apiProtectedRoute('companies').route('me').build()}`
    );
  }

  getMyCompanies(): Observable<TApiResponse<TCompanyCardViewModel[]>> {
    return this.http.get<TApiResponse<TCompanyCardViewModel[]>>(
      this.UrlBuilder.apiProtectedRoute('companies').route('my-companies').build()
    );
  }

  getCompanyById(id: TCompanyId): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.get<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(id).build()
    );
  }

  updateCompanyInfo(id: TCompanyId, dto: { name?: string; description?: string; address?: TCompanyAddress }): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.patch<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(id).build(),
      dto
    );
  }

  addAdmin(id: TCompanyId, userId: TUserId, role: TCompanyAdminRole): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.post<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${id}/admins`).build(),
      { user_id: userId, role }
    );
  }

  removeAdmin(id: TCompanyId, userId: TUserId): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.delete<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${id}/admins/${userId}`).build()
    );
  }

  // ── Contracts ───────────────────────────────────────────────

  getCompanyContracts(companyId: TCompanyId): Observable<TCompanyContractViewModel[]> {
    return this.http.get<TCompanyContractViewModel[]>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(`company/${companyId}`).build()
    );
  }

  searchUserByEmail(email: string): Observable<TApiResponse<TUserSearchResult | null>> {
    return this.http.get<TApiResponse<TUserSearchResult | null>>(
      `${this.UrlBuilder.apiProtectedRoute('users').route('search').build()}?email=${encodeURIComponent(email)}`
    );
  }

  inviteUser(dto: { email: string; first_name: string; last_name: string }): Observable<TApiResponse<TUserSearchResult>> {
    return this.http.post<TApiResponse<TUserSearchResult>>(
      this.UrlBuilder.apiProtectedRoute('users').route('invite').build(),
      dto
    );
  }

  createContractForUser(dto: { company_id: TCompanyId; user_id: TUserId; status: TContractStatus; startDate: string; endDate?: string }): Observable<TApiResponse<TCompanyContractViewModel>> {
    return this.http.post<TApiResponse<TCompanyContractViewModel>>(
      this.UrlBuilder.apiProtectedRoute('contracts').build(),
      { requestDTO: dto }
    );
  }

  getContractById(contractId: TContractId): Observable<TContractDetailViewModel> {
    return this.http.get<TContractDetailViewModel>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(contractId).build()
    );
  }

  updateContract(contractId: TContractId, dto: { status?: TContractStatus; startDate?: string; endDate?: string | null }): Observable<TContractDetailViewModel> {
    return this.http.patch<TContractDetailViewModel>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(contractId).build(),
      dto
    );
  }

  deleteCompany(id: TCompanyId): Observable<void> {
    return this.http.delete<void>(
      this.UrlBuilder.apiProtectedRoute('companies').route(id).build()
    );
  }

  addService(companyId: TCompanyId, name: string): Observable<TApiResponse<TCompanyViewModel>> {
    return this.http.post<TApiResponse<TCompanyViewModel>>(
      `${this.UrlBuilder.apiProtectedRoute('companies').route('services').build()}`,
      { company_id: companyId, name }
    );
  }

  removeService(companyId: TCompanyId, serviceId: TServiceId): Observable<TApiResponse<TCompanyViewModel>> {
    return this.http.delete<TApiResponse<TCompanyViewModel>>(
      `${this.UrlBuilder.apiProtectedRoute('companies').route(`services/${serviceId}`).build()}`,
      { body: { company_id: companyId } }
    );
  }

  createTeam(dto: { company_id: TCompanyId; name: string; service_id?: TServiceId }): Observable<TApiResponse<TTeamRecord>> {
    return this.http.post<TApiResponse<TTeamRecord>>(
      `${this.UrlBuilder.apiProtectedRoute('companies').route('teams').build()}`,
      dto
    );
  }

  getCompanyTeams(companyId: TCompanyId): Observable<TApiResponse<TTeamRecord[]>> {
    return this.http.get<TApiResponse<TTeamRecord[]>>(
      `${this.UrlBuilder.apiProtectedRoute('companies').route(`${companyId}/teams`).build()}`
    );
  }

  addTeamMember(teamId: string, dto: { user_id: string; contract_id: string }): Observable<TApiResponse<unknown>> {
    return this.http.post<TApiResponse<unknown>>(
      `${this.UrlBuilder.apiProtectedRoute('companies').route(`teams/${teamId}/members`).build()}`,
      dto
    );
  }

  removeTeamMember(teamId: string, userId: string): Observable<TApiResponse<unknown>> {
    return this.http.delete<TApiResponse<unknown>>(
      `${this.UrlBuilder.apiProtectedRoute('companies').route(`teams/${teamId}/members/${userId}`).build()}`
    );
  }

  getServiceDetail(companyId: TCompanyId, serviceId: TServiceId): Observable<TApiResponse<TServiceDetailViewModel>> {
    return this.http.get<TApiResponse<TServiceDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${companyId}/services/${serviceId}`).build()
    );
  }

  updateService(companyId: TCompanyId, serviceId: TServiceId, dto: { name?: string; color?: string; communication?: TServiceCommunication | null }): Observable<TApiResponse<TService>> {
    return this.http.patch<TApiResponse<TService>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`services/${serviceId}`).build(),
      { company_id: companyId, ...dto }
    );
  }

  getOrgChart(companyId: TCompanyId): Observable<TApiResponse<TCompanyOrgChartViewModel>> {
    return this.http.get<TApiResponse<TCompanyOrgChartViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${companyId}/orgchart`).build()
    );
  }
}
