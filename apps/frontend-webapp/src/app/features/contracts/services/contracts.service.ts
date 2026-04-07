import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type { TContractDomainModel } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class ContractsService extends BaseHttpService {
  private readonly contractURL = this.UrlBuilder.apiProtectedRoute('contracts').build();

  /** Get all contracts for the authenticated user. */
  getCurrentUserContractList() {
    return this.http.get<TContractDomainModel[]>(`${this.contractURL}/me`);
  };
}
