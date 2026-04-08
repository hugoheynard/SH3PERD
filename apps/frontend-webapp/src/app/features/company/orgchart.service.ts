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

  // ── Company-level views (contract-scoped) ───────────────────

  getOrgChart(companyId: TCompanyId): Observable<TApiResponse<TCompanyOrgChartViewModel>> {
    return this.scopedHttp.withContract().get<TApiResponse<TCompanyOrgChartViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${companyId}/orgchart`).build()
    );
  }

  getCompanyOrgNodes(companyId: TCompanyId): Observable<TApiResponse<TOrgNodeRecord[]>> {
    return this.scopedHttp.withContract().get<TApiResponse<TOrgNodeRecord[]>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${companyId}/org-nodes`).build()
    );
  }

  // ── Node CRUD (contract-scoped) ─────────────────────────────

  createOrgNode(dto: {
    company_id: TCompanyId;
    name: string;
    parent_id?: TOrgNodeId;
    type?: TTeamType;
    color?: string;
  }): Observable<TApiResponse<TOrgNodeRecord>> {
    return this.scopedHttp.withContract().post<TApiResponse<TOrgNodeRecord>>(
      this.UrlBuilder.apiProtectedRoute('companies').route('org-nodes').build(),
      dto
    );
  }

  updateOrgNode(nodeId: TOrgNodeId, dto: { name?: string; color?: string; type?: TTeamType; communications?: TOrgNodeCommunication[] }): Observable<TApiResponse<TOrgNodeRecord>> {
    return this.scopedHttp.withContract().patch<TApiResponse<TOrgNodeRecord>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}`).build(),
      dto
    );
  }

  archiveOrgNode(nodeId: TOrgNodeId): Observable<void> {
    return this.scopedHttp.withContract().delete<void>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}`).build()
    );
  }

  // ── Members (contract-scoped) ───────────────────────────────

  getOrgNodeMembers(nodeId: TOrgNodeId): Observable<TApiResponse<unknown>> {
    return this.scopedHttp.withContract().get<TApiResponse<unknown>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/members`).build()
    );
  }

  addOrgNodeMember(nodeId: TOrgNodeId, dto: { user_id: TUserId; contract_id: string; team_role?: TTeamRole; job_title?: string }): Observable<TApiResponse<unknown>> {
    return this.scopedHttp.withContract().post<TApiResponse<unknown>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/members`).build(),
      dto
    );
  }

  removeOrgNodeMember(nodeId: TOrgNodeId, userId: TUserId): Observable<TApiResponse<unknown>> {
    return this.scopedHttp.withContract().delete<TApiResponse<unknown>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/members/${userId}`).build()
    );
  }

  // ── Guest members (contract-scoped) ─────────────────────────

  addGuestMember(nodeId: TOrgNodeId, dto: { display_name: string; title?: string; team_role: TTeamRole }): Observable<TApiResponse<TOrgNodeGuestMember>> {
    return this.scopedHttp.withContract().post<TApiResponse<TOrgNodeGuestMember>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/guests`).build(),
      dto
    );
  }

  removeGuestMember(nodeId: TOrgNodeId, guestId: string): Observable<TApiResponse<unknown>> {
    return this.scopedHttp.withContract().delete<TApiResponse<unknown>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`org-nodes/${nodeId}/guests/${guestId}`).build()
    );
  }

  // ── Guest user creation ──────────────────────────────────

  createGuestUser(dto: { email: string; first_name: string; last_name: string; phone?: string }): Observable<{ user_id: string; email: string; first_name: string; last_name: string; is_guest: true }> {
    return this.http.post<any>(
      this.UrlBuilder.apiProtectedRoute('user').route('guest').build(),
      dto
    );
  }

  ungroupOrgNode(companyId: TCompanyId, nodeId: TOrgNodeId): Observable<{ ok: boolean }> {
    return this.scopedHttp.withContract().post<{ ok: boolean }>(
      this.UrlBuilder.apiProtectedRoute('companies').route('org-nodes/ungroup').build(),
      { companyId, nodeId }
    );
  }

  groupOrgNodes(companyId: TCompanyId, dto: { parentName: string; nodeIds: TOrgNodeId[] }): Observable<TApiResponse<unknown>> {
    return this.scopedHttp.withContract().post<TApiResponse<unknown>>(
      this.UrlBuilder.apiProtectedRoute('companies').route('org-nodes/group').build(),
      { companyId, ...dto }
    );
  }

  reorderOrgNodes(companyId: TCompanyId, parentId: TOrgNodeId | undefined, orderedIds: TOrgNodeId[]): Observable<{ ok: boolean }> {
    return this.scopedHttp.withContract().patch<{ ok: boolean }>(
      this.UrlBuilder.apiProtectedRoute('companies').route('org-nodes/reorder').build(),
      { companyId, parentId, orderedIds }
    );
  }
}
