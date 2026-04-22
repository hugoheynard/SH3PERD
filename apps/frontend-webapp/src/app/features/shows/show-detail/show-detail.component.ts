import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type {
  TShowId,
  TShowSectionId,
  TShowSectionViewModel,
} from '@sh3pherd/shared-types';
import { SectionMutationService } from '../services/mutations-layer/section-mutation.service';
import { ShowsDndInitService } from '../services/shows-dnd-init.service';
import { ButtonComponent } from '../../../shared/button/button.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { TargetBarComponent } from '../../../shared/target-bar/target-bar.component';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import type {
  DragState,
  ShowSectionDragPayload,
} from '../../../core/drag-and-drop/drag.types';
import { LayoutService } from '../../../core/services/layout.service';
import {
  NewSectionPopoverComponent,
  type NewSectionPopoverData,
} from '../new-section-popover/new-section-popover.component';
import { ShowDetailHeaderComponent } from '../show-detail-header/show-detail-header.component';
import { ShowSectionComponent } from '../show-section/show-section.component';
import { ShowSectionHeaderComponent } from '../show-section-header/show-section-header.component';
import { ShowSectionFooterComponent } from '../show-section-footer/show-section-footer.component';
import { ShowDetailStateService } from './show-detail-state.service';

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
    ButtonComponent,
    IconComponent,
    LoadingStateComponent,
    TargetBarComponent,
    ShowDetailHeaderComponent,
    ShowSectionComponent,
    ShowSectionHeaderComponent,
    ShowSectionFooterComponent,
    DndDropZoneDirective,
  ],
  templateUrl: './show-detail.component.html',
  styleUrl: './show-detail.component.scss',
})
export class ShowDetailComponent {
  readonly showId = input<TShowId | null>(null);

  private readonly detailState = inject(ShowDetailStateService);
  private readonly sectionMutations = inject(SectionMutationService);
  private readonly dragSession = inject(DragSessionService);
  private readonly layout = inject(LayoutService);

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

  protected readonly detail = this.detailState.detail;
  protected readonly loading = this.detailState.loading;
  protected readonly singleMode = this.detailState.singleMode;

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
        this.detailState.loadDetail(id);
      } else {
        this.detailState.clearDetail();
      }
      this.detailState.resetHeaderState();
    });
  }

  // ── Section target duration ──────────────────────────

  /** Duration target for the section in seconds, or `null` when the
   *  section uses the track-count target mode (or has none). Feeds the
   *  `<app-target-bar>` input. */
  targetSeconds(section: TShowSectionViewModel): number | null {
    return section.target?.mode === 'duration'
      ? section.target.duration_s
      : null;
  }

  /** Commit from `<app-target-bar>` for a section — component has
   *  already validated + diffed the minutes value. */
  updateSectionTargetMinutes(
    section: TShowSectionViewModel,
    minutes: number,
  ): void {
    const show = this.detail();
    if (!show) return;
    this.sectionMutations.updateSection(show.id, section.id, {
      target: { mode: 'duration', duration_s: minutes * 60 },
    });
  }

  onAddSection(): void {
    const show = this.detail();
    if (!show) return;
    this.layout.setPopover<NewSectionPopoverComponent, NewSectionPopoverData>(
      NewSectionPopoverComponent,
      {
        showId: show.id,
        defaultName: `Set ${show.sections.length + 1}`,
      },
    );
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

    this.sectionMutations.reorderSections(show.id, next);
  }

  trackSection(_: number, s: TShowSectionViewModel): TShowSectionId {
    return s.id;
  }
}
