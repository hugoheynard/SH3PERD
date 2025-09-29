import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type { TContractDomainModel } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class ContractsService extends BaseHttpService{
  private readonly contractURL = this.apiURLService.api().protected().route('contract').build();

  getContracts_me(filter: any) {
    return this.http.post<TContractDomainModel[]>(`${this.contractURL}/me`, filter );
  };
}
