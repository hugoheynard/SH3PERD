import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type { TContractListItemViewModel } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class ContractsService extends BaseHttpService{
  private readonly contractURL = this.UrlBuilder.apiProtectedRoute('contracts').build();

  /**
   * Get current user's contract list
   * @param filter
   */
  getCurrentUserContractList(filter: any) {
    return this.http.post<TContractListItemViewModel[]>(`${this.contractURL}/me`, filter );
  };

  getUserContractList(user_id: string, filter: any) {
    return this.http.post<TContractListItemViewModel[]>(`${this.contractURL}/user/${user_id}`, filter );
  };
}
