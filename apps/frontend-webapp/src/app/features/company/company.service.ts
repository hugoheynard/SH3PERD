import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import type { Observable } from 'rxjs';
import type {
  TApiResponse,
  TCompanyDetailViewModel,
  TCompanyCardViewModel,
  TCompanyId,
  TCompanyInfo,
  TOrgLayers,
  TCommunicationPlatform,
} from '@sh3pherd/shared-types';

@Injectable({ providedIn: 'root' })
export class CompanyService extends BaseHttpService {

  // ── CRUD ────────────────────────────────────────────────────

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

  deleteCompany(id: TCompanyId): Observable<void> {
    return this.http.delete<void>(
      this.UrlBuilder.apiProtectedRoute('companies').route(id).build()
    );
  }

  // ── OAuth ───────────────────────────────────────────────────

  getSlackAuthUrl(companyId: TCompanyId): Observable<{ url: string }> {
    const base = this.UrlBuilder.apiAuthRoute('slack/authorize').build();
    return this.http.get<{ url: string }>(`${base}?companyId=${companyId}`);
  }

  // ── Settings ────────────────────────────────────────────────

  updateCompanyInfo(id: TCompanyId, dto: TCompanyInfo): Observable<TApiResponse<TCompanyInfo>> {
    return this.http.patch<TApiResponse<TCompanyInfo>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${id}/settings/info`).build(),
      dto
    );
  }

  updateOrgLayers(id: TCompanyId, orgLayers: string[]): Observable<TApiResponse<TOrgLayers>> {
    return this.http.patch<TApiResponse<TOrgLayers>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${id}/settings/org-layers`).build(),
      { orgLayers }
    );
  }

  connectIntegration(id: TCompanyId, platform: TCommunicationPlatform, config: Record<string, string>): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.post<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${id}/settings/integrations`).build(),
      { platform, config }
    );
  }

  disconnectIntegration(id: TCompanyId, platform: TCommunicationPlatform): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.delete<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${id}/settings/integrations/${platform}`).build(),
    );
  }

  addChannel(id: TCompanyId, dto: { name: string; platform: TCommunicationPlatform; url: string }): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.post<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${id}/settings/channels`).build(),
      dto
    );
  }

  removeChannel(id: TCompanyId, channelId: string): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.delete<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').route(`${id}/settings/channels/${channelId}`).build(),
    );
  }
}
