import { computed, inject, Injectable, signal } from '@angular/core';
import type {
  TShowAxisCriterion,
  TShowAxisKey,
  TShowId,
  TShowSummaryViewModel,
} from '@sh3pherd/shared-types';
import { LayoutService } from '../../../core/services/layout.service';
import { ShowsMutationService } from '../services/shows-mutation.service';
import { ShowsStateService } from '../services/shows-state.service';
import {
  ShowSettingsPopoverComponent,
  type ShowSettingsPopoverData,
} from '../show-settings-popover/show-settings-popover.component';
import {
  SHOW_DETAIL_RATING_AXES,
  type ShowDetailRatingAxis,
} from './show-detail.constants';

@Injectable()
export class ShowDetailStateService {
  private readonly showsState = inject(ShowsStateService);
  private readonly mutations = inject(ShowsMutationService);
  private readonly layout = inject(LayoutService);

  readonly detail = this.showsState.detail;
  readonly loading = this.showsState.detailLoadingFor;
  readonly singleMode = computed(
    () => (this.detail()?.sections.length ?? 0) <= 1,
  );
  readonly axes = SHOW_DETAIL_RATING_AXES;

  readonly editingShowName = signal(false);
  readonly showNameDraft = signal('');
  readonly editingShowDescription = signal(false);
  readonly showDescriptionDraft = signal('');
  readonly editingShowTarget = signal(false);
  readonly showTargetMinutesDraft = signal('');

  readonly showHeaderMeanFor = (
    show: TShowSummaryViewModel,
    axis: unknown,
  ): number | null => this.meanFor(show, axis as ShowDetailRatingAxis);

  readonly showHeaderSeriesFor = (
    show: TShowSummaryViewModel,
    axis: unknown,
  ): (number | null)[] => this.seriesFor(show, axis as ShowDetailRatingAxis);

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
    this.editingShowTarget.set(false);
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

  meanFor(
    target: TShowSummaryViewModel,
    axis: ShowDetailRatingAxis,
  ): number | null {
    return target[axis.meanKey];
  }

  seriesFor(
    target: TShowSummaryViewModel,
    axis: ShowDetailRatingAxis,
  ): (number | null)[] {
    return target[axis.seriesKey];
  }

  durationsFor(target: TShowSummaryViewModel): number[] {
    return target.durationSeries;
  }

  displayMean(mean: number | null): string {
    return mean === null ? '—' : mean.toFixed(1);
  }

  criterionFor(
    target: TShowSummaryViewModel,
    axisKey: TShowAxisKey,
  ): TShowAxisCriterion | null {
    return (
      target.axisCriteria?.find((criterion) => criterion.axis === axisKey) ??
      null
    );
  }

  criterionLabel(criterion: TShowAxisCriterion): string {
    const min = criterion.min;
    const max = criterion.max;
    if (min !== undefined && max !== undefined) {
      return `${formatRating(min)}–${formatRating(max)}`;
    }
    if (min !== undefined) return `≥ ${formatRating(min)}`;
    if (max !== undefined) return `≤ ${formatRating(max)}`;
    return '—';
  }

  isMeanOutOfRange(
    target: TShowSummaryViewModel,
    axisKey: TShowAxisKey,
  ): boolean {
    const criterion = this.criterionFor(target, axisKey);
    if (!criterion) return false;
    const mean = this.meanForAxisKey(target, axisKey);
    if (mean === null) return false;
    if (criterion.min !== undefined && mean < criterion.min) return true;
    if (criterion.max !== undefined && mean > criterion.max) return true;
    return false;
  }

  private meanForAxisKey(
    target: TShowSummaryViewModel,
    axisKey: TShowAxisKey,
  ): number | null {
    switch (axisKey) {
      case 'mastery':
        return target.meanMastery;
      case 'energy':
        return target.meanEnergy;
      case 'effort':
        return target.meanEffort;
      case 'quality':
        return target.meanQuality;
    }
  }
}

function formatRating(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
