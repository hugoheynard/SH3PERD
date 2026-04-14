/**
 * Quota types — shared between backend and frontend.
 *
 * The backend uses these for enforcement (QuotaService),
 * the frontend uses them for display (PlanUsageComponent)
 * and credit pack catalogue.
 */

/**
 * A countable resource that quotas can limit.
 *
 * Single source of truth — imported by both QuotaLimits.ts (backend)
 * and credit-pack.types.ts (shared-types).
 */
export const QUOTA_RESOURCES = [
  'repertoire_entry',
  'track_upload',
  'track_version',
  'playlist',
  'search_tab',
  'search_tab_items',
  'master_standard',
  'master_ai',
  'pitch_shift',
  'storage_bytes',
  'org_node',
  'active_contract',
  'company_member',
  'guest_user',
  'active_event',
] as const;

export type TQuotaResource = (typeof QUOTA_RESOURCES)[number];

/** How the counter resets. */
export type TQuotaPeriod = 'monthly' | 'lifetime';
