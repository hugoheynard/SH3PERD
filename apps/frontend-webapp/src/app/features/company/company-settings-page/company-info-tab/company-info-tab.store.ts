import { inject, Injectable, signal } from '@angular/core';
import { CompanyService } from '../../company.service';
import type { TCompanyId, TCompanyInfo } from '@sh3pherd/shared-types';

/**
 * Scoped store for the Company Info tab.
 *
 * Provided at the component level (NOT root) — created when the tab mounts,
 * destroyed when the tab unmounts. Owns its own loading/saving/error state.
 */
@Injectable()
export class CompanyInfoTabStore {
  private readonly companyService = inject(CompanyService);

  // ── State ──────────────────────────────────────────────────
  private readonly _info = signal<TCompanyInfo | null>(null);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors ──────────────────────────────────────────────
  readonly info = this._info.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  // ── Load ───────────────────────────────────────────────────

  /** Fetches company data and extracts the info subset (name, description, address). */
  load(companyId: TCompanyId): void {
    this._loading.set(true);
    this._error.set(null);
    this.companyService.getCompanyById(companyId).subscribe({
      next: (res) => {
        const d = res.data;
        this._info.set({
          name: d.name ?? '',
          description: d.description ?? '',
          address: {
            street: d.address?.street ?? '',
            city: d.address?.city ?? '',
            zip: d.address?.zip ?? '',
            country: d.address?.country ?? '',
          },
        });
        this._loading.set(false);
      },
      error: (err) => {
        console.error('[CompanyInfoTabStore] load failed', err);
        this._error.set('Failed to load company info.');
        this._loading.set(false);
      },
    });
  }

  // ── Save ───────────────────────────────────────────────────

  /** Patches company info. Backend returns the updated TCompanyInfo directly. */
  save(companyId: TCompanyId, dto: TCompanyInfo): void {
    this._saving.set(true);
    this._error.set(null);
    this.companyService.updateCompanyInfo(companyId, dto).subscribe({
      next: (res) => {
        this._info.set(res.data);
        this._saving.set(false);
      },
      error: (err) => {
        console.error('[CompanyInfoTabStore] save failed', err);
        this._error.set('Failed to save company info.');
        this._saving.set(false);
      },
    });
  }
}
