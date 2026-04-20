import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type OnInit,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { TShowId, TShowSummaryViewModel } from '@sh3pherd/shared-types';
import { ShowsStateService } from '../services/shows-state.service';
import { ShowsMutationService } from '../services/shows-mutation.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';

@Component({
  selector: 'app-shows-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    EmptyStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './shows-page.component.html',
  styleUrl: './shows-page.component.scss',
})
export class ShowsPageComponent implements OnInit {
  protected readonly state = inject(ShowsStateService);
  private readonly mutations = inject(ShowsMutationService);

  ngOnInit(): void {
    this.state.loadSummaries();
  }

  onCreate(): void {
    const name = window.prompt('Show name')?.trim();
    if (!name) return;
    this.mutations.createShow({ name, color: 'indigo' });
  }

  onDuplicate(event: Event, show: TShowSummaryViewModel): void {
    event.preventDefault();
    event.stopPropagation();
    this.mutations.duplicateShow(show.id);
  }

  onDelete(event: Event, show: TShowSummaryViewModel): void {
    event.preventDefault();
    event.stopPropagation();
    if (
      !window.confirm(`Delete "${show.name}"? Sections and items are removed.`)
    )
      return;
    this.mutations.deleteShow(show.id);
  }

  trackById(_: number, s: { id: TShowId }): TShowId {
    return s.id;
  }

  formatDuration(seconds: number): string {
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm === 0 ? `${h}h` : `${h}h ${rm}m`;
  }
}
