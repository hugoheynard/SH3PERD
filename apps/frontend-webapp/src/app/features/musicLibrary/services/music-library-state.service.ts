import { computed, inject, Injectable, signal } from '@angular/core';
import { Subject, debounceTime, switchMap } from 'rxjs';
import type { MusicLibraryState, LibraryEntry, MusicTab, MusicTabConfig, MusicSearchConfig, MusicDataFilter, MusicGenre, Rating, SavedTabConfig } from '../music-library-types';
import type { TabStateSignal, TabSystemState } from '../../../shared/configurable-tab-bar';
import { mockCrossContext } from '../utils/mock-music-data';
import { MusicLibraryApiService } from './music-library-api.service';
import { ToastService } from '../../../shared/toast/toast.service';
import type { TMusicTabConfig, TMusicSavedTabConfig, TMusicSearchConfig } from '@sh3pherd/shared-types';

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

  /** Signal-like view over the tab-system slice of the full state */
  readonly tabState: TabStateSignal<MusicTabConfig> = Object.assign(
    () => {
      const s = this.state();
      return { tabs: s.tabs, activeTabId: s.activeTabId, activeConfigId: s.activeConfigId, savedTabConfigs: s.savedTabConfigs };
    },
    {
      update: (updater: (s: TabSystemState<MusicTabConfig>) => TabSystemState<MusicTabConfig>) => {
        this.state.update(s => {
          const slice: TabSystemState<MusicTabConfig> = { tabs: s.tabs, activeTabId: s.activeTabId, activeConfigId: s.activeConfigId, savedTabConfigs: s.savedTabConfigs };
          return { ...s, ...updater(slice) };
        });
      },
    },
  );

  constructor() {
    this.saveSubject.pipe(
      debounceTime(1000),
      switchMap(() => {
        const s = this.state();
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

        const mapDataFilter = (df: NonNullable<TMusicSearchConfig['dataFilter']>): MusicDataFilter => ({
          genres: df.genres as MusicGenre[] | undefined,
          mastery: df.mastery as Rating[] | undefined,
          energy: df.energy as Rating[] | undefined,
          effort: df.effort as Rating[] | undefined,
          quality: df.quality as Rating[] | undefined,
          bpm: df.bpm,
          duration: df.duration,
        });

        const mapSearchConfig = (sc: TMusicSearchConfig): MusicSearchConfig => ({
          searchMode: sc.searchMode,
          target: sc.target,
          dataFilterActive: sc.dataFilterActive,
          dataFilter: sc.dataFilter ? mapDataFilter(sc.dataFilter) : undefined,
        });

        const mapTab = (t: TMusicTabConfig): MusicTab => ({
          id: t.id, title: t.title, autoTitle: t.autoTitle, color: t.color,
          config: { searchConfig: mapSearchConfig(t.searchConfig), searchQuery: t.searchQuery ?? '' },
        });

        const dedup = <T extends { id: string }>(items: T[]): T[] => {
          const seen = new Set<string>();
          return items.filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });
        };

        const tabs = dedup(configs.tabs.map(mapTab));

        const savedTabConfigs: SavedTabConfig[] = (configs.savedTabConfigs ?? []).map((cfg: TMusicSavedTabConfig) => ({
          id: cfg.id,
          name: cfg.name,
          activeTabId: cfg.activeTabId,
          createdAt: cfg.createdAt,
          tabs: dedup(cfg.tabs.map(mapTab)),
        }));

        this.state.update(s => ({
          ...s,
          tabs,
          activeTabId: configs.activeTabId,
          activeConfigId: configs.activeConfigId ?? null,
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
