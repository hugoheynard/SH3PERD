import { Injectable, signal } from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';


@Injectable({
  providedIn: 'root'
})
export class UserGroupService extends BaseHttpService {
  private scopedURL = this.apiURLService
    .api()
    .protected()
    .currentContractScoped()
    .route('user-groups')
    .build();

  private _data = signal<any[]>([]);

  get data() {
    return this._data.asReadonly();
  };

  /**
   * Fetches the user groups associated with the current user.
   *
   */
  getMyUserGroups(): void {
    const url = `${this.scopedURL}/me`;

    this.scopedHttp
      .withFeature('user-groups::list').get<any[]>(url)
      .subscribe({
        next: value=> this._data.set(value),
        error: err => {
          console.error('[UserGroups] Error loading user groups: ', err);
        }
      });
  };

  createUserGroup(data: any){
    const url = this.scopedURL;

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
