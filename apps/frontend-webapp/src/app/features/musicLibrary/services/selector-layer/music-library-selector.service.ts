import { computed, inject, Injectable } from '@angular/core';
import { ReferenceSelectorService } from './reference-selector.service';
import { RepertoireSelectorService } from './repertoire-selector.service';
import { TabSelectorService } from './tab-selector.service';
import { VersionSelectorService } from './version-selector.service';

/**
 * Facade selector service for the Music Library feature.
 *
 * Injects all sub-selectors and re-exposes their signals as a unified API.
 * Components should inject this service rather than individual selectors.
 *
 * Also computes aggregated stats across the library.
 */
@Injectable({ providedIn: 'root' })
export class MusicLibrarySelectorService {

  private referenceSelector = inject(ReferenceSelectorService);
  private repertoireSelector = inject(RepertoireSelectorService);
  private tabSelector = inject(TabSelectorService);
  private versionSelector = inject(VersionSelectorService);

  /* ─── References ────────────────────────────────────── */

  references = this.referenceSelector.references;
  referencesById = this.referenceSelector.referencesById;

  /* ─── Repertoire ─────────────────────────────────────── */

  repertoire = this.repertoireSelector.repertoire;
  entriesByReferenceId = this.repertoireSelector.entriesByReferenceId;
  entriesByUserId = this.repertoireSelector.entriesByUserId;

  /* ─── Versions ───────────────────────────────────────── */

  versions = this.versionSelector.versions;
  versionsByEntryId = this.versionSelector.versionsByEntryId;
  versionsByReferenceId = this.versionSelector.versionsByReferenceId;

  /* ─── Tabs ───────────────────────────────────────────── */

  tabs = this.tabSelector.tabs;
  activeTabId = this.tabSelector.activeTabId;
  activeTab = this.tabSelector.activeTab;
  activeResults = this.tabSelector.activeResults;

  /* ─── Stats ──────────────────────────────────────────── */

  /** Total number of music references in the library. */
  totalReferences = computed(() => this.references().length);

  /** Total number of repertoire entries across all users. */
  totalRepertoireEntries = computed(() => this.repertoire().length);

  /**
   * Average mastery rating across all repertoire entries.
   * Returns 0 if no entries exist.
   */
  averageMastery = computed(() => {
    const versions = this.versions();
    if (versions.length === 0) return 0;
    const sum = versions.reduce((acc, v) => acc + v.mastery, 0);
    return Math.round((sum / versions.length) * 10) / 10;
  });
}
