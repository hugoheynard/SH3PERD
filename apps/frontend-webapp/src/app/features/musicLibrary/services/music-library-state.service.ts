import { computed, inject, Injectable, signal } from '@angular/core';
import { Subject, debounceTime, switchMap } from 'rxjs';
import type { MusicLibraryState, LibraryEntry, MusicTab, MusicTabConfig, SavedTabConfig } from '../music-library-types';
import type { TabStateAccessor, TabSystemState } from '../../../shared/configurable-tab-bar';
import { mockCrossContext } from '../utils/mock-music-data';
import { MusicLibraryApiService } from './music-library-api.service';
import { ToastService } from '../../../shared/toast/toast.service';
import type { TMusicTabConfig, TMusicSavedTabConfig } from '@sh3pherd/shared-types';

const DEFAULT_TABS: MusicTab[] = [
  {
    id: 'repertoire_me', title: 'My Repertoire', autoTitle: false,
    config: {
      searchConfig: { searchMode: 'repertoire', target: { mode: 'me' }, dataFilterActive: false },
      searchQuery: '',
    },
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

  /**
   * Accessor for the generic TabMutationService.
   * Reads/writes the tab-system slice of the full state.
   */
  readonly tabStateAccessor: TabStateAccessor<MusicTabConfig> = {
    get: () => {
      const s = this.state();
      return { tabs: s.tabs, activeTabId: s.activeTabId, activeConfigId: s.activeConfigId, savedTabConfigs: s.savedTabConfigs };
    },
    update: (updater: (s: TabSystemState<MusicTabConfig>) => TabSystemState<MusicTabConfig>) => {
      this.state.update(s => {
        const slice: TabSystemState<MusicTabConfig> = { tabs: s.tabs, activeTabId: s.activeTabId, activeConfigId: s.activeConfigId, savedTabConfigs: s.savedTabConfigs };
        const updated = updater(slice);
        return { ...s, ...updated };
      });
    },
  };

  constructor() {
    this.saveSubject.pipe(
      debounceTime(1000),
      switchMap(() => {
        const s = this.state();
        // Map from generic TabItem<MusicTabConfig> → flat TMusicTabConfig for backend
        const mapTab = (t: MusicTab): TMusicTabConfig => ({
          id: t.id, title: t.title, autoTitle: t.autoTitle, color: t.color,
          searchConfig: t.config?.searchConfig ?? { searchMode: 'repertoire', target: { mode: 'me' }, dataFilterActive: false },
          searchQuery: t.config?.searchQuery ?? '',
        });
        const tabs: TMusicTabConfig[] = s.tabs.map(mapTab);
        const savedTabConfigs: TMusicSavedTabConfig[] = (s.savedTabConfigs ?? []).map(cfg => ({
          ...cfg,
          tabs: cfg.tabs.map(mapTab),
        }));
        return this.libraryApi.saveTabConfigs({
          tabs,
          activeTabId: s.activeTabId,
          activeConfigId: s.activeConfigId ?? undefined,
          savedTabConfigs,
        });
      }),
    ).subscribe({
      next: (ok) => {
        if (!ok) this.toast.show('Failed to save tab config', 'error');
      },
      error: () => this.toast.show('Failed to save tab config', 'error'),
    });
  }

  loadLibrary(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.libraryApi.getMyLibrary().subscribe({
      next: (result) => {
        this.state.update(s => ({ ...s, entries: result.entries as LibraryEntry[] }));
      },
      error: (err) => {
        console.error('[MusicLibraryState] Failed to load library', err);
        this.loaded = false;
      },
    });

    this.libraryApi.getTabConfigs().subscribe({
      next: (configs) => {
        if (!configs) return;
        // Map from flat backend TMusicTabConfig → generic TabItem<MusicTabConfig>
        const rawTabs: MusicTab[] = configs.tabs.map(t => ({
          id: t.id, title: t.title, autoTitle: t.autoTitle, color: t.color,
          config: { searchConfig: t.searchConfig as any, searchQuery: t.searchQuery ?? '' },
        }));
        // Deduplicate by id
        const seen = new Set<string>();
        const tabs = rawTabs.filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });

        const savedTabConfigs: SavedTabConfig[] = ((configs.savedTabConfigs ?? []) as any[]).map(cfg => {
          const seenIds = new Set<string>();
          const cfgTabs: MusicTab[] = (cfg.tabs ?? []).map((t: any) => ({
            id: t.id, title: t.title, autoTitle: t.autoTitle, color: t.color,
            config: { searchConfig: t.searchConfig ?? t.config?.searchConfig, searchQuery: t.searchQuery ?? t.config?.searchQuery ?? '' },
          })).filter((t: MusicTab) => { if (seenIds.has(t.id)) return false; seenIds.add(t.id); return true; });
          return { ...cfg, tabs: cfgTabs };
        });

        this.state.update(s => ({
          ...s,
          tabs,
          activeTabId: configs.activeTabId,
          activeConfigId: (configs as any).activeConfigId ?? null,
          savedTabConfigs,
        }));
      },
      error: () => this.toast.show('Failed to load tab configs', 'error'),
    });
  }

  snapshot(): MusicLibraryState {
    return this.state();
  }

  updateState(updater: (state: MusicLibraryState) => MusicLibraryState): void {
    this.state.update(updater);
  }

  scheduleTabSave(): void {
    this.saveSubject.next();
  }
}
