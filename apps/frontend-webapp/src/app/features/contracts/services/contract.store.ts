import { ContractsService } from './contracts.service';
import { inject, Injectable, signal } from '@angular/core';
import type { TContractListItemViewModel } from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root'
})
export class ContractStore {
  private readonly contractService = inject(ContractsService);
  private readonly _contracts = signal<TContractListItemViewModel[]>([]);

  // Exposed readonly signal
  readonly contracts = this._contracts.asReadonly();


  loadMyContracts(filter: any) {
    this.contractService.getCurrentUserContractList({ requestDTO: { filter } }).subscribe({
      next: (contracts) => this._contracts.set(contracts),
      error: (err) => {
        console.error('Error loading contracts', err);
        this._contracts.set([]);
      }
    });
    console.log('loadMyContracts called', this.contracts())
  };
}
