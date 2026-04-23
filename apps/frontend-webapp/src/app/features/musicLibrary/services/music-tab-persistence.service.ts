import { computed, inject, Injectable, signal } from '@angular/core';
import { Subject, debounceTime, switchMap } from 'rxjs';
import type {
  TMusicSavedTabConfig,
  TMusicSearchConfig,
  TMusicTabConfig,
} from '@sh3pherd/shared-types';
import { MusicLibraryApiService } from './music-library-api.service';
import { ToastService } from '../../../shared/toast/toast.service';
import type {
  TabStateSignal,
  TabSystemState,
} from '../../../shared/configurable-tab-bar';
import type {
  MusicDataFilter,
  MusicGenre,
  MusicSearchConfig,
  MusicTab,
  MusicTabConfig,
  Rating,
  SavedTabConfig,
} from '../music-library-types';

/**
 * Tab bar persistence — tabs + saved tab configs + their debounced save.
 *
 * Lives outside `MusicLibraryStateService` so the responsibility is
 * clear: remember what the user sees in the tab strip + what they have
 * saved as named configs, nothing else. The tab mutation service binds
 * to `tabState` here; the facade re-exports the same signal so existing
 * callers don't care about the split.
 */

const DEFAULT_TABS: MusicTab[] = [
  {
    id: 'repertoire_me',
    title: 'My Repertoire',
    autoTitle: false,
    config: {
      searchConfig: {
        searchMode: 'repertoire',
        target: { mode: 'me' },
        dataFilterActive: false,
      },
      searchQuery: '',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class MusicTabPersistenceService {
  private readonly libraryApi = inject(MusicLibraryApiService);
  private readonly toast = inject(ToastService);

  private readonly _state = signal<TabSystemState<MusicTabConfig>>({
    tabs: DEFAULT_TABS,
    activeTabId: 'repertoire_me',
    activeConfigId: null,
    savedTabConfigs: [],
  });

  /** Read-only view for the facade + selectors. */
  readonly state = computed(() => this._state());

  /** Signal-like view — consumed directly by `TabMutationService`. */
  readonly tabState: TabStateSignal<MusicTabConfig> = Object.assign(
    () => this._state(),
    {
      update: (
        updater: (
          s: TabSystemState<MusicTabConfig>,
        ) => TabSystemState<MusicTabConfig>,
      ) => {
        this._state.update(updater);
      },
    },
  );

  private readonly saveSubject = new Subject<void>();

  constructor() {
    this.saveSubject
      .pipe(
        debounceTime(1000),
        switchMap(() => {
          const s = this._state();
          const tabs: TMusicTabConfig[] = s.tabs.map(toApiTab);
          const savedTabConfigs: TMusicSavedTabConfig[] = (
            s.savedTabConfigs ?? []
          ).map((cfg) => ({ ...cfg, tabs: cfg.tabs.map(toApiTab) }));
          return this.libraryApi.saveTabConfigs({
            tabs,
            activeTabId: s.activeTabId,
            activeConfigId: s.activeConfigId ?? undefined,
            savedTabConfigs,
          });
        }),
      )
      .subscribe({
        next: (ok) => {
          if (!ok) this.toast.show('Failed to save tab config', 'error');
        },
        error: () => this.toast.show('Failed to save tab config', 'error'),
      });
  }

  /** Fetch the user's persisted tab layout. Silent no-op if the server returns null. */
  load(): void {
    this.libraryApi.getTabConfigs().subscribe({
      next: (configs) => {
        if (!configs) return;

        const tabs = dedupById(configs.tabs.map(fromApiTab));
        const savedTabConfigs: SavedTabConfig[] = (
          configs.savedTabConfigs ?? []
        ).map((cfg: TMusicSavedTabConfig) => ({
          id: cfg.id,
          name: cfg.name,
          activeTabId: cfg.activeTabId,
          createdAt: cfg.createdAt,
          tabs: dedupById(cfg.tabs.map(fromApiTab)),
        }));

        this._state.update((s) => ({
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

  /** Debounced persistence trigger — called by every tab mutation. */
  scheduleSave(): void {
    this.saveSubject.next();
  }
}

// ─── Mappers ─────────────────────────────────────────────────

function toApiTab(t: MusicTab): TMusicTabConfig {
  return {
    id: t.id,
    title: t.title,
    autoTitle: t.autoTitle,
    color: t.color,
    searchConfig: t.config?.searchConfig ?? {
      searchMode: 'repertoire',
      target: { mode: 'me' },
      dataFilterActive: false,
    },
    searchQuery: t.config?.searchQuery ?? '',
  };
}

function fromApiTab(t: TMusicTabConfig): MusicTab {
  return {
    id: t.id,
    title: t.title,
    autoTitle: t.autoTitle,
    color: t.color,
    config: {
      searchConfig: fromApiSearchConfig(t.searchConfig),
      searchQuery: t.searchQuery ?? '',
    },
  };
}

function fromApiSearchConfig(sc: TMusicSearchConfig): MusicSearchConfig {
  return {
    searchMode: sc.searchMode,
    target: sc.target,
    dataFilterActive: sc.dataFilterActive,
    dataFilter: sc.dataFilter ? fromApiDataFilter(sc.dataFilter) : undefined,
  };
}

function fromApiDataFilter(
  df: NonNullable<TMusicSearchConfig['dataFilter']>,
): MusicDataFilter {
  return {
    genres: df.genres as MusicGenre[] | undefined,
    mastery: df.mastery as Rating[] | undefined,
    energy: df.energy as Rating[] | undefined,
    effort: df.effort as Rating[] | undefined,
    quality: df.quality as Rating[] | undefined,
    bpm: df.bpm,
    duration: df.duration,
  };
}

function dedupById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}
