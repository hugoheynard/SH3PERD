import { inject, Injectable } from '@angular/core';
import type {
  TShowAxisCriterion,
  TShowId,
  TShowSectionId,
  TShowSectionTarget,
} from '@sh3pherd/shared-types';
import { ShowsApiService } from '../shows-api.service';
import { ShowsStateService } from '../shows-state.service';

/**
 * Section-level mutations inside a show (add / update / remove /
 * reorder / mark played). Re-pulls the authoritative detail view
 * model after each write so the aggregated rating series stay
 * accurate.
 */
@Injectable({ providedIn: 'root' })
export class SectionMutationService {
  private readonly api = inject(ShowsApiService);
  private readonly state = inject(ShowsStateService);

  addSection(showId: TShowId, name: string, target?: TShowSectionTarget): void {
    this.api.addSection(showId, { name, target }).subscribe({
      next: () => this.state.loadDetail(showId),
    });
  }

  updateSection(
    showId: TShowId,
    sectionId: TShowSectionId,
    payload: {
      name?: string;
      description?: string;
      target?: TShowSectionTarget | null;
      startAt?: number | null;
      axisCriteria?: TShowAxisCriterion[] | null;
    },
  ): void {
    this.api.updateSection(showId, sectionId, payload).subscribe({
      next: () => this.state.loadDetail(showId),
    });
  }

  removeSection(showId: TShowId, sectionId: TShowSectionId): void {
    this.api.removeSection(showId, sectionId).subscribe({
      next: () => this.state.loadDetail(showId),
    });
  }

  reorderSections(showId: TShowId, orderedIds: TShowSectionId[]): void {
    this.api.reorderSections(showId, orderedIds).subscribe({
      next: () => this.state.loadDetail(showId),
    });
  }

  markSectionPlayed(showId: TShowId, sectionId: TShowSectionId): void {
    this.api.markSectionPlayed(showId, sectionId).subscribe({
      next: () => {
        this.state.loadDetail(showId);
        this.state.loadSummaries();
      },
    });
  }
}
