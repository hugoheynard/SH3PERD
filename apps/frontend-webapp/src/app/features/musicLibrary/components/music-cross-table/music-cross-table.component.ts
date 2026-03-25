import { Component, computed, input, signal } from '@angular/core';
import type { ContractMember, CrossReferenceResult } from '../../music-library-types';

type CompatFilter = 'all' | 'duo' | 'trio' | 'quartet';

@Component({
  selector: 'app-music-cross-table',
  standalone: true,
  templateUrl: './music-cross-table.component.html',
  styleUrl: './music-cross-table.component.scss',
})
export class MusicCrossTableComponent {
  readonly members = input.required<ContractMember[]>();
  readonly results = input.required<CrossReferenceResult[]>();

  compatFilter = signal<CompatFilter>('all');

  readonly filtered = computed(() => {
    const min = { all: 1, duo: 2, trio: 3, quartet: 4 }[this.compatFilter()];
    return this.results().filter(r => r.compatibleCount >= min);
  });

  readonly ratingDotsArr = [1, 2, 3, 4];

  setFilter(f: CompatFilter): void {
    this.compatFilter.set(f);
  }

  ratingLevel(val: number): string {
    if (val >= 4) return 'max';
    if (val >= 3) return 'high';
    if (val >= 2) return 'medium';
    return 'low';
  }
}
