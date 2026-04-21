import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
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
import { DndDragDirective } from '../../../core/drag-and-drop/dndDrag.directive';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import type {
  DragState,
  ShowSectionDragPayload,
} from '../../../core/drag-and-drop/drag.types';

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

/** Read the target duration of a section in whole minutes, or `null`
 *  when the section has no duration target (no target at all, or it
 *  uses the track-count mode instead). */
function targetMinutes(
  target?: TShowSectionViewModel['target'],
): number | null {
  if (!target || target.mode !== 'duration') return null;
  return Math.round(target.duration_s / 60);
}

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
    DndDragDirective,
    DndDropZoneDirective,
  ],
  templateUrl: './show-detail.component.html',
  styleUrl: './show-detail.component.scss',
})
export class ShowDetailComponent {
  readonly showId = input<TShowId | null>(null);

  protected readonly state = inject(ShowsStateService);
  private readonly mutations = inject(ShowsMutationService);
  private readonly dragSession = inject(DragSessionService);

  /** Ref to the rendered `.sections` container — used to read each
   *  section's bounding rect and compute the insertion slot under the
   *  cursor (playlist-tracks drag pattern). */
  private readonly sectionsEl =
    viewChild<ElementRef<HTMLElement>>('sectionsEl');

  /** `'show-section'` when the user is currently reordering a section,
   *  otherwise `null`. Drives the `.dragging` class on the source row
   *  and the visibility of the cursor-driven insertion bar. */
  protected readonly reorderingSectionId = computed<TShowSectionId | null>(
    () => {
      const drag = this.dragSession.current();
      return drag?.type === 'show-section'
        ? ((drag.data as ShowSectionDragPayload).sectionId as TShowSectionId)
        : null;
    },
  );

  protected readonly isReorderingSection = computed(
    () => this.reorderingSectionId() !== null,
  );

