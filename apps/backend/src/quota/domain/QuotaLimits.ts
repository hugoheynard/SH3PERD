/**
 * Quota limits config — pure data, no I/O, no DI.
 *
 * Defines how much each SaaS plan allows per resource.
 * Can be imported anywhere (domain, application, tests) without
 * pulling in any NestJS or MongoDB dependency.
 *
 * Convention:
 * - A resource NOT listed for a plan = unlimited (no limit).
 * - `limit: -1` = explicitly unlimited (same effect, for readability).
 * - `limit: 0` = feature not available on this plan.
 */

import type { TPlatformRole } from '@sh3pherd/shared-types';

/** A countable resource that quotas can limit. */
export type TQuotaResource =
  | 'repertoire_entry'
  | 'track_upload'
  | 'track_version'
  | 'playlist'
  | 'search_tab'
  | 'search_tab_items'
  | 'master_standard'
  | 'master_ai'
  | 'pitch_shift'
  | 'storage_bytes'
  | 'org_node'
  | 'active_contract'
  | 'company_member'
  | 'guest_user'
  | 'active_event';

/** How the counter resets. */
export type TQuotaPeriod = 'monthly' | 'lifetime';

export type TQuotaLimit = {
  resource: TQuotaResource;
  period: TQuotaPeriod;
  /** Max allowed count. -1 = unlimited. 0 = not available. */
  limit: number;
};

// ── Plan quotas ─────────────────────────────────────────────

export const PLAN_QUOTAS: Record<TPlatformRole, TQuotaLimit[]> = {

  // ═══════════════════════════════════════════════════════════
  // ARTIST PLANS
  // ═══════════════════════════════════════════════════════════

  artist_free: [
    { resource: 'repertoire_entry',  period: 'lifetime', limit: 50 },
    { resource: 'track_upload',      period: 'lifetime', limit: 50 },
    { resource: 'track_version',     period: 'lifetime', limit: 2 },    // per track
    { resource: 'playlist',          period: 'lifetime', limit: 3 },
    { resource: 'search_tab',        period: 'lifetime', limit: 1 },
    { resource: 'search_tab_items',  period: 'lifetime', limit: 3 },    // tabs per search tab
    { resource: 'master_standard',   period: 'monthly',  limit: 3 },
    { resource: 'master_ai',         period: 'monthly',  limit: 0 },
    { resource: 'pitch_shift',       period: 'monthly',  limit: 3 },
    { resource: 'storage_bytes',     period: 'lifetime', limit: 500 * 1024 * 1024 }, // 500 Mo
  ],

  artist_pro: [
    { resource: 'repertoire_entry',  period: 'lifetime', limit: -1 },
    { resource: 'track_upload',      period: 'lifetime', limit: -1 },
    { resource: 'track_version',     period: 'lifetime', limit: 5 },    // per track
    { resource: 'playlist',          period: 'lifetime', limit: -1 },
    { resource: 'search_tab',        period: 'lifetime', limit: 10 },
    { resource: 'search_tab_items',  period: 'lifetime', limit: 5 },    // tabs per search tab
    { resource: 'master_standard',   period: 'monthly',  limit: -1 },
    { resource: 'master_ai',         period: 'monthly',  limit: 10 },
    { resource: 'pitch_shift',       period: 'monthly',  limit: -1 },
    { resource: 'storage_bytes',     period: 'lifetime', limit: 5 * 1024 * 1024 * 1024 }, // 5 Go
  ],

  artist_max: [
    { resource: 'master_ai',         period: 'monthly',  limit: 50 },
    { resource: 'storage_bytes',     period: 'lifetime', limit: 20 * 1024 * 1024 * 1024 }, // 20 Go
    // Everything else: unlimited (not listed)
  ],

  // ═══════════════════════════════════════════════════════════
  // COMPANY PLANS
  // ═══════════════════════════════════════════════════════════

  company_free: [
    { resource: 'org_node',          period: 'lifetime', limit: 20 },
    { resource: 'active_contract',   period: 'lifetime', limit: 10 },
    { resource: 'company_member',    period: 'lifetime', limit: 5 },
    { resource: 'guest_user',        period: 'lifetime', limit: 3 },
    { resource: 'active_event',      period: 'lifetime', limit: 0 },
  ],

  company_pro: [
    { resource: 'active_contract',   period: 'lifetime', limit: 50 },
    { resource: 'company_member',    period: 'lifetime', limit: 25 },
    { resource: 'guest_user',        period: 'lifetime', limit: 15 },
    { resource: 'active_event',      period: 'lifetime', limit: 10 },
    // org_node: unlimited (not listed)
  ],

  company_business: [
    { resource: 'storage_bytes',     period: 'lifetime', limit: 100 * 1024 * 1024 * 1024 }, // 100 Go
    // Everything else: unlimited (not listed)
  ],
};

// ── Helpers ─────────────────────────────────────────────────

/**
 * Get the limit for a specific resource on a given plan.
 * Returns -1 (unlimited) if the resource is not listed for the plan.
 */
export function getQuotaLimit(plan: TPlatformRole, resource: TQuotaResource): TQuotaLimit | null {
  return PLAN_QUOTAS[plan]?.find((q) => q.resource === resource) ?? null;
}

/**
 * Compute the period key for a given resource.
 * - `'lifetime'` for lifetime quotas
 * - `'YYYY-MM'` for monthly quotas (current month)
 */
export function computePeriodKey(period: TQuotaPeriod): string {
  if (period === 'lifetime') return 'lifetime';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
