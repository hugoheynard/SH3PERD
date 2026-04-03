import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import type { Observable } from 'rxjs';
import type { TApiResponse, TUserSearchResult } from '@sh3pherd/shared-types';

@Injectable({ providedIn: 'root' })
export class UserLookupService extends BaseHttpService {

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
