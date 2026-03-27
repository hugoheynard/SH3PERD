import { inject, Injectable } from '@angular/core';
import { ApiURLService } from '../../../../core/services/api-url.service';
import { HttpClient } from '@angular/common/http';
import type { TUserProfileViewModel, TApiResponse } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class UserProfileApiService {
  private readonly apiServ = inject(ApiURLService);
  private readonly http = inject(HttpClient);
  private readonly URL = this.apiServ.apiProtectedRoute('user/profile').build();


  getCurrentUserProfile() {
    return this.http.get<TApiResponse<TUserProfileViewModel>>(`${this.URL}/me`);
  };

  updateUserProfile(data: TUserProfileViewModel) {
    return this.http.patch<TApiResponse<TUserProfileViewModel>>(`${this.URL}/me`, data);
  };

  changeEmail(newEmail: string) {
    return this.http.patch<TApiResponse<void>>(`${this.URL}/me/email`, { email: newEmail });
  };
}
