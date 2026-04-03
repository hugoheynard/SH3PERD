import { inject, Injectable, signal } from '@angular/core';
import { ContractService } from './contract.service';
import type {
  TCompanyContractViewModel,
  TCompanyId,
  TContractId,
  TContractRole,
  TContractStatus,
  TUserId,
} from '@sh3pherd/shared-types';

@Injectable({ providedIn: 'root' })
export class ContractStore {
  private readonly service = inject(ContractService);

  // ── State ──────────────────────────────────────────────────
  private readonly _contracts = signal<TCompanyContractViewModel[]>([]);

  // ── Selectors ──────────────────────────────────────────────
  readonly contracts = this._contracts.asReadonly();

  // ── Actions ────────────────────────────────────────────────

  loadCompanyContracts(companyId: TCompanyId): void {
    this.service.getCompanyContracts(companyId).subscribe({
      next: (res) => this._contracts.set(res),
      error: (err) => console.error('[ContractStore] loadCompanyContracts failed', err),
    });
  }

  createContractForUser(
    companyId: TCompanyId,
    userId: TUserId,
    dto: { status: TContractStatus; startDate: string; endDate?: string },
    onSuccess?: () => void,
  ): void {
    this.service.createContractForUser({ company_id: companyId, user_id: userId, ...dto }).subscribe({
      next: (res) => {
        this._contracts.update(list => [...list, res.data]);
        onSuccess?.();
      },
      error: (err) => console.error('[ContractStore] createContractForUser failed', err),
    });
  }

  assignContractRole(contractId: TContractId, role: TContractRole, onSuccess?: () => void): void {
    this.service.assignContractRole(contractId, role).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[ContractStore] assignContractRole failed', err),
    });
  }

  removeContractRole(contractId: TContractId, role: TContractRole, onSuccess?: () => void): void {
    this.service.removeContractRole(contractId, role).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[ContractStore] removeContractRole failed', err),
    });
  }
}
