import { inject, Injectable, signal, computed } from '@angular/core';
import { CompanyService } from './company.service';
import type {
  TCompanyDetailViewModel,
  TCompanyCardViewModel,
  TCompanyId,
} from '@sh3pherd/shared-types';

@Injectable({ providedIn: 'root' })
export class CompanyStore {
  private readonly companyService = inject(CompanyService);

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
      },
      error: (err) => {
        console.error('[CompanyStore] createCompany failed', err);
        this._error.set('Failed to create company.');
        this._loading.set(false);
      },
    });
  }

  loadMyCompany(): void {
    this._loading.set(true);
    this._error.set(null);
    this.companyService.getMyCompany().subscribe({
      next: (res) => {
        this._company.set(res.data);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('[CompanyStore] loadMyCompany failed', err);
        this._error.set('Failed to load company.');
        this._loading.set(false);
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
      error: (err) => {
        console.error('[CompanyStore] loadMyCompanies failed', err);
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
      error: (err) => {
        console.error('[CompanyStore] loadCompanyById failed', err);
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
        onSuccess();
      },
      error: (err) => {
        console.error('[CompanyStore] deleteCompany failed', err);
        this._error.set('Failed to delete company.');
        this._loading.set(false);
      },
    });
  }

  // ── Settings ────────────────────────────────────────────────

  connectIntegration(id: TCompanyId, platform: import('@sh3pherd/shared-types').TCommunicationPlatform, config: Record<string, string>): void {
    this.companyService.connectIntegration(id, platform, config).subscribe({
      next: (res) => this.mergeCompany(res.data),
      error: (err) => console.error('[CompanyStore] connectIntegration failed', err),
    });
  }

  disconnectIntegration(id: TCompanyId, platform: import('@sh3pherd/shared-types').TCommunicationPlatform): void {
    this.companyService.disconnectIntegration(id, platform).subscribe({
      next: (res) => this.mergeCompany(res.data),
      error: (err) => console.error('[CompanyStore] disconnectIntegration failed', err),
    });
  }

  addChannel(id: TCompanyId, dto: { name: string; platform: import('@sh3pherd/shared-types').TCommunicationPlatform; url: string }): void {
    this.companyService.addChannel(id, dto).subscribe({
      next: (res) => this.mergeCompany(res.data),
      error: (err) => console.error('[CompanyStore] addChannel failed', err),
    });
  }

  removeChannel(id: TCompanyId, channelId: string): void {
    this.companyService.removeChannel(id, channelId).subscribe({
      next: (res) => this.mergeCompany(res.data),
      error: (err) => console.error('[CompanyStore] removeChannel failed', err),
    });
  }

  // ── Helpers ─────────────────────────────────────────────────

  /**
   * Optimistic merge: patches the existing detail view model with fields
   * returned by the backend (a TCompanyRecord), preserving computed fields
   * like activeTeamCount / activeContractCount that only the GET query provides.
   */
  private mergeCompany(partial: Partial<TCompanyDetailViewModel>): void {
    const current = this._company();
    if (!current) return;
    this._company.set({ ...current, ...partial });
  }
}
