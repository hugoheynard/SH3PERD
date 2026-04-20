import { computed, inject, Injectable, signal } from '@angular/core';
import type {
  TShowDetailViewModel,
  TShowId,
  TShowSummaryViewModel,
} from '@sh3pherd/shared-types';
import { ShowsApiService } from './shows-api.service';

/**
 * Signal-backed shell for the Shows feature.
 *
 * The list of summaries lives here so `/app/shows` and the menu badge can
 * read the same source of truth. Detail lives here too (not on the detail
 * page) so mark-played / convert can refresh both views after a mutation
 * without re-fetching.
 */
interface ShowsState {
  summaries: TShowSummaryViewModel[];
  loadingSummaries: boolean;
  detail: TShowDetailViewModel | null;
  detailLoadingFor: TShowId | null;
}

const INITIAL_STATE: ShowsState = {
  summaries: [],
  loadingSummaries: false,
  detail: null,
  detailLoadingFor: null,
};

@Injectable({ providedIn: 'root' })
export class ShowsStateService {
  private readonly api = inject(ShowsApiService);
  private readonly _state = signal<ShowsState>(INITIAL_STATE);

  readonly summaries = computed(() => this._state().summaries);
  readonly loadingSummaries = computed(() => this._state().loadingSummaries);
  readonly detail = computed(() => this._state().detail);
  readonly detailLoadingFor = computed(() => this._state().detailLoadingFor);

  loadSummaries(): void {
    if (this._state().loadingSummaries) return;
    this._state.update((s) => ({ ...s, loadingSummaries: true }));
    this.api.getMyShows().subscribe({
      next: (summaries) =>
        this._state.update((s) => ({
          ...s,
          summaries,
          loadingSummaries: false,
        })),
      error: () =>
        this._state.update((s) => ({ ...s, loadingSummaries: false })),
    });
  }

  loadDetail(id: TShowId): void {
    this._state.update((s) => ({ ...s, detail: null, detailLoadingFor: id }));
    this.api.getShowDetail(id).subscribe({
      next: (detail) =>
        this._state.update((s) =>
          // Ignore stale responses if the user has already moved on.
          s.detailLoadingFor === id
            ? { ...s, detail, detailLoadingFor: null }
            : s,
        ),
      error: () =>
        this._state.update((s) =>
          s.detailLoadingFor === id
            ? { ...s, detail: null, detailLoadingFor: null }
            : s,
        ),
    });
  }

  clearDetail(): void {
    this._state.update((s) => ({ ...s, detail: null, detailLoadingFor: null }));
  }

  replaceSummary(summary: TShowSummaryViewModel): void {
    this._state.update((s) => ({
      ...s,
      summaries: s.summaries.map((e) => (e.id === summary.id ? summary : e)),
    }));
  }

  prependSummary(summary: TShowSummaryViewModel): void {
    this._state.update((s) => ({ ...s, summaries: [summary, ...s.summaries] }));
  }

  removeSummary(id: TShowId): void {
    this._state.update((s) => ({
      ...s,
      summaries: s.summaries.filter((x) => x.id !== id),
    }));
  }

  setDetail(detail: TShowDetailViewModel | null): void {
    this._state.update((s) => ({ ...s, detail }));
  }
}
