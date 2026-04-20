import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import type {
  TShowId,
  TShowSectionId,
  TShowSectionItemView,
  TShowSectionViewModel,
} from '@sh3pherd/shared-types';
import { ShowsStateService } from '../services/shows-state.service';
import { ShowsMutationService } from '../services/shows-mutation.service';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';

@Component({
  selector: 'app-show-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, LoadingStateComponent],
  templateUrl: './show-detail-page.component.html',
  styleUrl: './show-detail-page.component.scss',
})
export class ShowDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly state = inject(ShowsStateService);
  private readonly mutations = inject(ShowsMutationService);
  private readonly router = inject(Router);

  // ActivatedRoute.paramMap is the straightforward way to read `:id`
  // without requiring `withComponentInputBinding()` in app.config.
  private readonly paramMap = toSignal(this.route.paramMap);
  private readonly id = computed<TShowId | null>(() => {
    const v = this.paramMap()?.get('id');
    return v ? (v as TShowId) : null;
  });

  protected readonly detail = this.state.detail;
  protected readonly loading = this.state.detailLoadingFor;
  protected readonly singleMode = computed(
    () => (this.detail()?.sections.length ?? 0) <= 1,
  );

  constructor() {
    // Re-fetch whenever the route id changes (incl. first load).
    effect(() => {
      const id = this.id();
      if (id) this.state.loadDetail(id);
    });
  }

  onRenameShow(): void {
    const show = this.detail();
    if (!show) return;
    const name = window.prompt('Show name', show.name)?.trim();
    if (!name || name === show.name) return;
    this.mutations.updateShow(show.id, { name });
  }

  onDelete(): void {
    const show = this.detail();
    if (!show) return;
    if (!window.confirm(`Delete "${show.name}"?`)) return;
    this.mutations.deleteShow(show.id);
    this.router.navigate(['/app/shows']);
  }

  onDuplicate(): void {
    const show = this.detail();
    if (!show) return;
    this.mutations.duplicateShow(show.id);
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

  onRenameSection(section: TShowSectionViewModel): void {
    const show = this.detail();
    if (!show) return;
    const name = window.prompt('Section name', section.name)?.trim();
    if (!name || name === section.name) return;
    this.mutations.updateSection(show.id, section.id, { name });
  }

  onRemoveSection(section: TShowSectionViewModel): void {
    const show = this.detail();
    if (!show || show.sections.length <= 1) return;
    if (!window.confirm(`Remove section "${section.name}"?`)) return;
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
}
