import { TestBed } from '@angular/core/testing';
import { MusicTabMutationService } from './music-tab-mutation.service';
import { MusicLibraryStateService } from '../music-library-state.service';
import { MusicTabQuotaChecker } from '../music-tab-quota-checker.service';
import type {
  TabStateSignal,
  TabSystemState,
} from '../../../../shared/configurable-tab-bar';
import type { MusicTabConfig } from '../../music-library-types';

if (
  typeof globalThis.crypto === 'undefined' ||
  typeof globalThis.crypto.randomUUID !== 'function'
) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require('node:crypto');
  Object.defineProperty(globalThis, 'crypto', {
    value: nodeCrypto.webcrypto,
    configurable: true,
    writable: true,
  });
}

type State = TabSystemState<MusicTabConfig>;

function makeTab(
  id: string,
  overrides: Partial<MusicTabConfig> = {},
): State['tabs'][number] {
  return {
    id,
    title: `Tab ${id}`,
    autoTitle: false,
    config: {
      searchConfig: {
        searchMode: 'repertoire',
        target: { mode: 'me' },
        dataFilterActive: false,
      },
      searchQuery: '',
      ...overrides,
    },
  };
}

function makeSavedConfig(id: string, tabIds: string[]) {
  const tabs = tabIds.map((t) => makeTab(t));
  return {
    id,
    name: id,
    tabs,
    activeTabId: tabs[0]?.id ?? '',
    createdAt: 0,
  };
}

function setup(
  opts: {
    initial?: Partial<State>;
    canAddTab?: boolean;
    canAddConfig?: boolean;
    canMoveToConfig?: (id: string) => boolean;
  } = {},
) {
  let state: State = {
    tabs: opts.initial?.tabs ?? [makeTab('t1')],
    activeTabId: opts.initial?.activeTabId ?? 't1',
    activeConfigId: opts.initial?.activeConfigId ?? null,
    savedTabConfigs: opts.initial?.savedTabConfigs ?? [],
  };
  const tabState: TabStateSignal<MusicTabConfig> = Object.assign(() => state, {
    update: (fn: (s: State) => State) => {
      state = fn(state);
    },
  });
  const scheduleTabSave = jest.fn();

  const quotaMock = {
    canAddTab: jest.fn(() => opts.canAddTab ?? true),
    canAddConfig: jest.fn(() => opts.canAddConfig ?? true),
    canMoveToConfig: jest.fn((id: string) =>
      opts.canMoveToConfig ? opts.canMoveToConfig(id) : true,
    ),
  };

  TestBed.configureTestingModule({
    providers: [
      MusicTabMutationService,
      {
        provide: MusicLibraryStateService,
        useValue: { tabState, scheduleTabSave },
      },
      { provide: MusicTabQuotaChecker, useValue: quotaMock },
    ],
  });

  const service = TestBed.inject(MusicTabMutationService);
  return { service, getState: () => state, scheduleTabSave, quota: quotaMock };
}

