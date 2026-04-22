import { computed, inject, Injectable, signal } from '@angular/core';
import type {
  TShowAxisCriterion,
  TShowAxisKey,
  TShowId,
  TShowSectionViewModel,
  TShowSummaryViewModel,
} from '@sh3pherd/shared-types';
import { LayoutService } from '../../../core/services/layout.service';
import { ShowMutationService } from '../services/mutations-layer/show-mutation.service';
import { ShowsStateService } from '../services/shows-state.service';
import {
  ShowSettingsPopoverComponent,
  type ShowSettingsPopoverData,
} from '../show-settings-popover/show-settings-popover.component';
import { RATING_AXES } from '../../../shared/music-analytics/rating-axes';
import type { RatingRowGroup } from '../../../shared/music-analytics/rating-row/rating-row.component';

@Injectable({ providedIn: 'root' })
export class ShowDetailStateService {
  private readonly showsState = inject(ShowsStateService);
  private readonly mutations = inject(ShowMutationService);
  private readonly layout = inject(LayoutService);

  readonly detail = this.showsState.detail;
  readonly loading = this.showsState.detailLoadingFor;
  readonly singleMode = computed(
    () => (this.detail()?.sections.length ?? 0) <= 1,
  );

  /** Full 4-axis row for the show header — mean + series + criterion
   *  label + out-of-range tint, pre-computed so the template is a
   *  one-liner. Re-evaluates when `detail` changes. */
  readonly showHeaderGroups = computed<RatingRowGroup[]>(() => {
    const show = this.detail();
    return show ? this.buildRatingRow(show) : [];
  });

  readonly editingShowName = signal(false);
  readonly showNameDraft = signal('');
  readonly editingShowDescription = signal(false);
  readonly showDescriptionDraft = signal('');

  loadDetail(id: TShowId): void {
    this.showsState.loadDetail(id);
  }

  clearDetail(): void {
    this.showsState.clearDetail();
    this.resetHeaderState();
  }

  resetHeaderState(): void {
    this.editingShowName.set(false);
    this.editingShowDescription.set(false);
  }

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
    this.mutations.updateShow(show.id, {
      description: trimmed.length ? next : '',
    });
  }

  cancelEditShowDescription(): void {
    this.editingShowDescription.set(false);
  }

  onShowDescriptionKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.commitEditShowDescription();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditShowDescription();
    }
  }

  /** Commit from `<app-target-bar>` — the component has already
   *  validated + diffed the minutes value. */
  updateShowTargetMinutes(minutes: number): void {
    const show = this.detail();
    if (!show) return;
    this.mutations.updateShow(show.id, {
      totalDurationTargetSeconds: minutes * 60,
    });
  }

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

  openShowSettings(): void {
    const show = this.detail();
    if (!show) return;
    this.layout.setPopover<
      ShowSettingsPopoverComponent,
      ShowSettingsPopoverData
    >(ShowSettingsPopoverComponent, { showId: show.id });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes === 0
      ? `${hours}h`
      : `${hours}h ${remainingMinutes}m`;
  }

  scheduleLabel(startAt: number | undefined): string | null {
    if (!startAt) return null;
    const date = new Date(startAt);
    if (!Number.isFinite(date.getTime())) return null;
    const datePart = date.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    if (date.getHours() === 0 && date.getMinutes() === 0) return datePart;
    const timePart = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart} · ${timePart}`;
  }

  /** Show/section → RatingRowGroup[] with criterion label + out-of-range
   *  tint applied per axis. Feeds `<app-rating-row>` in header + footer. */
  buildRatingRow(
    target: TShowSummaryViewModel | TShowSectionViewModel,
  ): RatingRowGroup[] {
    return RATING_AXES.map((axis) => {
      const criterion = criterionFor(target, axis.axisKey);
      const mean = target[axis.meanKey];
      return {
        label: axis.label,
        accent: axis.accent,
        mean,
        series: target[axis.seriesKey],
        criterion: criterion ? criterionLabel(criterion) : null,
        outOfRange: criterion ? outOfRange(mean, criterion) : false,
      };
    });
  }
}

function criterionFor(
  target: TShowSummaryViewModel | TShowSectionViewModel,
  axisKey: TShowAxisKey,
): TShowAxisCriterion | null {
  return (
    target.axisCriteria?.find((criterion) => criterion.axis === axisKey) ?? null
  );
}

function criterionLabel(criterion: TShowAxisCriterion): string {
  const { min, max } = criterion;
  if (min !== undefined && max !== undefined) {
    return `${formatRating(min)}–${formatRating(max)}`;
  }
  if (min !== undefined) return `≥ ${formatRating(min)}`;
  if (max !== undefined) return `≤ ${formatRating(max)}`;
  return '—';
}

function outOfRange(
  mean: number | null,
  criterion: TShowAxisCriterion,
): boolean {
  if (mean === null) return false;
  if (criterion.min !== undefined && mean < criterion.min) return true;
  if (criterion.max !== undefined && mean > criterion.max) return true;
  return false;
}

function formatRating(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
