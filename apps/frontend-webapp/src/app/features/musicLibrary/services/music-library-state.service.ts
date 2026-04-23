import { computed, inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { MusicLibraryDataService } from './music-library-data.service';
import { MusicTabPersistenceService } from './music-tab-persistence.service';
import { MusicCrossLibraryService } from './music-cross-library.service';
import type {
  LibraryEntry,
  MusicLibraryState,
  MusicTabConfig,
} from '../music-library-types';
import type { TabStateSignal } from '../../../shared/configurable-tab-bar';

/**
 * Facade over the music library's three state slices.
 *
 * The three concerns used to live here in a 326-line class — data
 * (entries + HTTP), tab persistence (tabs + debounced save), and
 * cross-library (on-demand company fetch). Each moved to its own
 * single-responsibility service:
 *
 *   MusicLibraryDataService       → entries, loadLibrary, refreshEntries
 *   MusicTabPersistenceService    → tabs / savedTabConfigs / scheduleTabSave
 *   MusicCrossLibraryService      → crossContext, loadCrossLibrary
 *
 * This facade keeps the original public API (`library()`, `tabState`,
 * `loadLibrary()`, `refreshEntries()`, `scheduleTabSave()`,
 * `loadCrossLibrary()`, `snapshot()`, `updateState()`) so no call site
 * changes. New code should depend on the slice it actually needs; the
 * facade is for composition only.
 */
@Injectable({ providedIn: 'root' })
export class MusicLibraryStateService {
  private readonly data = inject(MusicLibraryDataService);
  private readonly tabs = inject(MusicTabPersistenceService);
  private readonly cross = inject(MusicCrossLibraryService);

  /** Combined snapshot — entries + tab slice + cross context, for selectors. */
  readonly library = computed<MusicLibraryState>(() => {
    const tab = this.tabs.state();
    const ctx = this.cross.context();
    return {
      entries: this.data.entries(),
      tabs: tab.tabs,
      activeTabId: tab.activeTabId,
      activeConfigId: tab.activeConfigId,
      savedTabConfigs: tab.savedTabConfigs ?? [],
      crossContext: ctx ?? undefined,
    };
  });

  /** Signal-like tab slice proxy — consumed directly by the mutation service. */
  readonly tabState: TabStateSignal<MusicTabConfig> = this.tabs.tabState;

  loadLibrary(): void {
    this.data.load();
    this.tabs.load();
  }

  refreshEntries(): Observable<LibraryEntry[]> {
    return this.data.refresh();
  }

  loadCrossLibrary(contractId: string): void {
    this.cross.load(contractId);
  }

  scheduleTabSave(): void {
    this.tabs.scheduleSave();
  }

  snapshot(): MusicLibraryState {
    return this.library();
  }

  /**
   * Back-compat escape hatch for the mutation service.
   *
   * Today only `MusicLibraryMutationService` uses this, and only to
   * rewrite `entries`. We route through the data slice rather than
   * let the facade reconstitute the whole state — the other slices
   * own their own writers and must not be touched from outside.
   */
  updateState(updater: (state: MusicLibraryState) => MusicLibraryState): void {
    this.data.updateEntries((entries) => {
      const next = updater({ ...this.library(), entries });
      return next.entries;
    });
  }
}
