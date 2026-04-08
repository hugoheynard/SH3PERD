import { ContractsService } from './contracts.service';
import { computed, inject, Injectable, signal } from '@angular/core';
import type { TContractDomainModel } from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root'
})
export class ContractStore {
  private readonly contractService = inject(ContractsService);
  private readonly _contracts = signal<TContractDomainModel[]>([]);
  private readonly _loading = signal(false);

  /** The user's favorite (pinned) contract, if any. */
  readonly favoriteContract = computed(() =>
    this._contracts().find(c => c.is_favorite) ?? null,
  );

  /** All contracts except the favorite. */
  readonly contracts = computed(() =>
    this._contracts().filter(c => !c.is_favorite),
  );

  readonly loading = this._loading.asReadonly();

  loadMyContracts() {
    this._loading.set(true);
    this.contractService.getCurrentUserContractList().subscribe({
      next: (contracts) => {
        this._contracts.set(contracts);
        this._loading.set(false);
      },
      error: () => {
        this._contracts.set([]);
        this._loading.set(false);
      }
    });
  };
}
