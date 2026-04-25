import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonIconComponent } from '../../../../shared/button-icon/button-icon.component';
import {
  ViewToggleComponent,
  type ViewMode,
} from '../../../../shared/view-toggle/view-toggle.component';
import { ContractStore } from '../../services/contract.store';
import {
  DataListComponent,
  type DataListColumn,
} from '../../../../core/components/data-list/data-list.component';
import { ContractCardComponent } from '../contract-card/contract-card.component';
import { EmptyStateComponent } from '../../../../shared/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../shared/loading-state/loading-state.component';
import type { TContractDomainModel, TContractId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-contract-page',
  imports: [
    DataListComponent,
    ButtonIconComponent,
    ViewToggleComponent,
    ContractCardComponent,
    EmptyStateComponent,
    LoadingStateComponent,
  ],
  standalone: true,
  templateUrl: './contract-page.component.html',
  styleUrl: './contract-page.component.scss',
})
export class ContractPageComponent {
  readonly store = inject(ContractStore);
  private readonly router = inject(Router);
  readonly viewMode = signal<ViewMode>('cards');

  readonly tableColumns: DataListColumn<TContractDomainModel>[] = [
    { fromKey: 'company_id', label: 'Company' },
    { fromKey: 'status', label: 'Status' },
    { fromKey: 'roles', label: 'Roles' },
    {
      fromKey: 'startDate',
      label: 'Start',
      pipe: 'date',
      pipeArgs: ['shortDate'],
    },
    { fromKey: 'endDate', label: 'End', pipe: 'date', pipeArgs: ['shortDate'] },
  ];

  ngOnInit(): void {
    this.store.loadMyContracts();
  }

  edit(contractId: TContractId): void {
    this.router.navigate(['/app/contracts', contractId]);
  }
}
