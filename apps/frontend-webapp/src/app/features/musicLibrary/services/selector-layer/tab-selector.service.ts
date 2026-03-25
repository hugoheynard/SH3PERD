import { computed, inject, Injectable } from '@angular/core';
import { MusicLibraryStateService } from '../music-library-state.service';
import { ReferenceSelectorService } from './reference-selector.service';
import { RepertoireSelectorService } from './repertoire-selector.service';
import { VersionSelectorService } from './version-selector.service';
import type { MusicDataFilter, MusicReference, MusicVersion, Rating } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class TabSelectorService {

  private state = inject(MusicLibraryStateService);
  private referenceSelector = inject(ReferenceSelectorService);
  private repertoireSelector = inject(RepertoireSelectorService);
  private versionSelector = inject(VersionSelectorService);

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

    const { searchMode, target, dataFilterActive, dataFilter } = tab.searchConfig;
    let results = this.referenceSelector.references();

    if (searchMode === 'repertoire' && target.mode === 'me') {
      const entriesByRefId = this.repertoireSelector.entriesByReferenceId();
      results = results.filter(ref => entriesByRefId.has(ref.id));
    }

    if (dataFilterActive && dataFilter) {
      const versionsByRefId = this.versionSelector.versionsByReferenceId();
      results = results.filter(ref => {
        const versions = versionsByRefId.get(ref.id) ?? [];
        return versions.some(v => this.versionMatchesFilter(v, dataFilter));
      });
    }

    return results;
  });

  private versionMatchesFilter(v: MusicVersion, f: MusicDataFilter): boolean {
    if (f.genres?.length  && !f.genres.includes(v.genre))              return false;
    if (f.mastery?.length && !f.mastery.includes(v.mastery as Rating)) return false;
    if (f.energy?.length  && !f.energy.includes(v.energy as Rating))   return false;
    if (f.effort?.length  && !f.effort.includes(v.effort as Rating))   return false;
    if (f.quality?.length) {
      // Quality filter only matches versions that have been analysed
      const q = v.analysisResult?.quality;
      if (!q || !f.quality.includes(q)) return false;
    }
    return true;
  }
}
