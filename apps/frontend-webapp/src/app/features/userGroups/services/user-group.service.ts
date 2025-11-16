import { effect, Injectable, signal } from '@angular/core';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type { TUserGroupListViewModel, TUserGroupId } from '@sh3pherd/shared-types';
import type { TApiResponse } from '@sh3pherd/shared-types';
import type { TSubgroupInitialFormValuesObject } from '@sh3pherd/shared-types';
import { catchError, map, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserGroupService extends BaseHttpService {
  private url = this.UrlBuilder.apiProtectedRoute('user-groups').build();

  private _userGroups = signal<TUserGroupListViewModel| null>(null);

  get userGroups() {
    return this._userGroups.asReadonly();
  };

  constructor() {
    super();
    effect(() => {
      if (this._userGroups() === null) {
        this.getMyUserGroups();
      }
    });
  }

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
          this._userGroups.set(null);
          console.error('[UserGroups] Error loading user groups: ', err);
        }
      });
  };

  /**
   * Creates a new user group with the provided data.
   * @param data
   */
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
      .get<TApiResponse<TSubgroupInitialFormValuesObject>>(url)
      .pipe(
        map(res => res.data),
        catchError(err => {
          console.error('[UserGroups] Error loading sub-group form config:', err);
          return of(null); // retourne un flux vide pour éviter le crash
        })
      );
  };
}
