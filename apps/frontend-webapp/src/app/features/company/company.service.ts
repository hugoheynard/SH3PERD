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
  TIntegrationViewModel,
} from '@sh3pherd/shared-types';

export interface TSlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  num_members: number;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService extends BaseHttpService {

  // ── CRUD ────────────────────────────────────────────────────

  createCompany(name: string): Observable<TApiResponse<TCompanyDetailViewModel>> {
    return this.http.post<TApiResponse<TCompanyDetailViewModel>>(
      this.UrlBuilder.apiProtectedRoute('companies').build(),
      { name }
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

  // ── Company Settings ───────────────────────────────────────

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

  // ── Integrations ──────────────────────────────────────────

  getIntegrations(companyId: TCompanyId): Observable<TIntegrationViewModel[]> {
    const base = this.UrlBuilder.apiProtectedRoute('integrations').build();
    return this.http.get<TIntegrationViewModel[]>(`${base}?companyId=${companyId}`);
  }

  disconnectIntegration(companyId: TCompanyId, platform: string): Observable<void> {
    const base = this.UrlBuilder.apiProtectedRoute('integrations').route(platform).build();
    return this.http.delete<void>(`${base}?companyId=${companyId}`);
  }

  // ── Slack OAuth ────────────────────────────────────────────

  getSlackAuthUrl(companyId: TCompanyId): Observable<{ url: string }> {
    const base = this.UrlBuilder.apiAuthRoute('slack/authorize').build();
    return this.http.get<{ url: string }>(`${base}?companyId=${companyId}`);
  }

  // ── Slack Channels ─────────────────────────────────────────

  searchSlackChannels(companyId: TCompanyId, query: string): Observable<TSlackChannel[]> {
    const base = this.UrlBuilder.apiAuthRoute('slack/channels/search').build();
    return this.http.get<TSlackChannel[]>(`${base}?companyId=${companyId}&q=${encodeURIComponent(query)}`);
  }

  createSlackChannel(companyId: TCompanyId, name: string, isPrivate: boolean): Observable<TSlackChannel> {
    return this.http.post<TSlackChannel>(
      this.UrlBuilder.apiAuthRoute('slack/channels/create').build(),
      { companyId, name, isPrivate },
    );
  }
}
