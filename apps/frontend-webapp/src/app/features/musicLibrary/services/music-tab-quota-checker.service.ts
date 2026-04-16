import { computed, inject, Injectable } from '@angular/core';
import type { TPlatformRole } from '@sh3pherd/shared-types';
import type { SavedTabConfig } from '../../../shared/configurable-tab-bar';
import { UserContextService } from '../../../core/services/user-context.service';
import { MusicLibraryStateService } from './music-library-state.service';
import type { MusicTabConfig } from '../music-library-types';

/**
 * Per-plan maximum number of tabs — applies to both the open tab strip and
 * each saved config.
 *
 * `null` is treated as the most restrictive plan so we can't blow past the
 * quota during the async window between page load and the `/quota/me`
 * response landing.
 */
function maxTabsForPlan(plan: TPlatformRole | null): number {
  if (plan === null || plan === 'artist_free') return 3;
  if (plan === 'artist_pro') return 10;
  return -1; // artist_max / company_* → unlimited
}

/**
 * Per-plan maximum number of saved configs. Free = 0 doubles as the
 * "feature not available" gate — the config panel collapses its save
 * affordance whenever the quota is reached, so the Free case and the
 * Pro-at-cap case share one mechanism.
 */
function maxConfigsForPlan(plan: TPlatformRole | null): number {
  if (plan === null || plan === 'artist_free') return 0;
  if (plan === 'artist_pro') return 5;
  return -1; // artist_max / company_* → unlimited
}

/**
 * Single source of truth for every "can this music-tab operation go through?"
 * question in the app. Both the UI (via enriched `savedConfigsWithLock`) and
 * the mutation service (via `canAddTab` / `canMoveToConfig`) read from this
 * class, so the tab bar's lock affordances and the actual state mutations
 * can never disagree.
 *
 * Stateful singleton — reads the live plan from `UserContextService` and the
 * live tab / config counts from `MusicLibraryStateService`. Every check is a
 * cheap signal read; no memoisation needed.
 */
@Injectable({ providedIn: 'root' })
export class MusicTabQuotaChecker {
  private readonly userCtx = inject(UserContextService);
  private readonly state = inject(MusicLibraryStateService);

  /** Maximum tabs per scope (strip + each config) allowed by the current plan. `-1` means unlimited. */
  readonly maxTabs = computed(() => maxTabsForPlan(this.userCtx.plan()));

  /** Maximum number of saved configs allowed by the current plan. `0` means feature unavailable; `-1` means unlimited. */
  readonly maxConfigs = computed(() => maxConfigsForPlan(this.userCtx.plan()));

  /** True when the plan has a finite per-scope tab limit. */
  private readonly hasTabLimit = computed(() => this.maxTabs() !== -1);

  /** True when the plan has a finite saved-config count limit. */
  private readonly hasConfigLimit = computed(() => this.maxConfigs() !== -1);

  /** Can the user create another tab in the open strip right now? */
  canAddTab(): boolean {
    if (!this.hasTabLimit()) return true;
    return this.state.tabState().tabs.length < this.maxTabs();
  }

  /** Can the user create another saved config right now? */
  canAddConfig(): boolean {
    if (!this.hasConfigLimit()) return true;
    return (this.state.tabState().savedTabConfigs?.length ?? 0) < this.maxConfigs();
  }

  /** Is the given saved config at or over its per-config tab quota? */
  isConfigFull(configId: string): boolean {
    if (!this.hasTabLimit()) return false;
    const cfg = this.state.tabState().savedTabConfigs?.find(c => c.id === configId);
    return !!cfg && cfg.tabs.length >= this.maxTabs();
  }

  /** Can a tab be moved into `configId`? Inverse of `isConfigFull`. */
  canMoveToConfig(configId: string): boolean {
    return !this.isConfigFull(configId);
  }

  /**
   * Saved configs enriched with a `locked` flag so the tab bar's move-to
   * surfaces can render each target without any separate lookup table. The
   * flag recomputes automatically whenever the plan changes or the
   * underlying configs mutate.
   *
   * Bind this signal straight to `<sh3-configurable-tab-bar [savedConfigs]>`
   * in place of `selector.savedTabConfigs()`.
   */
  readonly savedConfigsWithLock = computed<SavedTabConfig<MusicTabConfig>[]>(() => {
    const max = this.maxTabs();
    const hasLimit = max !== -1;
    return (this.state.tabState().savedTabConfigs ?? []).map(c => ({
      ...c,
      locked: hasLimit && c.tabs.length >= max,
    }));
  });
}
