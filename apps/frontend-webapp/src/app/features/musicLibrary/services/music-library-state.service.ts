import { computed, inject, Injectable, signal } from '@angular/core';
import { Subject, debounceTime, switchMap } from 'rxjs';
import type { MusicLibraryState, LibraryEntry, MusicTab, SavedTabConfig } from '../music-library-types';
import { mockCrossContext } from '../utils/mock-music-data';
import { MusicLibraryApiService } from './music-library-api.service';
import { ToastService } from '../../../shared/toast/toast.service';
import type { TMusicTabConfig, TMusicSavedTabConfig } from '@sh3pherd/shared-types';

const DEFAULT_TABS: MusicTab[] = [
  {
    id: 'repertoire_me', title: 'My Repertoire', autoTitle: false, searchQuery: '',
    searchConfig: { searchMode: 'repertoire', target: { mode: 'me' }, dataFilterActive: false },
  },
];

@Injectable({ providedIn: 'root' })
export class MusicLibraryStateService {

  private readonly libraryApi = inject(MusicLibraryApiService);
  private readonly toast = inject(ToastService);

  private state = signal<MusicLibraryState>({
    entries: [],
    tabs: DEFAULT_TABS,
    activeTabId: 'repertoire_me',
    activeConfigId: null,
    savedTabConfigs: [],
    crossContext: mockCrossContext,
  });

  private loaded = false;
  private saveSubject = new Subject<void>();

  readonly library = computed(() => this.state());

  constructor() {
    this.saveSubject.pipe(
      debounceTime(1000),
      switchMap(() => {
        const s = this.state();
        const tabs: TMusicTabConfig[] = s.tabs.map(t => ({ ...t }));
        return this.libraryApi.saveTabConfigs({
          tabs,
          activeTabId: s.activeTabId,
          activeConfigId: s.activeConfigId ?? undefined,
          savedTabConfigs: s.savedTabConfigs as TMusicSavedTabConfig[],
        });
      }),
    ).subscribe({
      next: (ok) => {
        if (!ok) this.toast.show('Failed to save tab config', 'error');
      },
      error: () => this.toast.show('Failed to save tab config', 'error'),
    });
  }

  /**
   * Load the user's library and tab configs from the backend.
   * Called once on first access (e.g. from the music library page).
   */
  loadLibrary(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.libraryApi.getMyLibrary().subscribe({
      next: (result) => {
        this.state.update(s => ({
          ...s,
          entries: result.entries as LibraryEntry[],
        }));
      },
      error: (err) => {
        console.error('[MusicLibraryState] Failed to load library', err);
        this.loaded = false;
      },
    });

    this.libraryApi.getTabConfigs().subscribe({
      next: (configs) => {
        if (!configs) return;
        const tabs = configs.tabs.map(t => ({ ...t, searchQuery: t.searchQuery ?? '' })) as MusicTab[];
        this.state.update(s => ({
          ...s,
          tabs,
          activeTabId: configs.activeTabId,
          activeConfigId: (configs as any).activeConfigId ?? null,
          savedTabConfigs: configs.savedTabConfigs as SavedTabConfig[],
        }));
        this.toast.show('Tab configs loaded', 'success');
      },
      error: () => this.toast.show('Failed to load tab configs', 'error'),
    });
  }

  /** Return the current state value (for imperative reads). */
  snapshot(): MusicLibraryState {
    return this.state();
  }

  updateState(updater: (state: MusicLibraryState) => MusicLibraryState): void {
    this.state.update(updater);
  }

  /** Schedule a debounced save of tab configs to the backend. */
  scheduleTabSave(): void {
    this.saveSubject.next();
  }
}
