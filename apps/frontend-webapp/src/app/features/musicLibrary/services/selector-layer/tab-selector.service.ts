import { computed, inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import { ReferenceSelectorService } from './reference-selector.service';
import { RepertoireSelectorService } from './repertoire-selector.service';
import type { MusicReference } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class TabSelectorService {

  private state = inject(MusicLibraryStateService);
  private referenceSelector = inject(ReferenceSelectorService);
  private repertoireSelector = inject(RepertoireSelectorService);

  /** All tabs. */
  tabs = computed(() => this.state.library().tabs);

  /** The currently active tab ID. */
  activeTabId = computed(() => this.state.library().activeTabId);

  /** The active MusicTab object, or undefined if not found. */
  activeTab = computed(() => {
    const id = this.activeTabId();
    return this.tabs().find(t => t.id === id);
  });

  /**
   * Returns the filtered list of music references based on the active tab's search config.
   *
   * - mode='repertoire': only references that have a repertoire entry for the current user
   * - mode='cross' | 'shared' | 'match': all references (future backend-driven filtering)
   */
  activeResults = computed((): MusicReference[] => {
    const tab = this.activeTab();
    if (!tab) return this.referenceSelector.references();

    const { searchMode, target } = tab.searchConfig;
    let results = this.referenceSelector.references();

    if (searchMode === 'repertoire' && target.mode === 'me') {
      const entriesByRefId = this.repertoireSelector.entriesByReferenceId();
      results = results.filter(ref => entriesByRefId.has(ref.id));
    }

    return results;
  });
}
