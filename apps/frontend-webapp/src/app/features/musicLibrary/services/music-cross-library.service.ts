import { inject, Injectable, signal } from '@angular/core';
import type { TCompanyId } from '@sh3pherd/shared-types';
import { MusicLibraryApiService } from './music-library-api.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { ContractStore } from '../../contracts/services/contract.store';
import type { CrossSearchContext } from '../music-library-types';

/**
 * Cross-library slice — the "what songs does the rest of my company have"
 * view. Factored out of `MusicLibraryStateService` because it only loads
 * on-demand (when the user switches the active tab to cross-mode) and
 * has its own caching strategy (one company at a time, skip-if-same).
 */
@Injectable({ providedIn: 'root' })
export class MusicCrossLibraryService {
  private readonly libraryApi = inject(MusicLibraryApiService);
  private readonly toast = inject(ToastService);
  private readonly contractStore = inject(ContractStore);

  private readonly _context = signal<CrossSearchContext | null>(null);
  readonly context = this._context.asReadonly();

  /** Track which company we already loaded cross data for (avoid duplicate requests). */
  private loadedCompanyId: string | null = null;

  /**
   * Resolves the contract → companyId via the contract store, then fetches
   * the cross library for that company. Idempotent on the same company.
   */
  load(contractId: string): void {
    const allContracts = [
      this.contractStore.favoriteContract(),
      ...this.contractStore.contracts(),
    ].filter(Boolean);
    const contract = allContracts.find((c) => c!.id === contractId);
    if (!contract) {
      this.toast.show(
        'Contract not found — cannot load cross library',
        'error',
      );
      return;
    }

    const companyId = contract.company_id;
    if (this.loadedCompanyId === companyId) return;
    this.loadedCompanyId = companyId;

    this.libraryApi.getCrossLibrary(companyId as TCompanyId).subscribe({
      next: (result) => {
        const crossContext: CrossSearchContext = {
          contractId,
          members: result.members.map((m) => ({
            userId: m.userId,
            displayName: m.displayName,
            avatarInitials: m.avatarInitials,
          })),
          results: result.results.map((r) => ({
            referenceId: r.referenceId,
            title: r.title,
            originalArtist: r.originalArtist,
            members: Object.fromEntries(
              Object.entries(r.members).map(([uid, mv]) => [
                uid,
                {
                  hasVersion: mv.hasVersion,
                  versions: mv.versions.map((v) => ({
                    id: v.id,
                    label: v.label,
                    mastery: v.mastery,
                    energy: v.energy,
                    effort: v.effort,
                    tracks: v.tracks,
                  })),
                },
              ]),
            ),
            compatibleCount: r.compatibleCount,
          })),
        };
        this._context.set(crossContext);
      },
      error: () => {
        this.loadedCompanyId = null;
        this.toast.show('Failed to load cross library', 'error');
      },
    });
  }
}
