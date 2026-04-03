import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ContractStore } from '../../contract.store';
import { ContractCreationPanelComponent } from '../../contract-creation-panel/contract-creation-panel.component';
import { ButtonComponent } from '../../../../shared/button/button.component';
import type { TCompanyId, TContractId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-contracts-tab',
  standalone: true,
  imports: [DatePipe, ButtonComponent, ContractCreationPanelComponent],
  templateUrl: './contracts-tab.component.html',
  styleUrl: './contracts-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractsTabComponent {
  readonly store = inject(ContractStore);
  private readonly router = inject(Router);

  readonly companyId = input.required<TCompanyId>();
  readonly showCreatePanel = signal(false);

  goToContract(contractId: TContractId): void {
    this.router.navigate(['/app/company', this.companyId(), 'contracts', contractId]);
  }
}
