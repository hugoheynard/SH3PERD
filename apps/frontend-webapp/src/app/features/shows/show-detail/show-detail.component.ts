import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type {
  TMusicVersionId,
  TPlaylistId,
  TShowId,
  TShowSectionId,
  TShowSectionItemView,
  TShowSectionViewModel,
  TShowSummaryViewModel,
} from '@sh3pherd/shared-types';
import { ShowsStateService } from '../services/shows-state.service';
import { ShowsMutationService } from '../services/shows-mutation.service';
import { ShowsDndInitService } from '../services/shows-dnd-init.service';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ButtonIconComponent } from '../../../shared/button-icon/button-icon.component';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { InlineConfirmComponent } from '../../../shared/inline-confirm/inline-confirm.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { RatingSparklineComponent } from '../../../shared/rating-sparkline/rating-sparkline.component';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import type { DragState } from '../../../core/drag-and-drop/drag.types';

/** Four rating axes with per-axis accent colour — the shared rating
 *  sparkline renders a smoothed series tinted with these so every card,
 *  detail header and section footer reads with the same grammar. */
const RATING_AXES = [
  {
    label: 'MST',
    accent: 'var(--color-rating-high, #4ade80)',
    meanKey: 'meanMastery',
    seriesKey: 'masterySeries',
  },
  {
    label: 'NRG',
    accent: 'var(--color-rating-max, #fbbf24)',
    meanKey: 'meanEnergy',
    seriesKey: 'energySeries',
  },
  {
    label: 'EFF',
    accent: 'var(--color-rating-medium, #38bdf8)',
    meanKey: 'meanEffort',
    seriesKey: 'effortSeries',
  },
  {
    label: 'QTY',
    accent: 'var(--color-rating-low, #a78bfa)',
    meanKey: 'meanQuality',
    seriesKey: 'qualitySeries',
  },
] as const;

type RatingAxis = (typeof RATING_AXES)[number];

/**
 * Body of the show detail view — used by both the routed page
 * (`/app/shows/:id`) and the right-side panel mounted via `LayoutService`.
 * Keeps all the show UX in one place; the two shells just decide how
 * to pipe the id in and what chrome wraps it.
 */
@Component({
  selector: 'app-show-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    ButtonComponent,
    ButtonIconComponent,
    BadgeComponent,
    IconComponent,
    InlineConfirmComponent,
    LoadingStateComponent,
    RatingSparklineComponent,
    DndDropZoneDirective,
  ],
  templateUrl: './show-detail.component.html',
  styleUrl: './show-detail.component.scss',
})
export class ShowDetailComponent {
  readonly showId = input<TShowId | null>(null);

  protected readonly state = inject(ShowsStateService);
  private readonly mutations = inject(ShowsMutationService);

  protected readonly detail = this.state.detail;
  protected readonly loading = this.state.detailLoadingFor;
  protected readonly singleMode = computed(
    () => (this.detail()?.sections.length ?? 0) <= 1,
  );

  protected readonly axes = RATING_AXES;

  /** Inline-edit state — the show name is replaced by an <input> when
   *  set. Switching id clears the draft so reopening a different show
   *  in the side panel never inherits a stale rename. */
  protected readonly editingShowName = signal(false);
  protected readonly showNameDraft = signal('');

  /** Inline-edit state for section names (one at a time). */
  protected readonly editingSectionId = signal<TShowSectionId | null>(null);
  protected readonly sectionNameDraft = signal('');

  constructor() {
    // Ensure the `playlist` drag preview is registered before the first
    // drop happens. Service is `providedIn: 'root'` and idempotent — no-op
    // on subsequent component mounts. Side-effect-only inject.
    inject(ShowsDndInitService);

    // Re-fetch whenever the id changes. Unmount clears the state so
    // the next detail opens cleanly (useful when the panel closes).
    effect(() => {
      const id = this.showId();
      if (id) {
        this.state.loadDetail(id);
      } else {
        this.state.clearDetail();
      }
      // Drop any in-flight rename when the shown entity changes.
      this.editingShowName.set(false);
      this.editingSectionId.set(null);
    });
  }

  // ── Show rename (inline) ─────────────────────────────

  startRenameShow(): void {
    const show = this.detail();
    if (!show) return;
    this.showNameDraft.set(show.name);
    this.editingShowName.set(true);
  }

  commitRenameShow(): void {
    const show = this.detail();
    if (!show) return;
    const name = this.showNameDraft().trim();
    this.editingShowName.set(false);
    if (!name || name === show.name) return;
    this.mutations.updateShow(show.id, { name });
  }

  cancelRenameShow(): void {
    this.editingShowName.set(false);
  }

  onShowNameKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitRenameShow();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelRenameShow();
    }
  }

  // ── Section rename (inline) ──────────────────────────

  startRenameSection(section: TShowSectionViewModel): void {
    this.sectionNameDraft.set(section.name);
    this.editingSectionId.set(section.id);
  }

  commitRenameSection(section: TShowSectionViewModel): void {
    const show = this.detail();
    if (!show) return;
    const name = this.sectionNameDraft().trim();
    this.editingSectionId.set(null);
    if (!name || name === section.name) return;
    this.mutations.updateSection(show.id, section.id, { name });
  }

  cancelRenameSection(): void {
    this.editingSectionId.set(null);
  }

  onSectionNameKey(event: KeyboardEvent, section: TShowSectionViewModel): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitRenameSection(section);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelRenameSection();
    }
  }

  // ── Existing actions ─────────────────────────────────

  onDuplicate(): void {
    const show = this.detail();
    if (!show) return;
    this.mutations.duplicateShow(show.id);
  }

  onDelete(): void {
    const show = this.detail();
    if (!show) return;
    this.mutations.deleteShow(show.id);
  }

  onMarkShowPlayed(): void {
    const show = this.detail();
    if (!show) return;
    this.mutations.markShowPlayed(show.id);
  }

  onMarkSectionPlayed(section: TShowSectionViewModel): void {
    const show = this.detail();
    if (!show) return;
    this.mutations.markSectionPlayed(show.id, section.id);
  }

  onAddSection(): void {
    const show = this.detail();
    if (!show) return;
    const name = window
      .prompt('Section name', `Set ${show.sections.length + 1}`)
      ?.trim();
    if (!name) return;
    this.mutations.addSection(show.id, name);
  }

  onRemoveSection(section: TShowSectionViewModel): void {
    const show = this.detail();
    if (!show || show.sections.length <= 1) return;
    this.mutations.removeSection(show.id, section.id);
  }

  onConvertSectionToPlaylist(section: TShowSectionViewModel): void {
    const show = this.detail();
    if (!show) return;
    const name = window
      .prompt('Playlist name', `${section.name} — playlist`)
      ?.trim();
    if (!name) return;
    this.mutations.convertSectionToPlaylist(show.id, section.id, { name });
  }

  onRemoveItem(
    section: TShowSectionViewModel,
    item: TShowSectionItemView,
  ): void {
    const show = this.detail();
    if (!show) return;
    this.mutations.removeItem(show.id, section.id, item.id);
  }

  /** Drop handler for a section's DnD zone. Narrows the drag type to
   *  one of the two accepted kinds and dispatches the matching add-item
   *  mutation. Position defaults to "end of section" — the backend's
   *  aggregate reindexes on write. */
  onSectionDrop(
    showId: TShowId,
    sectionId: TShowSectionId,
    drag: DragState,
  ): void {
    if (drag.type === 'music-track') {
      this.mutations.addItem(
        showId,
        sectionId,
        'version',
        drag.data.versionId as TMusicVersionId,
      );
      return;
    }
    if (drag.type === 'playlist') {
      this.mutations.addItem(
        showId,
        sectionId,
        'playlist',
        drag.data.playlistId as TPlaylistId,
      );
    }
  }

  trackSection(_: number, s: TShowSectionViewModel): TShowSectionId {
    return s.id;
  }

  trackItem(_: number, item: TShowSectionItemView): string {
    return item.id;
  }

  itemTitle(item: TShowSectionItemView): string {
    return item.kind === 'version' ? item.version.title : item.playlist.name;
  }

  itemSubtitle(item: TShowSectionItemView): string {
    if (item.kind === 'version') {
      return `${item.version.originalArtist} — ${item.version.label}`;
    }
    return `Playlist · ${item.playlist.trackCount} track${item.playlist.trackCount > 1 ? 's' : ''}`;
  }

  formatDuration(seconds: number): string {
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm === 0 ? `${h}h` : `${h}h ${rm}m`;
  }

  formatTarget(target?: TShowSectionViewModel['target']): string | null {
    if (!target) return null;
    if (target.mode === 'duration')
      return `~${this.formatDuration(target.duration_s)}`;
    return `${target.track_count} song${target.track_count > 1 ? 's' : ''}`;
  }

  // ── Rating series helpers ────────────────────────────

  meanFor(
    target: TShowSummaryViewModel | TShowSectionViewModel,
    axis: RatingAxis,
  ): number | null {
    return target[axis.meanKey];
  }

  seriesFor(
    target: TShowSummaryViewModel | TShowSectionViewModel,
    axis: RatingAxis,
  ): (number | null)[] {
    return target[axis.seriesKey];
  }

  displayMean(mean: number | null): string {
    return mean === null ? '—' : mean.toFixed(1);
  }
}
