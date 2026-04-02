import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import type { Observable } from 'rxjs';
import type {
  TApiResponse,
  TCompanyAddress,
  TCompanyContractViewModel,
  TCompanyDetailViewModel,
  TCompanyCardViewModel,
  TCompanyId,
  TCompanyOrgChartViewModel,
  TContractDetailViewModel,
  TContractId,
  TContractRole,
  TContractStatus,
  TOrgNodeId,
  TOrgNodeGuestMember,
  TOrgNodeRecord,
  TTeamRole,
  TTeamType,
  TOrgNodeCommunication,
  TUserId,
  TUserSearchResult,
} from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root',
})
export class CompanyService extends BaseHttpService {

  // ── Company ────────────────────────────────────────────────

  createCompany(name: string): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.post<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').build(),
      { name }
    );
  }

  getMyCompany(): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.get<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route('me').build()
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

  updateCompanyInfo(id: TCompanyId, dto: { name?: string; description?: string; address?: TCompanyAddress; orgLayers?: string[]; integrations?: import('@sh3pherd/shared-types').TCompanyIntegration[]; channels?: import('@sh3pherd/shared-types').TCompanyChannel[] }): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.patch<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(id).build(),
      dto
    );
  }

  deleteCompany(id: TCompanyId): Observable<void> {
    return this.http.delete<void>(
      this.UrlBuilder.apiProtectedRoute('companies').route(id).build()
    );
  }

  // ── Org Chart ──────────────────────────────────────────────

  getOrgChart(companyId: TCompanyId): Observable<TApiResponse<TCompanyOrgChartViewModel>> {
    return this.http.get<TApiResponse<TCompanyOrgChartViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${companyId}/orgchart`).build()
    );
  }

  // ── Org Nodes ──────────────────────────────────────────────

  createOrgNode(dto: {
    company_id: TCompanyId;
    name: string;
    parent_id?: TOrgNodeId;
    type?: TTeamType;
    color?: string;
  }): Observable<TApiResponse<TOrgNodeRecord>> {
    return this.http.post<TApiResponse<TOrgNodeRecord>>(
      this.UrlBuilder.apiProtectedRoute('companies').route('org-nodes').build(),
      dto
    );
  }

  updateOrgNode(nodeId: TOrgNodeId, dto: { name?: string; color?: string; type?: TTeamType; communications?: TOrgNodeCommunication[] }): Observable<TApiResponse<TOrgNodeRecord>> {
    return this.http.patch<TApiResponse<TOrgNodeRecord>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}`).build(),
      dto
    );
  }

  getCompanyOrgNodes(companyId: TCompanyId): Observable<TApiResponse<TOrgNodeRecord[]>> {
    return this.http.get<TApiResponse<TOrgNodeRecord[]>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${companyId}/org-nodes`).build()
    );
  }

  getOrgNodeMembers(nodeId: TOrgNodeId): Observable<TApiResponse<unknown>> {
    return this.http.get<TApiResponse<unknown>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/members`).build()
    );
  }

  addOrgNodeMember(nodeId: TOrgNodeId, dto: { user_id: TUserId; contract_id: string; team_role?: TTeamRole }): Observable<TApiResponse<unknown>> {
    return this.http.post<TApiResponse<unknown>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/members`).build(),
      dto
    );
  }

  removeOrgNodeMember(nodeId: TOrgNodeId, userId: TUserId): Observable<TApiResponse<unknown>> {
    return this.http.delete<TApiResponse<unknown>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/members/${userId}`).build()
    );
  }

  // ── Guest Members ─────────────────────────────────────────

  addGuestMember(nodeId: TOrgNodeId, dto: { display_name: string; title?: string; team_role: TTeamRole }): Observable<TApiResponse<TOrgNodeGuestMember>> {
    return this.http.post<TApiResponse<TOrgNodeGuestMember>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/guests`).build(),
      dto
    );
  }

  removeGuestMember(nodeId: TOrgNodeId, guestId: string): Observable<TApiResponse<unknown>> {
    return this.http.delete<TApiResponse<unknown>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/guests/${guestId}`).build()
    );
  }

  // ── Contracts ──────────────────────────────────────────────

  getCompanyContracts(companyId: TCompanyId): Observable<TCompanyContractViewModel[]> {
    return this.http.get<TCompanyContractViewModel[]>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(`company/${companyId}`).build()
    );
  }

  getContractById(contractId: TContractId): Observable<TContractDetailViewModel> {
    return this.http.get<TContractDetailViewModel>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(contractId).build()
    );
  }

  createContractForUser(dto: { company_id: TCompanyId; user_id: TUserId; status: TContractStatus; startDate: string; endDate?: string }): Observable<TApiResponse<TCompanyContractViewModel>> {
    return this.http.post<TApiResponse<TCompanyContractViewModel>>(
      this.UrlBuilder.apiProtectedRoute('contracts').build(),
      { requestDTO: dto }
    );
  }

  updateContract(contractId: TContractId, dto: { status?: TContractStatus; startDate?: string; endDate?: string | null }): Observable<TContractDetailViewModel> {
    return this.http.patch<TContractDetailViewModel>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(contractId).build(),
      dto
    );
  }

  assignContractRole(contractId: TContractId, role: TContractRole): Observable<unknown> {
    return this.http.post<unknown>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(`${contractId}/roles`).build(),
      { role }
    );
  }

  removeContractRole(contractId: TContractId, role: TContractRole): Observable<unknown> {
    return this.http.delete<unknown>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(`${contractId}/roles/${role}`).build()
    );
  }

  // ── Users ──────────────────────────────────────────────────

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
}
