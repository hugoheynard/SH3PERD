import { Component, inject } from '@angular/core';
import { ButtonIconComponent } from '../../../../legacy/ui';
import { ContractStore } from '../../services/contract.store';
import { DataListComponent } from '../../../../core/components/data-list/data-list.component';
import type { TContractId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-contract-page',
  imports: [
    DataListComponent,
    ButtonIconComponent,
  ],
  standalone: true,
  templateUrl: './contract-page.component.html',
  styleUrl: './contract-page.component.scss'
})
export class ContractPageComponent {
  private readonly store = inject(ContractStore);
  readonly contracts = this.store.contracts;


  ngOnInit(): void {
    // Initialization logic here
    this.store.loadMyContracts({});
    console.log('Contracts loaded:', this.contracts());
  };

  edit(contractId: TContractId): void {
    console.log('Contract page edited:', contractId);
  };

}