describe('MusicTabMutationService', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('addDefaultTab (quota-gated)', () => {
    it('delegates to the base add when canAddTab is true', () => {
      const h = setup({ canAddTab: true });
      h.service.addDefaultTab();
      expect(h.getState().tabs).toHaveLength(2);
      expect(h.scheduleTabSave).toHaveBeenCalled();
    });

    it('no-ops when canAddTab is false (state untouched, no save scheduled)', () => {
      const h = setup({ canAddTab: false });
      h.service.addDefaultTab();
      expect(h.getState().tabs).toHaveLength(1);
      expect(h.scheduleTabSave).not.toHaveBeenCalled();
    });
  });

  describe('saveTabConfig (quota-gated)', () => {
    it('delegates when canAddConfig is true', () => {
      const h = setup({ canAddConfig: true });
      h.service.saveTabConfig('My Config');
      expect(h.getState().savedTabConfigs).toHaveLength(1);
      expect(h.getState().savedTabConfigs![0].name).toBe('My Config');
    });

    it('no-ops when canAddConfig is false', () => {
      const h = setup({ canAddConfig: false });
      h.service.saveTabConfig('Blocked');
      expect(h.getState().savedTabConfigs).toHaveLength(0);
      expect(h.scheduleTabSave).not.toHaveBeenCalled();
    });
  });

  describe('moveActiveTabToConfig / moveTabToConfig (quota-gated)', () => {
    it('moveActiveTabToConfig no-ops when target is locked', () => {
      const h = setup({
        initial: {
          tabs: [makeTab('t1'), makeTab('t2')],
          savedTabConfigs: [makeSavedConfig('c1', ['x'])],
        },
        canMoveToConfig: () => false,
      });
      h.service.moveActiveTabToConfig('t2', 'c1');
      expect(h.getState().savedTabConfigs![0].tabs.map((t) => t.id)).toEqual([
        'x',
      ]);
      expect(h.scheduleTabSave).not.toHaveBeenCalled();
    });

    it('moveTabToConfig no-ops when target is locked', () => {
      const h = setup({
        initial: {
          savedTabConfigs: [
            makeSavedConfig('src', ['a']),
            makeSavedConfig('dst', ['x']),
          ],
        },
        canMoveToConfig: () => false,
      });
      h.service.moveTabToConfig('src', 'dst', 'a');
      const configs = h.getState().savedTabConfigs!;
      expect(
        configs.find((c) => c.id === 'src')!.tabs.map((t) => t.id),
      ).toEqual(['a']);
      expect(
        configs.find((c) => c.id === 'dst')!.tabs.map((t) => t.id),
      ).toEqual(['x']);
    });

    it('allows the move when the checker returns true', () => {
      const h = setup({
        initial: {
          tabs: [makeTab('t1'), makeTab('t2')],
          savedTabConfigs: [makeSavedConfig('c1', [])],
        },
        canMoveToConfig: () => true,
      });
      h.service.moveActiveTabToConfig('t2', 'c1');
      expect(h.getState().savedTabConfigs![0].tabs).toHaveLength(1);
      expect(h.scheduleTabSave).toHaveBeenCalled();
    });
  });

  describe('music-specific patch mutations', () => {
    it('setSearchQuery patches only the target tab', () => {
      const h = setup({
        initial: { tabs: [makeTab('t1'), makeTab('t2')], activeTabId: 't1' },
      });
      h.service.setSearchQuery('t2', 'queen');
      expect(
        h.getState().tabs.find((t) => t.id === 't1')!.config.searchQuery,
      ).toBe('');
      expect(
        h.getState().tabs.find((t) => t.id === 't2')!.config.searchQuery,
      ).toBe('queen');
    });

    it('toggleDataFilter flips dataFilterActive on the tab', () => {
      const h = setup();
      h.service.toggleDataFilter('t1');
      expect(h.getState().tabs[0].config.searchConfig.dataFilterActive).toBe(
        true,
      );
      h.service.toggleDataFilter('t1');
      expect(h.getState().tabs[0].config.searchConfig.dataFilterActive).toBe(
        false,
      );
    });

    it('patchDataFilter merges into the tab’s dataFilter', () => {
      const h = setup();
      h.service.patchDataFilter('t1', { genres: ['Pop'] as never });
      h.service.patchDataFilter('t1', { bpm: { min: 80, max: 140 } });
      const filter = h.getState().tabs[0].config.searchConfig.dataFilter!;
      expect(filter.genres).toEqual(['Pop']);
      expect(filter.bpm).toEqual({ min: 80, max: 140 });
    });

    it('updateTabSearchConfig replaces the searchConfig wholesale', () => {
      const h = setup();
      h.service.updateTabSearchConfig('t1', {
        searchMode: 'cross',
        target: { mode: 'company', contractId: 'ct_1' } as never,
        dataFilterActive: true,
      });
      const sc = h.getState().tabs[0].config.searchConfig;
      expect(sc.searchMode).toBe('cross');
      expect(sc.dataFilterActive).toBe(true);
    });

    it('every music mutation schedules a save', () => {
      const h = setup();
      h.service.setSearchQuery('t1', 'x');
      h.service.toggleDataFilter('t1');
      h.service.patchDataFilter('t1', { genres: ['Pop'] as never });
      expect(h.scheduleTabSave).toHaveBeenCalledTimes(3);
    });
  });
});
