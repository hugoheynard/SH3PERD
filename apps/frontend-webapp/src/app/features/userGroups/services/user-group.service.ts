import { Injectable, signal } from '@angular/core';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type { TUserGroupListViewModel, TUserGroupId } from '@sh3pherd/shared-types';
import type { TApiResponse } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class UserGroupService extends BaseHttpService {
  private url = this.UrlBuilder.apiProtectedRoute('user-groups').build();

  private _userGroups = signal<TUserGroupListViewModel| null>(null);

  get userGroups() {
    if(!this._userGroups()) {
      this.getMyUserGroups();
    }
    return this._userGroups.asReadonly();
  };

  /**
   * Fetches the user groups associated with the current user.
   * Updates the internal signal with the retrieved user groups.
   */
  getMyUserGroups(): void {
    const url = `${this.url}/me`;

    this.scopedHttp
      .withFeature('user-groups::list::currentUser')
      .post<TApiResponse<any>>(url, {})
      .subscribe({
        next: value=> this._userGroups.set(value.data),
        error: err => {
          console.error('[UserGroups] Error loading user groups: ', err);
        }
      });
  };

  createUserGroup(data: any){
    const url = this.url;

    return this.scopedHttp
      .withFeature('user-groups::create')
      .post<any>(url, data).subscribe({
        next: () => this.getMyUserGroups(),
        error: err => {
          console.error('[UserGroups] Error creating user group: ', err);
        }
      })
  };

  /**
   * Fetches the form configuration for creating a sub-user group under the specified user group.
   * @param userGroupId
   */
  getSubUserGroupFormConfig(userGroupId: TUserGroupId) {
    const url = `${this.url}/${userGroupId}/sub-group/initial-form-config`;

    return this.scopedHttp
      .withFeature('user-groups::sub-group::get-form-config')
      .get<any>(url)
      .subscribe({
        next: value=> value,
        error: err => {
          console.error('[UserGroups] Error loading sub-group form config: ', err);
        }
      });
  };
}
