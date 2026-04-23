import type {
  TabItem,
  SavedTabConfig,
  TabStateSignal,
  TabSystemState,
} from './configurable-tab-bar.types';
import { TabMutationService } from './tab-mutation.service';

// ── Crypto polyfill ──────────────────────────────────────────
// jsdom (used by jest-preset-angular) doesn't always ship
// `crypto.randomUUID`, which the production mutation service calls
// when creating new tab ids. Install the node implementation once
// before anything in this suite runs.
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

// ── Test fixture ──────────────────────────────────────────────
// `TabMutationService` is abstract. We expose it as-is through a thin
// subclass so every public mutation can be exercised without dragging
// in Angular DI, signals or a host component.

type TestConfig = { search: string };

class TestMutationService extends TabMutationService<TestConfig> {
  // Re-expose `patchTabConfig` for the test spec. Production subclasses
  // wrap it behind a narrow domain API (setSearchQuery, etc.); the test
  // harness just needs direct access to prove the base behaviour.
  public patchTabConfigForTest(
    id: string,
    updater: (c: TestConfig) => TestConfig,
  ): void {
    this.patchTabConfig(id, updater);
  }
}

function makeTab(
  id: string,
  overrides: Partial<TabItem<TestConfig>> = {},
): TabItem<TestConfig> {
  return {
    id,
    title: `Tab ${id}`,
    autoTitle: true,
    config: { search: '' },
    ...overrides,
  };
}

function makeSavedConfig(
  id: string,
  tabIds: string[],
  overrides: Partial<SavedTabConfig<TestConfig>> = {},
): SavedTabConfig<TestConfig> {
  const tabs = tabIds.map((tid) => makeTab(tid));
  return {
    id,
    name: `Config ${id}`,
    tabs,
    activeTabId: tabs[0]?.id ?? '',
    createdAt: 1_700_000_000,
    ...overrides,
  };
}

function createService(initial: Partial<TabSystemState<TestConfig>> = {}) {
  let state: TabSystemState<TestConfig> = {
    tabs: [makeTab('t1')],
    activeTabId: 't1',
    activeConfigId: null,
    savedTabConfigs: [],
    ...initial,
  };
  const tabStateSignal: TabStateSignal<TestConfig> = Object.assign(
    () => state,
    {
      update: (
        fn: (s: TabSystemState<TestConfig>) => TabSystemState<TestConfig>,
      ) => {
        state = fn(state);
      },
    },
  );
  const defaultConfigFactory = jest.fn<TestConfig, []>(() => ({ search: '' }));
  const onChanged = jest.fn<void, []>();
  const service = new TestMutationService(
    tabStateSignal,
    defaultConfigFactory,
    onChanged,
  );
  return {
    service,
    get state(): TabSystemState<TestConfig> {
      return state;
    },
    onChanged,
    defaultConfigFactory,
  };
}

// ── Tests ─────────────────────────────────────────────────────

