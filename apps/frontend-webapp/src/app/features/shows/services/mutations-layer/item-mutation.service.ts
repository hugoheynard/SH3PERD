import { inject, Injectable } from '@angular/core';
import type {
  TMusicVersionId,
  TPlaylistId,
  TShowId,
  TShowSectionId,
  TShowSectionItemId,
  TShowSectionItemKind,
} from '@sh3pherd/shared-types';
import { ShowsApiService } from '../shows-api.service';
import { ShowsStateService } from '../shows-state.service';

/**
 * Item-level mutations inside a section (add / remove / reorder /
 * move across sections). Re-pulls the authoritative detail view
 * model after each write; touches `summaries` only when the total
 * track count would have changed.
 */
@Injectable({ providedIn: 'root' })
export class ItemMutationService {
  private readonly api = inject(ShowsApiService);
  private readonly state = inject(ShowsStateService);

  addItem(
    showId: TShowId,
    sectionId: TShowSectionId,
    kind: TShowSectionItemKind,
    ref_id: TMusicVersionId | TPlaylistId,
    position?: number,
  ): void {
    this.api.addItem(showId, sectionId, { kind, ref_id, position }).subscribe({
      next: () => {
        this.state.loadDetail(showId);
        this.state.loadSummaries();
      },
    });
  }

  removeItem(
    showId: TShowId,
    sectionId: TShowSectionId,
    itemId: TShowSectionItemId,
  ): void {
    this.api.removeItem(showId, sectionId, itemId).subscribe({
      next: () => {
        this.state.loadDetail(showId);
        this.state.loadSummaries();
      },
    });
  }

  reorderItems(
    showId: TShowId,
    sectionId: TShowSectionId,
    orderedIds: TShowSectionItemId[],
  ): void {
    this.api.reorderItems(showId, sectionId, orderedIds).subscribe({
      next: () => this.state.loadDetail(showId),
    });
  }

  moveItem(
    showId: TShowId,
    itemId: TShowSectionItemId,
    from: TShowSectionId,
    to: TShowSectionId,
    position?: number,
  ): void {
    this.api.moveItem(showId, itemId, { from, to, position }).subscribe({
      next: () => this.state.loadDetail(showId),
    });
  }
}
