import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import type { Observable } from 'rxjs';
import type {
  TApiResponse,
  TCompanyId,
  TCompanyOrgChartViewModel,
  TOrgNodeId,
  TOrgNodeGuestMember,
  TOrgNodeRecord,
  TTeamRole,
  TTeamType,
  TOrgNodeCommunication,
  TUserId,
} from '@sh3pherd/shared-types';

@Injectable({ providedIn: 'root' })
export class OrgChartService extends BaseHttpService {

  getOrgChart(companyId: TCompanyId): Observable<TApiResponse<TCompanyOrgChartViewModel>> {
    return this.http.get<TApiResponse<TCompanyOrgChartViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${companyId}/orgchart`).build()
    );
  }

  getCompanyOrgNodes(companyId: TCompanyId): Observable<TApiResponse<TOrgNodeRecord[]>> {
    return this.http.get<TApiResponse<TOrgNodeRecord[]>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${companyId}/org-nodes`).build()
    );
  }

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

  addGuestMember(nodeId: TOrgNodeId, dto: { display_name: string; title?: string; team_role: TTeamRole }): Observable<TApiResponse<TOrgNodeGuestMember>> {
    return this.http.post<TApiResponse<TOrgNodeGuestMember>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/guests`).build(),
      dto
    );
  }

  archiveOrgNode(nodeId: TOrgNodeId): Observable<void> {
    return this.http.delete<void>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}`).build()
    );
  }

  removeGuestMember(nodeId: TOrgNodeId, guestId: string): Observable<TApiResponse<unknown>> {
    return this.http.delete<TApiResponse<unknown>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/guests/${guestId}`).build()
    );
  }
}
