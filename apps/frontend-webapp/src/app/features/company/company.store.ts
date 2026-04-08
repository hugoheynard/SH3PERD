import { inject, Injectable, signal, computed } from '@angular/core';
import { CompanyService } from './company.service';
import { ToastService } from '../../shared/toast/toast.service';
import type {
  TCompanyDetailViewModel,
  TCompanyCardViewModel,
  TCompanyId,
} from '@sh3pherd/shared-types';

@Injectable({ providedIn: 'root' })
export class CompanyStore {
  private readonly companyService = inject(CompanyService);
  private readonly toast = inject(ToastService);

  // ── State ──────────────────────────────────────────────────
  private readonly _company = signal<TCompanyDetailViewModel | null>(null);
  private readonly _companies = signal<TCompanyCardViewModel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors ──────────────────────────────────────────────
  readonly company = this._company.asReadonly();
  readonly companies = this._companies.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hasCompany = computed(() => this._company() !== null);

  // ── CRUD ────────────────────────────────────────────────────

  createCompany(name: string): void {
    this._loading.set(true);
    this._error.set(null);
    this.companyService.createCompany(name).subscribe({
      next: (res) => {
        this._company.set(res.data);
        this._loading.set(false);
        this.toast.show('Company created', 'success');
      },
      error: () => {
        this._error.set('Failed to create company.');
        this._loading.set(false);
        this.toast.show('Failed to create company', 'error');
      },
    });
  }


  loadMyCompanies(): void {
    this._loading.set(true);
    this._error.set(null);
    this.companyService.getMyCompanies().subscribe({
      next: (res) => {
        this._companies.set(res.data);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Failed to load companies.');
        this._loading.set(false);
      },
    });
  }

  loadCompanyById(id: TCompanyId): void {
    this._loading.set(true);
    this._error.set(null);
    this.companyService.getCompanyById(id).subscribe({
      next: (res) => {
        this._company.set(res.data);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Failed to load company.');
        this._loading.set(false);
      },
    });
  }

  deleteCompany(id: TCompanyId, onSuccess: () => void): void {
    this._loading.set(true);
    this.companyService.deleteCompany(id).subscribe({
      next: () => {
        this._company.set(null);
        this._loading.set(false);
        this.toast.show('Company deleted', 'success');
        onSuccess();
      },
      error: () => {
        this._error.set('Failed to delete company.');
        this._loading.set(false);
        this.toast.show('Failed to delete company', 'error');
      },
    });
  }
}
