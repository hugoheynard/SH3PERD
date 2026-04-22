import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type {
  TCreateShowPayload,
  TShowId,
  TUpdateShowPayload,
} from '@sh3pherd/shared-types';
import { ShowsApiService } from '../shows-api.service';
import { ShowsStateService } from '../shows-state.service';

/**
 * Show-level mutations (create / update / delete / duplicate / mark played).
 * Kept optimistic-free on anything that affects the aggregated rating
 * series — the backend derives them from expanded playlists, so we
 * re-pull the authoritative view model after each write.
 */
@Injectable({ providedIn: 'root' })
export class ShowMutationService {
  private readonly api = inject(ShowsApiService);
  private readonly state = inject(ShowsStateService);
  private readonly router = inject(Router);

  createShow(payload: TCreateShowPayload): void {
    this.api.createShow(payload).subscribe({
      next: (show) => {
        // Empty show: no items yet, so the series are empty. We
        // synthesise a minimal row so the list updates instantly;
        // the backend-authoritative summary lands on next loadSummaries.
        this.state.prependSummary({
          id: show.id,
          name: show.name,
          description: show.description,
          color: show.color,
          createdAt: show.createdAt,
          updatedAt: show.updatedAt,
          lastPlayedAt: show.lastPlayedAt,
          sectionCount: 1,
          totalDurationTargetSeconds: show.totalDurationTargetSeconds,
          trackCount: 0,
          totalDurationSeconds: 0,
          meanMastery: null,
          meanEnergy: null,
          meanEffort: null,
          meanQuality: null,
          masterySeries: [],
          energySeries: [],
          effortSeries: [],
          qualitySeries: [],
          durationSeries: [],
        });
        this.router.navigate(['/app/shows', show.id]);
      },
    });
  }

  updateShow(id: TShowId, payload: TUpdateShowPayload): void {
    this.api.updateShow(id, payload).subscribe({
      next: () => {
        this.state.loadSummaries();
        this.state.loadDetail(id);
      },
    });
  }

  deleteShow(id: TShowId): void {
    this.state.removeSummary(id);
    this.api.deleteShow(id).subscribe({
      error: () => this.state.loadSummaries(),
    });
  }

  duplicateShow(id: TShowId): void {
    this.api.duplicateShow(id).subscribe({
      next: () => this.state.loadSummaries(),
    });
  }

  markShowPlayed(showId: TShowId): void {
    this.api.markShowPlayed(showId).subscribe({
      next: () => {
        this.state.loadDetail(showId);
        this.state.loadSummaries();
      },
    });
  }
}
