import { ContractsService } from './contracts.service';
import { inject, Injectable, signal } from '@angular/core';
import type { TContractDomainModel } from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root'
})
export class ContractStore {
  private readonly contractService = inject(ContractsService);

  private readonly _contracts = signal<TContractDomainModel[]>([]);
  readonly contracts = this._contracts.asReadonly();


  loadMyContracts(filter: any) {
    this.contractService.getContracts_me({ requestDTO: { filter } }).subscribe({
      next: (contracts) => this._contracts.set(contracts),
      error: (err) => {
        console.error('Error loading contracts', err);
        this._contracts.set([]);
      }
    });
  };
}
