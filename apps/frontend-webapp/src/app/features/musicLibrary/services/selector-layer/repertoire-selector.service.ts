import { computed, inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import type { RepertoireEntry } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class RepertoireSelectorService {

  private state = inject(MusicLibraryStateService);

  /** All repertoire entries. */
  repertoire = computed(() => this.state.library().repertoire);

  /** Map of referenceId to RepertoireEntry (first entry per referenceId for 'me' context). */
  entriesByReferenceId = computed(() => {
    const map = new Map<string, RepertoireEntry>();
    for (const entry of this.repertoire()) {
      if (!map.has(entry.referenceId)) {
        map.set(entry.referenceId, entry);
      }
    }
    return map;
  });

  /** Map of userId to array of RepertoireEntry objects for that user. */
  entriesByUserId = computed(() => {
    const map = new Map<string, RepertoireEntry[]>();
    for (const entry of this.repertoire()) {
      const arr = map.get(entry.userId) ?? [];
      arr.push(entry);
      map.set(entry.userId, arr);
    }
    return map;
  });
}
