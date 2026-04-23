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
    });
  }

  createContractForUser(
    companyId: TCompanyId,
    userId: TUserId,
    dto: { status: TContractStatus; startDate: string; endDate?: string },
    onDone?: (ok: boolean) => void,
  ): void {
    this.service
      .createContractForUser({ company_id: companyId, user_id: userId, ...dto })
      .subscribe({
        next: () => {
          // Refetch so the list contains the full view model (with user
          // identity fields), not the bare record returned by POST.
          this.loadCompanyContracts(companyId);
          onDone?.(true);
        },
        error: () => onDone?.(false),
      });
  }

  assignContractRole(
    contractId: TContractId,
    role: TContractRole,
    onSuccess?: () => void,
  ): void {
    this.service.assignContractRole(contractId, role).subscribe({
      next: () => onSuccess?.(),
    });
  }

  removeContractRole(
    contractId: TContractId,
    role: TContractRole,
    onSuccess?: () => void,
  ): void {
    this.service.removeContractRole(contractId, role).subscribe({
      next: () => onSuccess?.(),
    });
  }
}