  /**
   * Insertion slot (0..sections.length) under the cursor while a
   * `show-section` drag is active, or `-1` when the cursor is outside
   * the container. Semantics: `i` means "drop before row i" so `0` is
   * "at the top" and `sections.length` is "at the end".
   *
   * Runs on every cursor move because it depends on
   * `DragSessionService.cursor()`.
   */
  protected readonly insertIndex = computed<number>(() => {
    if (!this.isReorderingSection()) return -1;
    const el = this.sectionsEl()?.nativeElement;
    if (!el) return -1;

    const cursor = this.dragSession.cursor();
    const bbox = el.getBoundingClientRect();
    if (
      cursor.x < bbox.left ||
      cursor.x > bbox.right ||
      cursor.y < bbox.top ||
      cursor.y > bbox.bottom
    ) {
      return -1;
    }

    const rows = el.querySelectorAll<HTMLElement>('.section');
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (cursor.y < r.top + r.height / 2) return i;
    }
    return rows.length;
  });

  /**
   * Y offset (in px, inside the scrollable container) at which to
   * render the insertion bar. `-1` hides the bar. Same maths as the
   * playlist detail — accounts for scrollTop so the bar tracks rows
   * that have been scrolled off the top.
   */
  protected readonly insertY = computed<number>(() => {
    const idx = this.insertIndex();
    if (idx < 0) return -1;
    const el = this.sectionsEl()?.nativeElement;
    if (!el) return -1;

    const rows = el.querySelectorAll<HTMLElement>('.section');
    const bbox = el.getBoundingClientRect();

    if (rows.length === 0) return 4;
    if (idx === 0) {
      return rows[0].getBoundingClientRect().top - bbox.top + el.scrollTop;
    }
    if (idx >= rows.length) {
      const last = rows[rows.length - 1].getBoundingClientRect();
      return last.bottom - bbox.top + el.scrollTop;
    }
    return rows[idx].getBoundingClientRect().top - bbox.top + el.scrollTop;
  });

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

  /** Inline-edit state for the show description. Multi-line textarea
   *  because descriptions tend to carry context (venue, setlist notes)
   *  that doesn't fit on one line. Submitting an empty string clears
   *  the description server-side. */
  protected readonly editingShowDescription = signal(false);
  protected readonly showDescriptionDraft = signal('');

  /** Inline-edit state for section names (one at a time). */
  protected readonly editingSectionId = signal<TShowSectionId | null>(null);
  protected readonly sectionNameDraft = signal('');

  /** Inline-edit state for section target duration (one at a time).
   *  Draft is the raw minutes string so the input stays untouched as
   *  the user types — commit parses + clamps to a positive integer. */
  protected readonly editingTargetId = signal<TShowSectionId | null>(null);
  protected readonly targetMinutesDraft = signal('');

  /** Inline-edit state for the whole-show duration target. */
  protected readonly editingShowTarget = signal(false);
  protected readonly showTargetMinutesDraft = signal('');

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
      // Drop any in-flight edit when the shown entity changes.
      this.editingShowName.set(false);
      this.editingShowDescription.set(false);
      this.editingSectionId.set(null);
      this.editingTargetId.set(null);
      this.editingShowTarget.set(false);
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

  // ── Show description (inline) ────────────────────────

  startEditShowDescription(): void {
    const show = this.detail();
    if (!show) return;
    this.showDescriptionDraft.set(show.description ?? '');
    this.editingShowDescription.set(true);
  }

  commitEditShowDescription(): void {
    const show = this.detail();
    if (!show) return;
    const next = this.showDescriptionDraft();
    const trimmed = next.trim();
    this.editingShowDescription.set(false);
    const current = show.description ?? '';
    if (trimmed === current.trim()) return;
    // Preserve intentional whitespace within the description but send
    // an empty string when the user cleared everything so the backend
    // drops the field (Zod schema accepts `''` as "no description").
    this.mutations.updateShow(show.id, {
      description: trimmed.length ? next : '',
    });
  }

  cancelEditShowDescription(): void {
    this.editingShowDescription.set(false);
  }

  /** Enter commits, Shift+Enter inserts a newline, Escape cancels. */
  onShowDescriptionKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.commitEditShowDescription();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditShowDescription();
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

  // ── Section target duration (inline) ─────────────────

  /** Start editing a section's target duration. Pre-fills the input
   *  with the current target-duration in minutes (or a sensible default
   *  of 15 min when the section has no target yet). */
  startEditTarget(section: TShowSectionViewModel): void {
    const current = targetMinutes(section.target) ?? 15;
    this.targetMinutesDraft.set(String(current));
    this.editingTargetId.set(section.id);
  }

  commitEditTarget(section: TShowSectionViewModel): void {
    const show = this.detail();
    if (!show) return;
    const raw = this.targetMinutesDraft().trim();
    this.editingTargetId.set(null);
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const current = targetMinutes(section.target);
    if (current === parsed) return;
    this.mutations.updateSection(show.id, section.id, {
      target: { mode: 'duration', duration_s: parsed * 60 },
    });
  }

  cancelEditTarget(): void {
    this.editingTargetId.set(null);
  }

  onTargetKey(event: KeyboardEvent, section: TShowSectionViewModel): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitEditTarget(section);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditTarget();
    }
  }

  /** Prompt helper for the integer-minutes input. Returns null when
   *  the user cancels or enters something non-positive. */
  private promptMinutes(question: string, fallback: number): number | null {
    const raw = window.prompt(question, String(fallback));
    if (raw === null) return null;
    const parsed = Number.parseInt(raw.trim(), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }

  /** Duration target for the section in seconds, or `null` when the
   *  section uses the track-count target mode (or has none). */
  targetSeconds(section: TShowSectionViewModel): number | null {
    return section.target?.mode === 'duration'
      ? section.target.duration_s
      : null;
  }

  /** Fill ratio in [0..1.5+] — clamped display only at render-time so
   *  the number stays truthful when the section overshoots the target. */
  fillRatio(section: TShowSectionViewModel): number | null {
    const target = this.targetSeconds(section);
    if (target === null || target <= 0) return null;
    return section.totalDurationSeconds / target;
  }

  /** Percentage label ("85%", "112%"). */
  fillPercent(section: TShowSectionViewModel): string | null {
    const ratio = this.fillRatio(section);
    if (ratio === null) return null;
    return `${Math.round(ratio * 100)}%`;
  }

  /** Progress-bar width in `0%–100%` — over-target rows still display
   *  100% but the `data-state` attribute tells the SCSS to paint them
   *  red so the overshoot reads at a glance. */
  fillWidth(section: TShowSectionViewModel): string {
    const ratio = this.fillRatio(section);
    if (ratio === null) return '0%';
    return `${Math.min(1, Math.max(0, ratio)) * 100}%`;
  }

  /**
   * Semantic state of the fill so the progress bar can tint itself:
   *  - `empty`  — no items yet
   *  - `under`  — below ~90% of the target (ease-in colour)
   *  - `near`   — 90%–105% (on target — accent green)
   *  - `over`   — >105% (alert — visual over-shoot warning)
   */
  fillState(
    section: TShowSectionViewModel,
  ): 'empty' | 'under' | 'near' | 'over' {
    const ratio = this.fillRatio(section);
    if (ratio === null || ratio === 0) return 'empty';
    if (ratio < 0.9) return 'under';
    if (ratio <= 1.05) return 'near';
    return 'over';
  }

  // ── Show-level target (inline edit on the header) ────

  showTargetSeconds(show: TShowSummaryViewModel): number | null {
    return show.totalDurationTargetSeconds ?? null;
  }

  showFillRatio(show: TShowSummaryViewModel): number | null {
    const target = this.showTargetSeconds(show);
    if (target === null || target <= 0) return null;
    return show.totalDurationSeconds / target;
  }

  showFillPercent(show: TShowSummaryViewModel): string | null {
    const ratio = this.showFillRatio(show);
    return ratio === null ? null : `${Math.round(ratio * 100)}%`;
  }

  showFillWidth(show: TShowSummaryViewModel): string {
    const ratio = this.showFillRatio(show);
    if (ratio === null) return '0%';
    return `${Math.min(1, Math.max(0, ratio)) * 100}%`;
  }

  showFillState(
    show: TShowSummaryViewModel,
  ): 'empty' | 'under' | 'near' | 'over' {
    const ratio = this.showFillRatio(show);
    if (ratio === null || ratio === 0) return 'empty';
    if (ratio < 0.9) return 'under';
    if (ratio <= 1.05) return 'near';
    return 'over';
  }

  startEditShowTarget(): void {
    const show = this.detail();
    if (!show) return;
    const current = show.totalDurationTargetSeconds
      ? Math.round(show.totalDurationTargetSeconds / 60)
      : 60;
    this.showTargetMinutesDraft.set(String(current));
    this.editingShowTarget.set(true);
  }

  commitEditShowTarget(): void {
    const show = this.detail();
    if (!show) return;
    const raw = this.showTargetMinutesDraft().trim();
    this.editingShowTarget.set(false);
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const currentMinutes = show.totalDurationTargetSeconds
      ? Math.round(show.totalDurationTargetSeconds / 60)
      : null;
    if (currentMinutes === parsed) return;
    this.mutations.updateShow(show.id, {
      totalDurationTargetSeconds: parsed * 60,
    });
  }

  cancelEditShowTarget(): void {
    this.editingShowTarget.set(false);
  }

  onShowTargetKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitEditShowTarget();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditShowTarget();
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
    const minutes = this.promptMinutes(
      'Target duration (minutes) — push yourself to hit it:',
      15,
    );
    if (minutes === null) return;
    this.mutations.addSection(show.id, name, {
      mode: 'duration',
      duration_s: minutes * 60,
    });
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

  /** Payload for a section's drag source — computed per-render so the
   *  template binding stays a stable reference. */
  sectionDragPayload(section: TShowSectionViewModel): ShowSectionDragPayload {
    return { sectionId: section.id, name: section.name };
  }

  /**
   * Drop handler for the cursor-driven sections reorder. Reads the
   * insertion slot from `insertIndex()` (computed from the cursor
   * position at drop time), normalises it to the "new position among
   * siblings" semantic the backend expects, and dispatches the full
   * ordered id list.
   */
  onSectionsReorderDrop(drag: DragState): void {
    if (drag.type !== 'show-section') return;
    const show = this.detail();
    if (!show) return;

    const idx = this.insertIndex();
    if (idx < 0) return;

    const payload = drag.data as ShowSectionDragPayload;
    const current = show.sections.map((s) => s.id);
    const fromIdx = current.indexOf(payload.sectionId);
    if (fromIdx === -1) return;

    // Drop-in-place (slot just before or just after the dragged row)
    // is a no-op — don't trigger an API round-trip for nothing.
    if (idx === fromIdx || idx === fromIdx + 1) return;

    // Translate the visual slot (the ghost still counts as occupying
    // its source row) into the post-removal slot the reorder endpoint
    // expects. Moving forward compensates for the removal shift.
    const newPosition = idx > fromIdx ? idx - 1 : idx;

    const next = current.slice();
    next.splice(fromIdx, 1);
    next.splice(newPosition, 0, payload.sectionId);

    this.mutations.reorderSections(show.id, next);
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

  durationsFor(
    target: TShowSummaryViewModel | TShowSectionViewModel,
  ): number[] {
    return target.durationSeries;
  }

  displayMean(mean: number | null): string {
    return mean === null ? '—' : mean.toFixed(1);
  }
}
