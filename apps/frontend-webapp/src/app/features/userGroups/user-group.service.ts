import { Injectable, signal } from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import type { TUserGroupListViewModel } from '@sh3pherd/shared-types';


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
      .withFeature('user-groups::list::me')
      .post<TUserGroupListViewModel>(url, {})
      .subscribe({
        next: value=> this._userGroups.set(value),
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

}
