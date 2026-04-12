import { Component, computed, input, signal } from '@angular/core';
import { RATING_DOTS, ratingLevel } from '../../../../shared/utils/rating.utils';
import type { ContractMember, CrossReferenceResult, CrossMemberVersion } from '../../music-library-types';

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

  readonly ratingDotsArr = RATING_DOTS;
  readonly ratingLevel = ratingLevel;

  setFilter(f: CompatFilter): void {
    this.compatFilter.set(f);
  }

  /** Get the quality from the favorite track of the first version. */
  versionQuality(mv: CrossMemberVersion): number | undefined {
    if (!mv.versions.length) return undefined;
    const favTrack = mv.versions[0].tracks.find(t => t.favorite);
    return favTrack?.analysisResult?.quality;
  }
}
