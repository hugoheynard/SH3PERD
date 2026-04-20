import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type {
  TCreateShowPayload,
  TMusicVersionId,
  TPlaylistColor,
  TPlaylistId,
  TShowId,
  TShowSectionId,
  TShowSectionItemId,
  TShowSectionItemKind,
  TShowSectionTarget,
  TUpdateShowPayload,
} from '@sh3pherd/shared-types';
import { ShowsApiService } from './shows-api.service';
import { ShowsStateService } from './shows-state.service';

/**
 * Imperative CRUD + playback surface for the shell. Calls the API,
 * then re-pulls the authoritative view model (detail + summaries) so
 * the rating sparklines stay in sync with the mutation that just
 * landed. Kept optimistic-free for v1: a show has enough server-side
 * derivation (expanded versions, aggregated series) that rebuilding
 * detail locally would risk drift.
 */
@Injectable({ providedIn: 'root' })
export class ShowsMutationService {
  private readonly api = inject(ShowsApiService);
  private readonly state = inject(ShowsStateService);
  private readonly router = inject(Router);

  createShow(payload: TCreateShowPayload): void {
    this.api.createShow(payload).subscribe({
      next: (show) => {
        // The summary's rating series are always empty for a brand-new
        // show (no items yet) — synthesise a minimal row so the list
        // updates instantly. Series refresh the moment loadSummaries runs.
        this.state.prependSummary({
          id: show.id,
          name: show.name,
          description: show.description,
          color: show.color,
          createdAt: show.createdAt,
          updatedAt: show.updatedAt,
          lastPlayedAt: show.lastPlayedAt,
          sectionCount: 1,
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

  // ── Sections ───────────────────────────────────────────

  addSection(showId: TShowId, name: string, target?: TShowSectionTarget): void {
    this.api.addSection(showId, { name, target }).subscribe({
      next: () => this.state.loadDetail(showId),
    });
  }

  updateSection(
    showId: TShowId,
    sectionId: TShowSectionId,
    payload: { name?: string; target?: TShowSectionTarget | null },
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

  // ── Items ──────────────────────────────────────────────

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

  // ── Played ─────────────────────────────────────────────

  markShowPlayed(showId: TShowId): void {
    this.api.markShowPlayed(showId).subscribe({
      next: () => {
        this.state.loadDetail(showId);
        this.state.loadSummaries();
      },
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

  // ── Convert ────────────────────────────────────────────

  convertSectionToPlaylist(
    showId: TShowId,
    sectionId: TShowSectionId,
    payload: { name?: string; color?: TPlaylistColor },
  ): void {
    this.api.convertSectionToPlaylist(showId, sectionId, payload).subscribe();
  }
}
