import { computed, inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import { RepertoireSelectorService } from './repertoire-selector.service';
import type { MusicVersion } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class VersionSelectorService {

  private state = inject(MusicLibraryStateService);
  private repertoireSelector = inject(RepertoireSelectorService);

  /** All versions. */
  versions = computed(() => this.state.library().versions);

  /** Map of entryId → MusicVersion[]. */
  versionsByEntryId = computed(() => {
    const map = new Map<string, MusicVersion[]>();
    for (const version of this.versions()) {
      const arr = map.get(version.entryId) ?? [];
      arr.push(version);
      map.set(version.entryId, arr);
    }
    return map;
  });

  /**
   * Map of referenceId → MusicVersion[].
   * Resolved by joining version.entryId → entry.referenceId.
   */
  versionsByReferenceId = computed(() => {
    const map = new Map<string, MusicVersion[]>();
    const entriesById = new Map(
      this.repertoireSelector.repertoire().map(e => [e.id, e])
    );

    for (const version of this.versions()) {
      const entry = entriesById.get(version.entryId);
      if (!entry) continue;
      const arr = map.get(entry.referenceId) ?? [];
      arr.push(version);
      map.set(entry.referenceId, arr);
    }
    return map;
  });
}
