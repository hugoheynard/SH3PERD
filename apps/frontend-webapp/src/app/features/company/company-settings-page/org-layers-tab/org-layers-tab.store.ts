import { inject, Injectable, signal } from '@angular/core';
import { CompanyService } from '../../company.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import type { TCompanyId } from '@sh3pherd/shared-types';

/**
 * Scoped store for the Org Layers tab.
 *
 * Provided at the component level (NOT root) — created when the tab mounts,
 * destroyed when the tab unmounts.
 */
@Injectable()
export class OrgLayersTabStore {
  private readonly companyService = inject(CompanyService);
  private readonly toast = inject(ToastService);

  // ── State ──────────────────────────────────────────────────
  private readonly _orgLayers = signal<string[] | null>(null);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors ──────────────────────────────────────────────
  readonly orgLayers = this._orgLayers.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  // ── Load ───────────────────────────────────────────────────

  load(companyId: TCompanyId): void {
    this._loading.set(true);
    this._error.set(null);
    this.companyService.getCompanyById(companyId).subscribe({
      next: (res) => {
        this._orgLayers.set(res.data.orgLayers ?? ['Department', 'Team', 'Sub-team']);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('[OrgLayersTabStore] load failed', err);
        this._error.set('Failed to load org layers.');
        this._loading.set(false);
      },
    });
  }

  // ── Save ───────────────────────────────────────────────────

  save(companyId: TCompanyId, orgLayers: string[]): void {
    this._saving.set(true);
    this._error.set(null);
    this.companyService.updateOrgLayers(companyId, orgLayers).subscribe({
      next: (res) => {
        this._orgLayers.set(res.data.orgLayers);
        this._saving.set(false);
        this.toast.show('Org layers updated', 'success');
      },
      error: (err) => {
        console.error('[OrgLayersTabStore] save failed', err);
        this._error.set('Failed to save org layers.');
        this._saving.set(false);
        this.toast.show('Failed to save org layers', 'error');
      },
    });
  }
}
