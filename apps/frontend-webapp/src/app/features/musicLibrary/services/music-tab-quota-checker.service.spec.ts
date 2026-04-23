import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MusicTabQuotaChecker } from './music-tab-quota-checker.service';
import { MusicLibraryStateService } from './music-library-state.service';
import { UserContextService } from '../../../core/services/user-context.service';
import type { TPlatformRole } from '@sh3pherd/shared-types';
import type { TabSystemState } from '../../../shared/configurable-tab-bar';
import type { MusicTabConfig } from '../music-library-types';

type State = TabSystemState<MusicTabConfig>;

function makeConfig(id: string, tabCount: number) {
  return {
    id,
    name: id,
    activeTabId: `${id}-0`,
    createdAt: 0,
    tabs: Array.from({ length: tabCount }, (_, i) => ({
      id: `${id}-${i}`,
      title: `T${i}`,
      autoTitle: false,
      config: {
        searchConfig: {
          searchMode: 'repertoire' as const,
          target: { mode: 'me' as const },
          dataFilterActive: false,
        },
        searchQuery: '',
      },
    })),
  };
}

function setup(
  opts: { plan?: TPlatformRole | null; state?: Partial<State> } = {},
) {
  const plan = signal<TPlatformRole | null>(opts.plan ?? null);
  const state: State = {
    tabs: opts.state?.tabs ?? [],
    activeTabId: opts.state?.activeTabId ?? '',
    activeConfigId: opts.state?.activeConfigId ?? null,
    savedTabConfigs: opts.state?.savedTabConfigs ?? [],
  };
  const tabState = Object.assign(() => state, { update: jest.fn() });

  TestBed.configureTestingModule({
    providers: [
      MusicTabQuotaChecker,
      { provide: UserContextService, useValue: { plan } },
      { provide: MusicLibraryStateService, useValue: { tabState } },
    ],
  });

  return { checker: TestBed.inject(MusicTabQuotaChecker), plan };
}

describe('MusicTabQuotaChecker', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('plan → maxTabs / maxConfigs', () => {
    it('treats a null plan as the most restrictive (3 tabs / 0 configs)', () => {
      const { checker } = setup({ plan: null });
      expect(checker.maxTabs()).toBe(3);
      expect(checker.maxConfigs()).toBe(0);
    });

    it('artist_free → 3 tabs / 0 configs', () => {
      const { checker } = setup({ plan: 'artist_free' });
      expect(checker.maxTabs()).toBe(3);
      expect(checker.maxConfigs()).toBe(0);
    });

    it('artist_pro → 10 tabs / 5 configs', () => {
      const { checker } = setup({ plan: 'artist_pro' });
      expect(checker.maxTabs()).toBe(10);
      expect(checker.maxConfigs()).toBe(5);
    });

    it('artist_max → unlimited (-1) on both', () => {
      const { checker } = setup({ plan: 'artist_max' });
      expect(checker.maxTabs()).toBe(-1);
      expect(checker.maxConfigs()).toBe(-1);
    });

    it('recomputes when the plan signal changes', () => {
      const { checker, plan } = setup({ plan: 'artist_free' });
      expect(checker.maxTabs()).toBe(3);
      plan.set('artist_pro');
      expect(checker.maxTabs()).toBe(10);
    });
  });

  describe('canAddTab', () => {
    it('returns true when under the per-plan limit', () => {
      const { checker } = setup({
        plan: 'artist_free',
        state: {
          tabs: [makeConfig('_', 2).tabs[0], makeConfig('_', 2).tabs[1]],
        },
      });
      expect(checker.canAddTab()).toBe(true);
    });

    it('returns false when the plan limit is reached', () => {
      const { checker } = setup({
        plan: 'artist_free',
        state: { tabs: makeConfig('_', 3).tabs },
      });
      expect(checker.canAddTab()).toBe(false);
    });

    it('always allows on unlimited plans', () => {
      const { checker } = setup({
        plan: 'artist_max',
        state: { tabs: makeConfig('_', 50).tabs },
      });
      expect(checker.canAddTab()).toBe(true);
    });
  });

  describe('canAddConfig', () => {
    it('always false on artist_free (maxConfigs=0, feature unavailable)', () => {
      const { checker } = setup({ plan: 'artist_free' });
      expect(checker.canAddConfig()).toBe(false);
    });

    it('true under quota on artist_pro', () => {
      const { checker } = setup({
        plan: 'artist_pro',
        state: { savedTabConfigs: [makeConfig('c1', 1), makeConfig('c2', 1)] },
      });
      expect(checker.canAddConfig()).toBe(true);
    });

    it('false once quota is hit on artist_pro', () => {
      const { checker } = setup({
        plan: 'artist_pro',
        state: {
          savedTabConfigs: Array.from({ length: 5 }, (_, i) =>
            makeConfig(`c${i}`, 1),
          ),
        },
      });
      expect(checker.canAddConfig()).toBe(false);
    });
  });

  describe('isConfigFull / canMoveToConfig', () => {
    it('returns true when target config already has maxTabs tabs', () => {
      const { checker } = setup({
        plan: 'artist_pro',
        state: { savedTabConfigs: [makeConfig('c1', 10)] },
      });
      expect(checker.isConfigFull('c1')).toBe(true);
      expect(checker.canMoveToConfig('c1')).toBe(false);
    });

    it('returns false when target config is under quota', () => {
      const { checker } = setup({
        plan: 'artist_pro',
        state: { savedTabConfigs: [makeConfig('c1', 3)] },
      });
      expect(checker.isConfigFull('c1')).toBe(false);
      expect(checker.canMoveToConfig('c1')).toBe(true);
    });

    it('returns false when the config does not exist (no-op guard)', () => {
      const { checker } = setup({ plan: 'artist_pro' });
      expect(checker.isConfigFull('unknown')).toBe(false);
    });

    it('always allows moves on unlimited plans', () => {
      const { checker } = setup({
        plan: 'artist_max',
        state: { savedTabConfigs: [makeConfig('c1', 100)] },
      });
      expect(checker.canMoveToConfig('c1')).toBe(true);
    });
  });

  describe('savedConfigsWithLock', () => {
    it('locks each config that has reached maxTabs', () => {
      const { checker } = setup({
        plan: 'artist_pro',
        state: {
          savedTabConfigs: [makeConfig('under', 3), makeConfig('full', 10)],
        },
      });
      const enriched = checker.savedConfigsWithLock();
      expect(enriched.map((c) => ({ id: c.id, locked: c.locked }))).toEqual([
        { id: 'under', locked: false },
        { id: 'full', locked: true },
      ]);
    });

    it('never locks on unlimited plans', () => {
      const { checker } = setup({
        plan: 'artist_max',
        state: { savedTabConfigs: [makeConfig('c1', 50)] },
      });
      expect(checker.savedConfigsWithLock()[0].locked).toBe(false);
    });
  });
});
