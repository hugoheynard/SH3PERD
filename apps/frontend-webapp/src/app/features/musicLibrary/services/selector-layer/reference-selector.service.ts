import { computed, inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import type { MusicReference } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class ReferenceSelectorService {

  private state = inject(MusicLibraryStateService);

  /** All music references in the library. */
  references = computed(() => this.state.library().references);

  /** Map of reference ID to MusicReference for O(1) lookup. */
  referencesById = computed(() => {
    const map = new Map<string, MusicReference>();
    for (const ref of this.references()) {
      map.set(ref.id, ref);
    }
    return map;
  });

}