describe('TabMutationService', () => {
  describe('setActiveTab', () => {
    it('updates activeTabId', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'a',
      });
      h.service.setActiveTab('b');
      expect(h.state.activeTabId).toBe('b');
    });

    it('fires onChanged', () => {
      const h = createService();
      h.service.setActiveTab('t1');
      expect(h.onChanged).toHaveBeenCalledTimes(1);
    });
  });

  describe('addDefaultTab', () => {
    it('appends a new tab and selects it', () => {
      const h = createService({ tabs: [makeTab('a')], activeTabId: 'a' });
      h.service.addDefaultTab();
      expect(h.state.tabs).toHaveLength(2);
      expect(h.state.activeTabId).toBe(h.state.tabs[1].id);
      expect(h.state.activeTabId).not.toBe('a');
    });

    it('uses defaultConfigFactory for the new tab config', () => {
      const h = createService();
      h.defaultConfigFactory.mockReturnValue({ search: 'seeded' });
      h.service.addDefaultTab();
      const added = h.state.tabs[h.state.tabs.length - 1];
      expect(added.config.search).toBe('seeded');
      expect(added.autoTitle).toBe(true);
      expect(added.title).toBe('New Tab');
    });
  });

  describe('closeTab', () => {
    it('removes the tab', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'a',
      });
      h.service.closeTab('b');
      expect(h.state.tabs.map((t) => t.id)).toEqual(['a']);
    });

    it('refuses to close the last remaining tab (no-op)', () => {
      const h = createService({ tabs: [makeTab('only')], activeTabId: 'only' });
      h.service.closeTab('only');
      expect(h.state.tabs).toHaveLength(1);
      expect(h.state.activeTabId).toBe('only');
    });

    it('picks the next tab as active when the active one is closed', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b'), makeTab('c')],
        activeTabId: 'b',
      });
      h.service.closeTab('b');
      expect(h.state.activeTabId).toBe('c');
    });

    it('picks the previous tab as active when the last tab is closed', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b'), makeTab('c')],
        activeTabId: 'c',
      });
      h.service.closeTab('c');
      expect(h.state.activeTabId).toBe('b');
    });

    it('keeps the current active tab when a non-active tab is closed', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b'), makeTab('c')],
        activeTabId: 'b',
      });
      h.service.closeTab('a');
      expect(h.state.activeTabId).toBe('b');
    });
  });

  describe('updateTabTitle', () => {
    it('sets title and clears autoTitle', () => {
      const h = createService({
        tabs: [makeTab('a', { autoTitle: true })],
        activeTabId: 'a',
      });
      h.service.updateTabTitle('a', 'Renamed');
      expect(h.state.tabs[0].title).toBe('Renamed');
      expect(h.state.tabs[0].autoTitle).toBe(false);
    });

    it('leaves other tabs untouched', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b', { title: 'B original' })],
        activeTabId: 'a',
      });
      h.service.updateTabTitle('a', 'A new');
      expect(h.state.tabs[1].title).toBe('B original');
    });
  });

  describe('setTabColor', () => {
    it('sets color', () => {
      const h = createService();
      h.service.setTabColor('t1', '#ff0000');
      expect(h.state.tabs[0].color).toBe('#ff0000');
    });

    it('clears color when an empty string is passed', () => {
      const h = createService({
        tabs: [makeTab('t1', { color: '#abc' })],
        activeTabId: 't1',
      });
      h.service.setTabColor('t1', '');
      expect(h.state.tabs[0].color).toBeUndefined();
    });
  });

  describe('reorderTab', () => {
    it('moves a tab to a new index', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b'), makeTab('c')],
        activeTabId: 'a',
      });
      h.service.reorderTab('a', 2);
      expect(h.state.tabs.map((t) => t.id)).toEqual(['b', 'c', 'a']);
    });

    it('no-ops on unknown tabId', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'a',
      });
      h.service.reorderTab('missing', 0);
      expect(h.state.tabs.map((t) => t.id)).toEqual(['a', 'b']);
    });

    it('no-ops when the new index equals the old index', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'a',
      });
      h.service.reorderTab('a', 0);
      expect(h.state.tabs.map((t) => t.id)).toEqual(['a', 'b']);
    });
  });

  describe('patchTabConfig', () => {
    it('applies the updater to the tab config', () => {
      const h = createService();
      h.service.patchTabConfigForTest('t1', (c) => ({ ...c, search: 'query' }));
      expect(h.state.tabs[0].config.search).toBe('query');
    });
  });

  // ── Saved configs ─────────────────────────────────────────

  describe('saveTabConfig', () => {
    it('appends a new SavedTabConfig and makes it active', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'b',
      });
      h.service.saveTabConfig('My config');
      const saved = h.state.savedTabConfigs!;
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('My config');
      expect(saved[0].tabs.map((t) => t.id)).toEqual(['a', 'b']);
      expect(saved[0].activeTabId).toBe('b');
      expect(h.state.activeConfigId).toBe(saved[0].id);
    });

    it('deep-copies tabs so later mutations to state.tabs do not leak into the saved config', () => {
      const h = createService({ tabs: [makeTab('a')], activeTabId: 'a' });
      h.service.saveTabConfig('cfg');
      const savedTab = h.state.savedTabConfigs![0].tabs[0];
      expect(savedTab).not.toBe(h.state.tabs[0]); // different reference
    });
  });

  describe('deleteTabConfig', () => {
    it('removes the config from savedTabConfigs', () => {
      const h = createService({
        savedTabConfigs: [
          makeSavedConfig('c1', ['a']),
          makeSavedConfig('c2', ['b']),
        ],
      });
      h.service.deleteTabConfig('c1');
      expect(h.state.savedTabConfigs!.map((c) => c.id)).toEqual(['c2']);
    });

    it('clears activeConfigId when the deleted config was active', () => {
      const h = createService({
        savedTabConfigs: [makeSavedConfig('c1', ['a'])],
        activeConfigId: 'c1',
      });
      h.service.deleteTabConfig('c1');
      expect(h.state.activeConfigId).toBeNull();
    });

    it('keeps activeConfigId when deleting a non-active config', () => {
      const h = createService({
        savedTabConfigs: [
          makeSavedConfig('c1', ['a']),
          makeSavedConfig('c2', ['b']),
        ],
        activeConfigId: 'c2',
      });
      h.service.deleteTabConfig('c1');
      expect(h.state.activeConfigId).toBe('c2');
    });
  });

  describe('renameTabConfig', () => {
    it('renames only the target config', () => {
      const h = createService({
        savedTabConfigs: [
          makeSavedConfig('c1', ['a']),
          makeSavedConfig('c2', ['b']),
        ],
      });
      h.service.renameTabConfig('c2', 'New name');
      expect(h.state.savedTabConfigs!.find((c) => c.id === 'c2')!.name).toBe(
        'New name',
      );
      expect(h.state.savedTabConfigs!.find((c) => c.id === 'c1')!.name).toBe(
        'Config c1',
      );
    });
  });

  describe('removeTabFromConfig', () => {
    it('removes the tab from the config', () => {
      const h = createService({
        savedTabConfigs: [makeSavedConfig('c1', ['a', 'b'])],
      });
      h.service.removeTabFromConfig('c1', 'a');
      expect(h.state.savedTabConfigs![0].tabs.map((t) => t.id)).toEqual(['b']);
    });

    it('no-ops when the removal would leave the config empty', () => {
      const h = createService({
        savedTabConfigs: [makeSavedConfig('c1', ['only'])],
      });
      h.service.removeTabFromConfig('c1', 'only');
      expect(h.state.savedTabConfigs![0].tabs.map((t) => t.id)).toEqual([
        'only',
      ]);
    });

    it('picks a new activeTabId when the active tab was removed', () => {
      const h = createService({
        savedTabConfigs: [
          makeSavedConfig('c1', ['a', 'b'], { activeTabId: 'a' }),
        ],
      });
      h.service.removeTabFromConfig('c1', 'a');
      expect(h.state.savedTabConfigs![0].activeTabId).toBe('b');
    });
  });

  describe('renameTabInConfig', () => {
    it('renames the tab inside the saved config', () => {
      const h = createService({
        savedTabConfigs: [makeSavedConfig('c1', ['a', 'b'])],
      });
      h.service.renameTabInConfig('c1', 'a', 'Renamed');
      const saved = h.state.savedTabConfigs![0];
      expect(saved.tabs.find((t) => t.id === 'a')!.title).toBe('Renamed');
      expect(saved.tabs.find((t) => t.id === 'a')!.autoTitle).toBe(false);
    });
  });

  // ── Move between saved configs ────────────────────────────

  describe('moveTabToConfig', () => {
    it('moves a tab from source to target', () => {
      const h = createService({
        savedTabConfigs: [
          makeSavedConfig('src', ['a', 'b']),
          makeSavedConfig('tgt', ['x']),
        ],
      });
      h.service.moveTabToConfig('src', 'tgt', 'a');
      const src = h.state.savedTabConfigs!.find((c) => c.id === 'src')!;
      const tgt = h.state.savedTabConfigs!.find((c) => c.id === 'tgt')!;
      expect(src.tabs.map((t) => t.id)).toEqual(['b']);
      expect(tgt.tabs.map((t) => t.id)).toEqual(['x', 'a']);
    });

    it('no-ops when the source would be emptied by the move', () => {
      const h = createService({
        savedTabConfigs: [
          makeSavedConfig('src', ['only']),
          makeSavedConfig('tgt', ['x']),
        ],
      });
      h.service.moveTabToConfig('src', 'tgt', 'only');
      const src = h.state.savedTabConfigs!.find((c) => c.id === 'src')!;
      const tgt = h.state.savedTabConfigs!.find((c) => c.id === 'tgt')!;
      expect(src.tabs.map((t) => t.id)).toEqual(['only']);
      expect(tgt.tabs.map((t) => t.id)).toEqual(['x']);
    });

    it('adjusts source.activeTabId when the active tab was moved', () => {
      const h = createService({
        savedTabConfigs: [
          makeSavedConfig('src', ['a', 'b'], { activeTabId: 'a' }),
          makeSavedConfig('tgt', ['x']),
        ],
      });
      h.service.moveTabToConfig('src', 'tgt', 'a');
      const src = h.state.savedTabConfigs!.find((c) => c.id === 'src')!;
      expect(src.activeTabId).toBe('b');
    });

    it('no-ops when sourceConfigId is unknown', () => {
      const initial = [
        makeSavedConfig('src', ['a']),
        makeSavedConfig('tgt', ['x']),
      ];
      const h = createService({ savedTabConfigs: initial });
      h.service.moveTabToConfig('missing', 'tgt', 'a');
      expect(h.state.savedTabConfigs).toEqual(initial);
    });

    it('no-ops when the tab is not in the source config', () => {
      const initial = [
        makeSavedConfig('src', ['a']),
        makeSavedConfig('tgt', ['x']),
      ];
      const h = createService({ savedTabConfigs: initial });
      h.service.moveTabToConfig('src', 'tgt', 'ghost');
      expect(h.state.savedTabConfigs).toEqual(initial);
    });
  });

  // ── Move current active tab into a saved config ───────────

  describe('moveActiveTabToConfig', () => {
    it('appends the moved tab (with a fresh id) to the target config', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'a',
        savedTabConfigs: [makeSavedConfig('tgt', ['x'])],
      });
      h.service.moveActiveTabToConfig('a', 'tgt');
      const tgt = h.state.savedTabConfigs!.find((c) => c.id === 'tgt')!;
      expect(tgt.tabs).toHaveLength(2);
      expect(tgt.tabs.map((t) => t.title)).toEqual(['Tab x', 'Tab a']);
      // the moved copy gets a new id (dedup) — not the original 'a'
      expect(tgt.tabs[1].id).not.toBe('a');
    });

    it('removes the moved tab from the open strip', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'a',
        savedTabConfigs: [makeSavedConfig('tgt', ['x'])],
      });
      h.service.moveActiveTabToConfig('a', 'tgt');
      expect(h.state.tabs.map((t) => t.id)).toEqual(['b']);
      expect(h.state.activeTabId).toBe('b');
    });

    it('creates a fresh default tab + clears activeConfigId when the strip would become empty', () => {
      const h = createService({
        tabs: [makeTab('only')],
        activeTabId: 'only',
        savedTabConfigs: [makeSavedConfig('tgt', ['x'])],
        activeConfigId: 'src-config',
      });
      h.service.moveActiveTabToConfig('only', 'tgt');
      expect(h.state.tabs).toHaveLength(1);
      expect(h.state.tabs[0].id).not.toBe('only');
      expect(h.state.tabs[0].title).toBe('New Tab');
      expect(h.state.tabs[0].autoTitle).toBe(true);
      expect(h.state.activeTabId).toBe(h.state.tabs[0].id);
      expect(h.state.activeConfigId).toBeNull();
    });

    it('mirrors removal into the active saved config when target !== active', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'a',
        savedTabConfigs: [
          makeSavedConfig('active-cfg', ['a', 'b'], { activeTabId: 'a' }),
          makeSavedConfig('tgt', ['x']),
        ],
        activeConfigId: 'active-cfg',
      });
      h.service.moveActiveTabToConfig('a', 'tgt');
      const activeCfg = h.state.savedTabConfigs!.find(
        (c) => c.id === 'active-cfg',
      )!;
      // 'a' removed from the active config and activeTabId bumped to 'b'
      expect(activeCfg.tabs.map((t) => t.id)).toEqual(['b']);
      expect(activeCfg.activeTabId).toBe('b');
    });

    it('when target === active config, syncActiveConfig ends up mirroring the post-move strip', () => {
      // Subtle interaction worth pinning down:
      //
      // 1. `moveActiveTabToConfig` adds the moved copy to the target
      //    config (because it matches `targetConfigId`) and skips the
      //    active-branch mirror removal (target hit first, `return`
      //    short-circuits).
      // 2. The `update()` helper then runs `syncActiveConfig`, which
      //    authoritatively replaces the active config's tabs with the
      //    current strip.
      // 3. After the move the strip has the moved tab removed, so the
      //    sync overwrites the just-added copy — the observable result
      //    is that the active config ends up mirroring the strip, not
      //    retaining the moved copy.
      //
      // Product-wise this is fine: moving a tab from the active strip
      // into the config that already mirrors that strip is a no-op that
      // effectively just closes the tab. The UI shouldn't offer this
      // target in the move-to dropdown (it would be the "active" config
      // for the user). Test captures the behaviour so a future refactor
      // of either method doesn't silently change semantics.
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'a',
        savedTabConfigs: [makeSavedConfig('cfg', ['a', 'b'])],
        activeConfigId: 'cfg',
      });
      h.service.moveActiveTabToConfig('a', 'cfg');
      const cfg = h.state.savedTabConfigs!.find((c) => c.id === 'cfg')!;
      expect(cfg.tabs.map((t) => t.id)).toEqual(['b']);
      expect(h.state.tabs.map((t) => t.id)).toEqual(['b']);
    });

    it('keeps the active-config mirror unchanged when there is no activeConfigId', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'a',
        savedTabConfigs: [makeSavedConfig('tgt', ['x'])],
        activeConfigId: null,
      });
      h.service.moveActiveTabToConfig('a', 'tgt');
      expect(
        h.state.savedTabConfigs!.find((c) => c.id === 'tgt')!.tabs,
      ).toHaveLength(2);
    });

    it('no-ops when the tab id is not in the open strip', () => {
      const h = createService({
        tabs: [makeTab('a')],
        activeTabId: 'a',
        savedTabConfigs: [makeSavedConfig('tgt', ['x'])],
      });
      h.service.moveActiveTabToConfig('ghost', 'tgt');
      expect(h.state.tabs).toHaveLength(1);
      expect(h.state.savedTabConfigs![0].tabs.map((t) => t.id)).toEqual(['x']);
    });
  });

  // ── applyTabConfig / newConfig ────────────────────────────

  describe('applyTabConfig', () => {
    it('replaces the strip with a deep copy of the saved tabs + sets activeConfigId', () => {
      const cfg = makeSavedConfig('c1', ['x', 'y'], { activeTabId: 'y' });
      const h = createService({ tabs: [makeTab('old')], activeTabId: 'old' });
      h.service.applyTabConfig(cfg);
      expect(h.state.tabs.map((t) => t.id)).toEqual(['x', 'y']);
      expect(h.state.activeTabId).toBe('y');
      expect(h.state.activeConfigId).toBe('c1');
      // deep copy — mutating the restored tabs must not leak into the cfg object
      expect(h.state.tabs[0]).not.toBe(cfg.tabs[0]);
    });

    it('falls back to the first tab when the saved activeTabId is missing', () => {
      const cfg = makeSavedConfig('c1', ['x', 'y']);
      cfg.activeTabId = undefined as unknown as string;
      const h = createService();
      h.service.applyTabConfig(cfg);
      expect(h.state.activeTabId).toBe('x');
    });
  });

  describe('newConfig', () => {
    it('resets the strip to a single default tab and clears activeConfigId', () => {
      const h = createService({
        tabs: [makeTab('a'), makeTab('b')],
        activeTabId: 'b',
        activeConfigId: 'c1',
        savedTabConfigs: [makeSavedConfig('c1', ['a', 'b'])],
      });
      h.service.newConfig();
      expect(h.state.tabs).toHaveLength(1);
      expect(h.state.tabs[0].title).toBe('New Tab');
      expect(h.state.tabs[0].autoTitle).toBe(true);
      expect(h.state.activeConfigId).toBeNull();
      // savedTabConfigs untouched
      expect(h.state.savedTabConfigs).toHaveLength(1);
    });
  });

  // ── Auto-sync (syncActiveConfig) ──────────────────────────

  describe('auto-sync when activeConfigId is set', () => {
    it('mirrors a title rename into the active saved config', () => {
      const h = createService({
        tabs: [makeTab('a', { title: 'A' }), makeTab('b')],
        activeTabId: 'a',
        savedTabConfigs: [makeSavedConfig('c1', ['a', 'b'])],
        activeConfigId: 'c1',
      });
      h.service.updateTabTitle('a', 'Renamed');
      const mirrored = h.state.savedTabConfigs![0].tabs.find(
        (t) => t.id === 'a',
      )!;
      expect(mirrored.title).toBe('Renamed');
    });

    it('mirrors an add into the active saved config', () => {
      const h = createService({
        tabs: [makeTab('a')],
        activeTabId: 'a',
        savedTabConfigs: [makeSavedConfig('c1', ['a'])],
        activeConfigId: 'c1',
      });
      h.service.addDefaultTab();
      const mirrored = h.state.savedTabConfigs![0];
      expect(mirrored.tabs).toHaveLength(2);
      expect(mirrored.activeTabId).toBe(h.state.activeTabId);
    });

    it('does NOT mirror when activeConfigId is null', () => {
      const h = createService({
        tabs: [makeTab('a')],
        activeTabId: 'a',
        savedTabConfigs: [makeSavedConfig('c1', ['a'])],
        activeConfigId: null,
      });
      h.service.updateTabTitle('a', 'Renamed');
      const mirrored = h.state.savedTabConfigs![0].tabs.find(
        (t) => t.id === 'a',
      )!;
      expect(mirrored.title).toBe('Tab a'); // original title preserved
    });

    it('only mirrors into the active config, not siblings', () => {
      const h = createService({
        tabs: [makeTab('a', { title: 'A' })],
        activeTabId: 'a',
        savedTabConfigs: [
          makeSavedConfig('active', ['a']),
          makeSavedConfig('other', ['a'], { name: 'Other' }),
        ],
        activeConfigId: 'active',
      });
      h.service.updateTabTitle('a', 'Renamed');
      const active = h.state.savedTabConfigs!.find((c) => c.id === 'active')!;
      const other = h.state.savedTabConfigs!.find((c) => c.id === 'other')!;
      expect(active.tabs[0].title).toBe('Renamed');
      expect(other.tabs[0].title).toBe('Tab a');
    });
  });

  // ── onChanged callback ────────────────────────────────────

  describe('onChanged', () => {
    it('fires once per mutation', () => {
      const h = createService();
      h.service.setActiveTab('t1');
      h.service.addDefaultTab();
      h.service.updateTabTitle('t1', 'new');
      expect(h.onChanged).toHaveBeenCalledTimes(3);
    });

    it('fires even when the mutation is a no-op inside the updater', () => {
      // The current contract is "update() always runs the updater then notifies".
      // If that changes (e.g. memoisation), this test catches it.
      const h = createService({ tabs: [makeTab('only')], activeTabId: 'only' });
      h.service.closeTab('only'); // no-op (last tab)
      expect(h.onChanged).toHaveBeenCalledTimes(1);
    });
  });
});
