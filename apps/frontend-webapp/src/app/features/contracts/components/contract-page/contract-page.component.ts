import { Component, inject } from '@angular/core';
import { ButtonSecondaryComponent } from '@sh3pherd/ui-angular';
import { PaginatorComponent } from '../../../../shared/paginator/paginator.component';
import { ContractStore } from '../../services/contract.store';

@Component({
  selector: 'app-contract-page',
  imports: [
    PaginatorComponent,
    ButtonSecondaryComponent,
  ],
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

}
